import type { Point } from './movement'

export const SCANNER_MIN_X = 1270
export const SCANNER_MAX_X = 1460
export const SCANNER_Y = 585
export const SCANNER_RADIUS = 76
export const CHECKPOINT: Point = { x: 1090, y: 775 }
export const CHECKPOINT_RADIUS = 90
export const DODGE_DURATION_MS = 300
export const DODGE_COOLDOWN_MS = 1600

export function advancePatrol(x: number, direction: -1 | 1, deltaMs: number,
  assisted: boolean): { x: number; direction: -1 | 1 } {
  const speed = assisted ? 55 : 120
  const next = x + direction * speed * Math.min(deltaMs, 50) / 1000
  if (next >= SCANNER_MAX_X) return { x: SCANNER_MAX_X, direction: -1 }
  if (next <= SCANNER_MIN_X) return { x: SCANNER_MIN_X, direction: 1 }
  return { x: next, direction }
}

export function scannerDetects(player: Point, scannerX: number, dodging: boolean): boolean {
  return !dodging && Math.hypot(player.x - scannerX, player.y - SCANNER_Y) < SCANNER_RADIUS
}

export const reachedCheckpoint = (position: Point): boolean =>
  Math.hypot(position.x - CHECKPOINT.x, position.y - CHECKPOINT.y) <= CHECKPOINT_RADIUS
