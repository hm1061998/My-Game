import type { AudioPreferences } from "./preferences"
import officeAmbienceUrl from "./office-quiet-traffic.mp3?url"

export type GameSound = "clue" | "dialogue" | "correct" | "incorrect" | "checkpoint" | "scanner"

const NOTES: Record<GameSound, readonly number[]> = {
  clue: [587.33, 783.99, 987.77],
  dialogue: [392, 523.25],
  correct: [523.25, 659.25, 783.99],
  incorrect: [246.94, 196],
  checkpoint: [392, 523.25, 659.25],
  scanner: [174.61, 146.83],
}

const AMBIENCE_CROSSFADE_SECONDS = 0.45

export class GameAudio {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private ambienceGain: GainNode | null = null
  private effectsGain: GainNode | null = null
  private ambienceSource: AudioBufferSourceNode | null = null
  private readonly ambienceSources = new Map<AudioBufferSourceNode, { gain: GainNode; filter?: BiquadFilterNode }>()
  private recordedAmbience: AudioBuffer | null = null
  private ambienceLoad: Promise<AudioBuffer | null> | null = null
  private preferences: AudioPreferences = { muted: false, ambience: true, effects: true }

  setPreferences(preferences: AudioPreferences) {
    this.preferences = preferences
    this.applyLevels()
    if (this.context?.state === "running") this.syncAmbience()
  }

  async activate(): Promise<boolean> {
    if (typeof window === "undefined" || !window.AudioContext) return false
    try {
      if (!this.context) this.createContext()
      if (!this.context) return false
      if (this.context.state !== "running") await this.context.resume()
      this.applyLevels()
      this.syncAmbience()
      return this.context.state === "running"
    } catch {
      return false
    }
  }

  play(sound: GameSound) {
    const context = this.context
    if (!context || context.state !== "running" || this.preferences.muted || !this.preferences.effects || !this.effectsGain)
      return
    const notes = NOTES[sound]
    const start = context.currentTime
    const interval = sound === "scanner" ? 0.095 : 0.11
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const envelope = context.createGain()
      const onset = start + index * interval
      const duration = sound === "dialogue" ? 0.12 : 0.18
      oscillator.type = sound === "scanner" || sound === "incorrect" ? "triangle" : "sine"
      oscillator.frequency.setValueAtTime(frequency, onset)
      envelope.gain.setValueAtTime(0.0001, onset)
      envelope.gain.linearRampToValueAtTime(0.42, onset + 0.018)
      envelope.gain.exponentialRampToValueAtTime(0.0001, onset + duration)
      oscillator.connect(envelope)
      envelope.connect(this.effectsGain!)
      oscillator.start(onset)
      oscillator.stop(onset + duration + 0.01)
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect() }
    })
  }

  suspend() {
    if (this.context?.state === "running") void this.context.suspend()
  }

  close() {
    this.stopAmbience()
    if (this.context) void this.context.close()
    this.context = null
    this.master = null
    this.ambienceGain = null
    this.effectsGain = null
    this.recordedAmbience = null
    this.ambienceLoad = null
  }

  private createContext() {
    const context = new window.AudioContext()
    const master = context.createGain()
    const ambience = context.createGain()
    const effects = context.createGain()
    ambience.connect(master)
    effects.connect(master)
    master.connect(context.destination)
    this.context = context
    this.master = master
    this.ambienceGain = ambience
    this.effectsGain = effects
    this.applyLevels()
  }

  private createProceduralAmbienceBuffer() {
    const context = this.context
    if (!context) return null
    const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate)
    const channel = buffer.getChannelData(0)
    let lowFrequency = 0
    for (let index = 0; index < channel.length; index += 1) {
      lowFrequency = lowFrequency * 0.96 + (Math.random() * 2 - 1) * 0.04
      channel[index] = lowFrequency
    }
    return buffer
  }

  private startAmbienceSource(buffer: AudioBuffer, initialGain: number, filtered = false) {
    const context = this.context
    const output = this.ambienceGain
    if (!context || !output) return null
    const source = context.createBufferSource()
    const gain = context.createGain()
    const filter = filtered ? context.createBiquadFilter() : undefined
    source.buffer = buffer
    source.loop = true
    gain.gain.setValueAtTime(initialGain, context.currentTime)
    if (filter) {
      filter.type = "lowpass"
      filter.frequency.value = 380
      source.connect(filter)
      filter.connect(gain)
    } else {
      source.connect(gain)
    }
    gain.connect(output)
    source.onended = () => {
      source.disconnect()
      filter?.disconnect()
      gain.disconnect()
      this.ambienceSources.delete(source)
      if (this.ambienceSource === source) this.ambienceSource = null
    }
    this.ambienceSources.set(source, { gain, filter })
    source.start()
    return source
  }

  private startProceduralFallback() {
    if (this.ambienceSource) return
    const buffer = this.createProceduralAmbienceBuffer()
    if (!buffer) return
    const source = this.startAmbienceSource(buffer, 1, true)
    if (source) this.ambienceSource = source
  }

  private replaceAmbience(buffer: AudioBuffer) {
    const context = this.context
    if (!context || context.state !== "running" || this.ambienceSource?.buffer === buffer) return
    const previous = this.ambienceSource
    const next = this.startAmbienceSource(buffer, 0)
    if (!next) return
    const now = context.currentTime
    this.ambienceSources.get(next)?.gain.gain.linearRampToValueAtTime(1, now + AMBIENCE_CROSSFADE_SECONDS)
    const previousGain = previous ? this.ambienceSources.get(previous)?.gain : undefined
    if (previous && previousGain) {
      previousGain.gain.cancelScheduledValues(now)
      previousGain.gain.setValueAtTime(previousGain.gain.value, now)
      previousGain.gain.linearRampToValueAtTime(0, now + AMBIENCE_CROSSFADE_SECONDS)
      try { previous.stop(now + AMBIENCE_CROSSFADE_SECONDS + 0.02) } catch { /* Already stopping. */ }
    }
    this.ambienceSource = next
  }

  private async loadRecordedAmbience() {
    const context = this.context
    if (!context) return null
    if (this.recordedAmbience) return this.recordedAmbience
    if (this.ambienceLoad) return this.ambienceLoad

    const attempt = (async () => {
      try {
        // Only called by syncAmbience after activate() resumes audio following a user gesture.
        const response = await fetch(officeAmbienceUrl)
        if (!response.ok) throw new Error(`Ambience request failed (${response.status})`)
        const buffer = await context.decodeAudioData(await response.arrayBuffer())
        if (this.context !== context) return null
        this.recordedAmbience = buffer
        if (context.state === "running" && !this.preferences.muted && this.preferences.ambience)
          this.replaceAmbience(buffer)
        return buffer
      } catch {
        return null
      }
    })()
    this.ambienceLoad = attempt
    const buffer = await attempt
    if (this.ambienceLoad === attempt) this.ambienceLoad = buffer ? attempt : null
    return buffer
  }

  private applyLevels() {
    if (!this.context || !this.master || !this.ambienceGain || !this.effectsGain) return
    const now = this.context.currentTime
    this.master.gain.setTargetAtTime(this.preferences.muted ? 0 : 0.42, now, 0.04)
    // The approved recording is much quieter than the procedural fallback; match its output level.
    this.ambienceGain.gain.setTargetAtTime(this.preferences.ambience ? 0.24 : 0, now, 0.08)
    this.effectsGain.gain.setTargetAtTime(this.preferences.effects ? 0.2 : 0, now, 0.025)
  }

  private syncAmbience() {
    const context = this.context
    if (!context || context.state !== "running" || this.preferences.muted || !this.preferences.ambience) {
      this.stopAmbience()
      return
    }
    if (!this.ambienceSource) {
      if (this.recordedAmbience) this.replaceAmbience(this.recordedAmbience)
      else this.startProceduralFallback()
    }
    if (!this.recordedAmbience) void this.loadRecordedAmbience()
  }

  private stopAmbience() {
    for (const source of this.ambienceSources.keys()) {
      try { source.stop() } catch { /* Already stopped. */ }
      source.disconnect()
    }
    for (const { gain, filter } of this.ambienceSources.values()) {
      filter?.disconnect()
      gain.disconnect()
    }
    this.ambienceSources.clear()
    this.ambienceSource = null
  }
}

export const gameAudio = new GameAudio()
