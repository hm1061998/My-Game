import { afterEach, describe, expect, it, vi } from "vitest"
import { GameAudio } from "./gameAudio"
import { DEFAULT_AUDIO_PREFERENCES } from "./preferences"

class FakeAudioParam {
  value = 1
  setValueAtTime(value: number) { this.value = value }
  setTargetAtTime(value: number) { this.value = value }
  linearRampToValueAtTime(value: number) { this.value = value }
  cancelScheduledValues() {}
}

class FakeAudioNode {
  connect() {}
  disconnect() {}
}

class FakeAudioBufferSource extends FakeAudioNode {
  buffer: AudioBuffer | null = null
  loop = false
  onended: (() => void) | null = null
  started = false
  stopped = false
  start() { this.started = true }
  stop() { this.stopped = true; this.onended?.() }
}

const decodedBuffer = { duration: 120 } as AudioBuffer
const sources: FakeAudioBufferSource[] = []
const contexts: FakeAudioContext[] = []

class FakeAudioContext {
  state: AudioContextState = "suspended"
  currentTime = 1
  sampleRate = 8000
  destination = new FakeAudioNode() as unknown as AudioDestinationNode
  decodeAudioData = vi.fn(async () => decodedBuffer)
  constructor() { contexts.push(this) }
  async resume() { this.state = "running" }
  async suspend() { this.state = "suspended" }
  async close() { this.state = "closed" }
  createGain() { return Object.assign(new FakeAudioNode(), { gain: new FakeAudioParam() }) as unknown as GainNode }
  createBuffer(_channels: number, length: number) {
    const channel = new Float32Array(length)
    return { getChannelData: () => channel } as unknown as AudioBuffer
  }
  createBufferSource() {
    const source = new FakeAudioBufferSource()
    sources.push(source)
    return source as unknown as AudioBufferSourceNode
  }
  createBiquadFilter() {
    return Object.assign(new FakeAudioNode(), {
      type: "lowpass",
      frequency: { value: 0 },
    }) as unknown as BiquadFilterNode
  }
}

describe("GameAudio office ambience", () => {
  const previousAudioContext = window.AudioContext

  afterEach(() => {
    vi.unstubAllGlobals()
    Object.defineProperty(window, "AudioContext", { configurable: true, value: previousAudioContext })
    sources.length = 0
    contexts.length = 0
    vi.restoreAllMocks()
  })

  it("loads the bundled recording only after activation and loops its decoded buffer", async () => {
    const fetchMock = vi.fn(async (_url: RequestInfo | URL) => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }))
    vi.stubGlobal("fetch", fetchMock)
    Object.defineProperty(window, "AudioContext", { configurable: true, value: FakeAudioContext })
    const audio = new GameAudio()

    expect(fetchMock).not.toHaveBeenCalled()
    expect(await audio.activate()).toBe(true)
    await vi.waitFor(() => expect(sources.some(source => source.buffer === decodedBuffer)).toBe(true))

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(String(fetchMock.mock.calls[0][0])).toContain("office-quiet-traffic.mp3")
    expect(sources.find(source => source.buffer === decodedBuffer)?.loop).toBe(true)
    audio.close()
  })

  it("keeps procedural ambience on fetch failure and retries on a later activation", async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) })
    vi.stubGlobal("fetch", fetchMock)
    Object.defineProperty(window, "AudioContext", { configurable: true, value: FakeAudioContext })
    const audio = new GameAudio()

    await audio.activate()
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
    await vi.waitFor(() => expect(sources.some(source => source.buffer !== decodedBuffer && source.started)).toBe(true))
    expect(sources.some(source => source.buffer === decodedBuffer)).toBe(false)

    await new Promise(resolve => setTimeout(resolve, 0))
    await audio.activate()
    await vi.waitFor(() => expect(sources.some(source => source.buffer === decodedBuffer)).toBe(true))
    audio.close()
  })

  it("keeps procedural ambience when decoding fails", async () => {
    const fetchMock = vi.fn(async (_url: RequestInfo | URL) => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }))
    vi.stubGlobal("fetch", fetchMock)
    Object.defineProperty(window, "AudioContext", { configurable: true, value: FakeAudioContext })
    const audio = new GameAudio()

    const activation = audio.activate()
    contexts[0].decodeAudioData.mockRejectedValueOnce(new Error("unsupported recording"))
    await activation
    await vi.waitFor(() => expect(contexts[0].decodeAudioData).toHaveBeenCalledOnce())
    expect(sources.some(source => source.buffer === decodedBuffer)).toBe(false)
    expect(sources.some(source => source.loop && source.started)).toBe(true)
    audio.close()
  })

  it("resumes after focus suspension without duplicating the ambience source", async () => {
    const fetchMock = vi.fn(async (_url: RequestInfo | URL) => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }))
    vi.stubGlobal("fetch", fetchMock)
    Object.defineProperty(window, "AudioContext", { configurable: true, value: FakeAudioContext })
    const audio = new GameAudio()
    await audio.activate()
    await vi.waitFor(() => expect(sources.some(source => source.buffer === decodedBuffer)).toBe(true))

    const recordedSource = sources.find(source => source.buffer === decodedBuffer)!
    audio.suspend()
    expect(contexts[0].state).toBe("suspended")
    await audio.activate()
    expect(contexts[0].state).toBe("running")
    expect(sources.filter(source => source.buffer === decodedBuffer)).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledOnce()
    audio.close()
    expect(recordedSource.stopped).toBe(true)
    expect(contexts[0].state).toBe("closed")
  })

  it("stops ambience when muted and resumes it without another fetch", async () => {
    const fetchMock = vi.fn(async (_url: RequestInfo | URL) => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }))
    vi.stubGlobal("fetch", fetchMock)
    Object.defineProperty(window, "AudioContext", { configurable: true, value: FakeAudioContext })
    const audio = new GameAudio()
    await audio.activate()
    await vi.waitFor(() => expect(sources.some(source => source.buffer === decodedBuffer)).toBe(true))

    audio.setPreferences({ ...DEFAULT_AUDIO_PREFERENCES, muted: true })
    expect(sources.filter(source => source.buffer === decodedBuffer).at(-1)?.stopped).toBe(true)
    audio.setPreferences(DEFAULT_AUDIO_PREFERENCES)
    await vi.waitFor(() => expect(sources.filter(source => source.buffer === decodedBuffer && source.started)).toHaveLength(2))
    expect(fetchMock).toHaveBeenCalledOnce()
    audio.close()
  })
})
