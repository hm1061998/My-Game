export type SpeechResult = "started" | "unsupported" | "no-local-english-voice"

export function localEnglishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return []
  return window.speechSynthesis.getVoices().filter(voice =>
    voice.localService === true && /^en(?:-|$)/i.test(voice.lang))
}

export function speakEnglish(
  text: string,
  slow: boolean,
  onEnd: () => void,
  onError: () => void,
  onStart: () => void,
): SpeechResult {
  if (typeof window === "undefined" || !window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined")
    return "unsupported"
  const voice = localEnglishVoices()[0]
  if (!voice) return "no-local-english-voice"
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.voice = voice
  utterance.lang = voice.lang
  utterance.rate = slow ? 0.74 : 0.92
  utterance.volume = 0.85
  utterance.onstart = onStart
  utterance.onend = onEnd
  utterance.onerror = onError
  try {
    window.speechSynthesis.speak(utterance)
    return "started"
  } catch {
    return "unsupported"
  }
}

export function stopSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel()
}
