export const ONBOARDING_DISMISSED_KEY = "office-case-files.onboarding.dismissed.v1"

export function isOnboardingDismissed(): boolean {
  try { return window.localStorage.getItem(ONBOARDING_DISMISSED_KEY) === "true" }
  catch { return false }
}

export function setOnboardingDismissed(dismissed: boolean): void {
  try {
    if (dismissed) window.localStorage.setItem(ONBOARDING_DISMISSED_KEY, "true")
    else window.localStorage.removeItem(ONBOARDING_DISMISSED_KEY)
  } catch {
    // The guide remains available for this session when storage is unavailable.
  }
}
