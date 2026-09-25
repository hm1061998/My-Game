export type GameLifecycleEvent =
  | { type: 'ready' }
  | { type: 'destroyed' }
  | { type: 'play-state'; state: 'playing' | 'paused' }
  | { type: 'interaction-nearby'; interaction: WorldInteraction | null }
  | { type: 'interaction-requested'; interactionId: string }

export type WorldInteraction = {
  id: string
  kind: 'evidence' | 'npc'
  labelVi: string
  x: number
  y: number
  radius: number
}
