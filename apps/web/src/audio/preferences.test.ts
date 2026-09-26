import { beforeEach, describe, expect, it } from "vitest"
import { AUDIO_PREFERENCES_KEY, DEFAULT_AUDIO_PREFERENCES, loadAudioPreferences,
  normalizeAudioPreferences, saveAudioPreferences } from "./preferences"

describe("audio preferences", () => {
  beforeEach(() => localStorage.clear())

  it("uses quiet, enabled defaults without touching case progress", () => {
    expect(loadAudioPreferences()).toEqual(DEFAULT_AUDIO_PREFERENCES)
    expect(localStorage.length).toBe(0)
  })

  it("normalizes malformed values and persists only audio UI preferences", () => {
    localStorage.setItem(AUDIO_PREFERENCES_KEY, JSON.stringify({ muted: true, ambience: false, effects: "yes" }))
    expect(loadAudioPreferences()).toEqual({ muted: true, ambience: false, effects: true })
    saveAudioPreferences({ muted: true, ambience: false, effects: false })
    expect(JSON.parse(localStorage.getItem(AUDIO_PREFERENCES_KEY) ?? "{}"))
      .toEqual({ muted: true, ambience: false, effects: false })
  })

  it("falls back safely when stored JSON is invalid", () => {
    localStorage.setItem(AUDIO_PREFERENCES_KEY, "not-json")
    expect(loadAudioPreferences()).toEqual(DEFAULT_AUDIO_PREFERENCES)
    expect(normalizeAudioPreferences(null)).toEqual(DEFAULT_AUDIO_PREFERENCES)
  })
})
