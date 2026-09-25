// T27 direction A (editorial detective) design tokens shared by React CSS and Phaser.
// CSS custom properties in index.css mirror these values; keep both in sync.

export const COLOR = {
  ink: '#1d3b3a',
  inkSoft: '#3f5c5a',
  wall: '#2f6f6a',
  desk: '#8fd3c1',
  paper: '#efe3cc',
  paperLight: '#fff6e6',
  coral: '#e76f51',
  amber: '#f4a261',
  safe: '#2f8f6b',
  danger: '#c8442f',
  info: '#2f6f9f',
} as const

export const FONT = {
  display: 'Georgia, "Times New Roman", serif',
  ui: 'system-ui, "Segoe UI", sans-serif',
} as const

export const OUTLINE = { world: 3, detail: 1.5 } as const

export const MOTION = { fastMs: 120, baseMs: 200, slowMs: 360 } as const

export function colorNumber(hex: string): number {
  return Number.parseInt(hex.replace('#', ''), 16)
}

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export type StatusTone = 'loading' | 'offline' | 'missing' | 'locked' | 'success' | 'recovery'

// Each state has a distinct glyph and shape so it never relies on color alone.
export const STATUS_GLYPH: Record<StatusTone, string> = {
  loading: '◌',
  offline: '⚠',
  missing: '○',
  locked: '🔒',
  success: '✓',
  recovery: '↻',
}
