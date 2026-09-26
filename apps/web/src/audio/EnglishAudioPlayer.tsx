import { useEffect, useState } from "react"
import { localEnglishVoices, speakEnglish, stopSpeech } from "./speech"

type Props = {
  text: string
  onPlaybackStarted?: () => void
}

export function EnglishAudioPlayer({ text, onPlaybackStarted }: Props) {
  const [voiceAvailable, setVoiceAvailable] = useState(() => localEnglishVoices().length > 0)
  const [speaking, setSpeaking] = useState(false)
  const [message, setMessage] = useState(() => {
    if (typeof window === "undefined" || !window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined")
      return "Trình duyệt này chưa hỗ trợ phát âm. Nội dung tiếng Anh vẫn hiển thị đầy đủ."
    return localEnglishVoices().length > 0 ? "" :
      "Thiết bị chưa có giọng tiếng Anh cục bộ. Nội dung vẫn đọc được và không gửi ra dịch vụ ngoài."
  })

  useEffect(() => {
    const synth = window.speechSynthesis
    const updateVoices = () => {
      const available = localEnglishVoices().length > 0
      setVoiceAvailable(available)
      if (available) setMessage("")
    }
    synth?.addEventListener("voiceschanged", updateVoices)
    return () => {
      synth?.removeEventListener("voiceschanged", updateVoices)
      stopSpeech()
    }
  }, [])

  const play = (slow: boolean) => {
    setMessage("")
    const result = speakEnglish(text, slow, () => setSpeaking(false), () => {
      setSpeaking(false)
      setMessage("Giọng đọc không thể phát lúc này. Bạn vẫn có thể đọc nội dung bên trên.")
    }, () => {
      setSpeaking(true)
      onPlaybackStarted?.()
    })
    if (result === "started") {
      setMessage("Đang chờ giọng đọc cục bộ bắt đầu…")
    } else {
      setVoiceAvailable(false)
      setMessage(result === "unsupported"
        ? "Trình duyệt này chưa hỗ trợ phát âm. Nội dung tiếng Anh vẫn hiển thị đầy đủ."
        : "Thiết bị chưa có giọng tiếng Anh cục bộ. Nội dung vẫn đọc được và không gửi ra dịch vụ ngoài.")
    }
  }

  return <div className="english-audio" aria-label="Nghe nội dung tiếng Anh">
    <div className="english-audio-actions">
      <button type="button" disabled={!voiceAvailable} onClick={() => play(false)}>▶ Nghe</button>
      <button type="button" disabled={!voiceAvailable} onClick={() => play(true)}>🐢 Nghe chậm</button>
      <button type="button" disabled={!speaking} onClick={() => { stopSpeech(); setSpeaking(false); }}>Dừng</button>
    </div>
    <p role="status" aria-live="polite">{message || (speaking ? "Đang đọc bằng giọng cục bộ…" : "Giọng tiếng Anh cục bộ · chỉ phát khi bấm")}</p>
  </div>
}
