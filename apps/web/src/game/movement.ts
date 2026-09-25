export type Point = { x: number; y: number }
export type Rect = { x: number; y: number; width: number; height: number }

export const PLAYER_RADIUS = 15
export const WALK_SPEED = 210
export const RUN_SPEED = 315

export function movementDelta(input: Point, elapsedMs: number, running: boolean): Point {
  const length = Math.hypot(input.x, input.y)
  if (length === 0) return { x: 0, y: 0 }
  const distance = (running ? RUN_SPEED : WALK_SPEED) * Math.min(elapsedMs, 50) / 1000
  return { x: input.x / length * distance, y: input.y / length * distance }
}

function overlapsFootprint(point: Point, obstacle: Rect, radius: number): boolean {
  const nearestX = Math.max(obstacle.x, Math.min(point.x, obstacle.x + obstacle.width))
  const nearestY = Math.max(obstacle.y, Math.min(point.y, obstacle.y + obstacle.height))
  return (point.x - nearestX) ** 2 + (point.y - nearestY) ** 2 < radius ** 2
}

export function moveWithCollision(position: Point, delta: Point, bounds: Rect, obstacles: Rect[], radius = PLAYER_RADIUS): Point {
  const clampX = (x: number) => Math.max(bounds.x + radius, Math.min(x, bounds.x + bounds.width - radius))
  const clampY = (y: number) => Math.max(bounds.y + radius, Math.min(y, bounds.y + bounds.height - radius))
  const next = { ...position }
  const xCandidate = { x: clampX(position.x + delta.x), y: position.y }
  if (!obstacles.some((obstacle) => overlapsFootprint(xCandidate, obstacle, radius))) next.x = xCandidate.x
  const yCandidate = { x: next.x, y: clampY(position.y + delta.y) }
  if (!obstacles.some((obstacle) => overlapsFootprint(yCandidate, obstacle, radius))) next.y = yCandidate.y
  return next
}
