import type { AudioPreferences } from "./preferences"

type Props = {
  preferences: AudioPreferences
  active: boolean
  onChange: (preferences: AudioPreferences) => void
  onActivate: () => void
}

export function AudioSettings({ preferences, active, onChange, onActivate }: Props) {
  const update = (key: "ambience" | "effects", value: boolean) => {
    const next = { ...preferences, [key]: value }
    onChange(next)
    if (value && !next.muted) onActivate()
  }

  const toggleMute = () => {
    const next = { ...preferences, muted: !preferences.muted }
    onChange(next)
    if (!next.muted) onActivate()
  }

  return <details className="audio-settings">
    <summary>Âm thanh</summary>
    <div className="audio-settings-body">
      <button type="button" className="secondary-action" onClick={toggleMute}>
        {preferences.muted ? "Bật âm thanh" : "Tắt tất cả âm thanh"}
      </button>
      <button type="button" className="audio-activate" disabled={active || preferences.muted}
        onClick={onActivate}>{active ? "Âm thanh đã sẵn sàng" : "Kích hoạt âm thanh"}</button>
      <label><input type="checkbox" checked={preferences.ambience}
        onChange={event => update("ambience", event.currentTarget.checked)} /> Âm thanh văn phòng</label>
      <label><input type="checkbox" checked={preferences.effects}
        onChange={event => update("effects", event.currentTarget.checked)} /> Hiệu ứng điều tra</label>
      <p role="note">Âm thanh bắt đầu sau thao tác của bạn. Có thể tắt bất cứ lúc nào.</p>
    </div>
  </details>
}
