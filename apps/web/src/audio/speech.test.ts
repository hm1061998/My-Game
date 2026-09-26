import { afterEach, describe, expect, it, vi } from "vitest"
import { localEnglishVoices, speakEnglish } from "./speech"

class TestUtterance {
  readonly text: string
  voice?: SpeechSynthesisVoice
  lang = ""
  rate = 1
  volume = 1
  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(text: string) { this.text = text }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("local English speech", () => {
  it("uses only local English voices and respects the slower rate", () => {
    const voice = { lang: "en-US", localService: true, name: "Local English" } as SpeechSynthesisVoice
    const remote = { lang: "en-GB", localService: false, name: "Remote English" } as SpeechSynthesisVoice
    const speak = vi.fn()
    const cancel = vi.fn()
    vi.stubGlobal("SpeechSynthesisUtterance", TestUtterance)
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
      getVoices: () => [remote, voice], speak, cancel,
    } })
    const ended = vi.fn()
    expect(localEnglishVoices()).toEqual([voice])
    const started = vi.fn()
    expect(speakEnglish("Please read this clue.", true, ended, vi.fn(), started)).toBe("started")
    const utterance = speak.mock.calls[0][0] as TestUtterance
    expect(utterance.voice).toBe(voice)
    expect(utterance.rate).toBe(0.74)
    expect(utterance.text).toBe("Please read this clue.")
    expect(cancel).toHaveBeenCalledOnce()
    utterance.onstart?.()
    expect(started).toHaveBeenCalledOnce()
    utterance.onend?.()
    expect(ended).toHaveBeenCalledOnce()
  })

  it("refuses to pass content to a remote-only voice", () => {
    const speak = vi.fn()
    vi.stubGlobal("SpeechSynthesisUtterance", TestUtterance)
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
      getVoices: () => [{ lang: "en-US", localService: false }], speak, cancel: vi.fn(),
    } })
    expect(speakEnglish("Clue text", false, vi.fn(), vi.fn(), vi.fn())).toBe("no-local-english-voice")
    expect(speak).not.toHaveBeenCalled()
  })
})
