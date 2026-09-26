import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AudioSettings } from "./AudioSettings"
import { DEFAULT_AUDIO_PREFERENCES } from "./preferences"

describe("AudioSettings", () => {
  it("allows independent channel controls and a master mute", () => {
    const onChange = vi.fn()
    const onActivate = vi.fn()
    render(<AudioSettings preferences={DEFAULT_AUDIO_PREFERENCES} active={false}
      onChange={onChange} onActivate={onActivate} />)
    fireEvent.click(screen.getByText("Âm thanh"))
    fireEvent.click(screen.getByLabelText("Âm thanh văn phòng"))
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_AUDIO_PREFERENCES, ambience: false })
    fireEvent.click(screen.getByLabelText("Hiệu ứng điều tra"))
    expect(onChange).toHaveBeenLastCalledWith({ ...DEFAULT_AUDIO_PREFERENCES, effects: false })
    fireEvent.click(screen.getByRole("button", { name: "Tắt tất cả âm thanh" }))
    expect(onChange).toHaveBeenLastCalledWith({ ...DEFAULT_AUDIO_PREFERENCES, muted: true })
    expect(onActivate).not.toHaveBeenCalled()
  })
})
