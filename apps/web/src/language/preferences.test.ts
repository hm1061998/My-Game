import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadTranslationPreference, saveTranslationPreference } from './preferences'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('Vietnamese translation preference', () => {
  it('defaults to hidden and persists a show or hide choice', () => {
    expect(loadTranslationPreference()).toBe(false)
    saveTranslationPreference(true)
    expect(loadTranslationPreference()).toBe(true)
    saveTranslationPreference(false)
    expect(loadTranslationPreference()).toBe(false)
  })

  it('falls back to hidden when local storage cannot be read or written', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('storage denied') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('storage denied') })

    expect(loadTranslationPreference()).toBe(false)
    expect(() => saveTranslationPreference(true)).not.toThrow()
  })
})
