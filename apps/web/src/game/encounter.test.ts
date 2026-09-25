import { describe, expect, it } from 'vitest'
import { advancePatrol, CHECKPOINT, reachedCheckpoint, scannerDetects,
  SCANNER_MAX_X, SCANNER_MIN_X, SCANNER_Y } from './encounter'

describe('archive scanner rules', () => {
  it('patrols inside bounds and assistance is slower', () => {
    expect(advancePatrol(SCANNER_MAX_X - 1, 1, 50, false)).toEqual({ x: SCANNER_MAX_X, direction: -1 })
    expect(advancePatrol(SCANNER_MIN_X + 1, -1, 50, false)).toEqual({ x: SCANNER_MIN_X, direction: 1 })
    expect(advancePatrol(1300, 1, 50, true).x).toBeLessThan(advancePatrol(1300, 1, 50, false).x)
  })

  it('detects proximity except during a dodge', () => {
    const player = { x: 1300, y: SCANNER_Y }
    expect(scannerDetects(player, 1300, false)).toBe(true)
    expect(scannerDetects(player, 1300, true)).toBe(false)
    expect(scannerDetects({ x: 1300, y: SCANNER_Y + 100 }, 1300, false)).toBe(false)
  })

  it('requires physical checkpoint proximity', () => {
    expect(reachedCheckpoint(CHECKPOINT)).toBe(true)
    expect(reachedCheckpoint({ x: 260, y: 645 })).toBe(false)
  })
})
