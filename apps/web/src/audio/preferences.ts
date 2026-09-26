export type AudioPreferences = {
  muted: boolean
  ambience: boolean
  effects: boolean
}

export const AUDIO_PREFERENCES_KEY = "office-case-files.audio.v1"

export const DEFAULT_AUDIO_PREFERENCES: AudioPreferences = {
  muted: false,
  ambience: true,
  effects: true,
}

export function normalizeAudioPreferences(value: unknown): AudioPreferences {
  if (!value || typeof value !== "object") return { ...DEFAULT_AUDIO_PREFERENCES }
  const record = value as Record<string, unknown>
  return {
    muted: typeof record.muted === "boolean" ? record.muted : DEFAULT_AUDIO_PREFERENCES.muted,
    ambience: typeof record.ambience === "boolean" ? record.ambience : DEFAULT_AUDIO_PREFERENCES.ambience,
    effects: typeof record.effects === "boolean" ? record.effects : DEFAULT_AUDIO_PREFERENCES.effects,
  }
}

export function loadAudioPreferences(): AudioPreferences {
  try {
    const raw = window.localStorage.getItem(AUDIO_PREFERENCES_KEY)
    return raw ? normalizeAudioPreferences(JSON.parse(raw) as unknown) : { ...DEFAULT_AUDIO_PREFERENCES }
  } catch {
    return { ...DEFAULT_AUDIO_PREFERENCES }
  }
}

export function saveAudioPreferences(preferences: AudioPreferences): void {
  try {
    window.localStorage.setItem(AUDIO_PREFERENCES_KEY, JSON.stringify(preferences))
  } catch {
    // Audio preferences are optional UI state; a storage failure must not interrupt play.
  }
}
