const TRANSLATION_PREFERENCE_KEY = 'office-case-files.translation.v1'

export function loadTranslationPreference(): boolean {
  try {
    return window.localStorage.getItem(TRANSLATION_PREFERENCE_KEY) === 'true'
  } catch {
    return false
  }
}

export function saveTranslationPreference(value: boolean): void {
  try {
    window.localStorage.setItem(TRANSLATION_PREFERENCE_KEY, String(value))
  } catch {
    // Translation is optional assistance; unavailable storage must not interrupt play.
  }
}
