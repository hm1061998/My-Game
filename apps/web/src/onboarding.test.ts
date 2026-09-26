import { beforeEach, describe, expect, it } from "vitest"
import { isOnboardingDismissed, ONBOARDING_DISMISSED_KEY, setOnboardingDismissed } from "./onboarding"

describe("onboarding preference", () => {
  beforeEach(() => localStorage.clear())

  it("can be skipped persistently and replayed", () => {
    expect(isOnboardingDismissed()).toBe(false)
    setOnboardingDismissed(true)
    expect(localStorage.getItem(ONBOARDING_DISMISSED_KEY)).toBe("true")
    expect(isOnboardingDismissed()).toBe(true)
    setOnboardingDismissed(false)
    expect(isOnboardingDismissed()).toBe(false)
  })
})
