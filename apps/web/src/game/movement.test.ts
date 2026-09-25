import { describe, expect, it } from 'vitest'
import { moveWithCollision, movementDelta, PLAYER_RADIUS, type Rect } from './movement'

const bounds: Rect = { x: 0, y: 0, width: 400, height: 300 }
const desk: Rect = { x: 150, y: 100, width: 100, height: 60 }

describe('office movement', () => {
  it('normalizes diagonal movement and scales with elapsed time', () => {
    const straight = movementDelta({ x: 1, y: 0 }, 1000 / 60, false)
    const diagonal = movementDelta({ x: 1, y: 1 }, 1000 / 60, false)
    expect(Math.hypot(diagonal.x, diagonal.y)).toBeCloseTo(straight.x)
    expect(movementDelta({ x: 1, y: 0 }, 32, false).x).toBeCloseTo(straight.x * 32 / (1000 / 60))
    expect(movementDelta({ x: 1, y: 0 }, 16, true).x).toBeGreaterThan(movementDelta({ x: 1, y: 0 }, 16, false).x)
  })

  it('stays inside bounds and cannot enter the desk footprint', () => {
    expect(moveWithCollision({ x: 30, y: 30 }, { x: -50, y: -50 }, bounds, [])).toEqual({ x: PLAYER_RADIUS, y: PLAYER_RADIUS })
    expect(moveWithCollision({ x: 120, y: 130 }, { x: 20, y: 0 }, bounds, [desk])).toEqual({ x: 120, y: 130 })
    expect(moveWithCollision({ x: 140, y: 85 }, { x: 10, y: 10 }, bounds, [desk])).toEqual({ x: 150, y: 85 })
  })

  it('slides along an obstacle on the free axis', () => {
    expect(moveWithCollision({ x: 120, y: 130 }, { x: 20, y: 10 }, bounds, [desk])).toEqual({ x: 120, y: 140 })
  })
})
