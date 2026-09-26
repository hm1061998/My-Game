import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { EnglishAudioPlayer } from "./EnglishAudioPlayer"

class VoiceUtterance {
  text: string
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
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  Reflect.deleteProperty(window, "speechSynthesis")
})

describe("EnglishAudioPlayer", () => {
  it("never auto-plays and offers normal, slow and stop controls for local voice", () => {
    const voice = { lang: "en-US", localService: true } as SpeechSynthesisVoice
    const speak = vi.fn()
    const speech = { getVoices: () => [voice], speak, cancel: vi.fn(), addEventListener: vi.fn(),
      removeEventListener: vi.fn() } as unknown as SpeechSynthesis
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: speech })
    const started = vi.fn()
    vi.stubGlobal("SpeechSynthesisUtterance", VoiceUtterance)
    render(<EnglishAudioPlayer text="The report was moved." onPlaybackStarted={started} />)
    expect(speak).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("button", { name: "▶ Nghe" }))
    expect(speak).toHaveBeenCalledOnce()
    expect(started).not.toHaveBeenCalled()
    const utterance = speak.mock.calls[0][0] as VoiceUtterance
    utterance.onstart?.()
    expect(started).toHaveBeenCalledOnce()
  })

  it("explains when only remote English voices are available and never uses them", () => {
    const speak = vi.fn()
    vi.stubGlobal("SpeechSynthesisUtterance", VoiceUtterance)
    const speech = { getVoices: () => [{ lang: "en-US", localService: false }], speak, cancel: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as SpeechSynthesis
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: speech })
    render(<EnglishAudioPlayer text="A private clue." />)
    expect(screen.getByText(/chưa có giọng tiếng Anh cục bộ/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "▶ Nghe" })).toBeDisabled()
    expect(speak).not.toHaveBeenCalled()
  })

  it("does not mark listening complete when the speech engine errors before playback starts", () => {
    const voice = { lang: "en-US", localService: true } as SpeechSynthesisVoice
    const speak = vi.fn()
    const speech = { getVoices: () => [voice], speak, cancel: vi.fn(), addEventListener: vi.fn(),
      removeEventListener: vi.fn() } as unknown as SpeechSynthesis
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: speech })
    const started = vi.fn()
    vi.stubGlobal("SpeechSynthesisUtterance", VoiceUtterance)
    render(<EnglishAudioPlayer text="The report was moved." onPlaybackStarted={started} />)
    fireEvent.click(screen.getByRole("button", { name: "▶ Nghe" }))
    const utterance = speak.mock.calls[0][0] as VoiceUtterance
    act(() => utterance.onerror?.())
    expect(started).not.toHaveBeenCalled()
    expect(screen.getByRole("status")).toHaveTextContent(/không thể phát lúc này/i)
  })
})
