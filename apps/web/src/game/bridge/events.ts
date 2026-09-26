export type GameLifecycleEvent =
  | { type: 'ready' }
  | { type: 'destroyed' }
  | { type: 'play-state'; state: 'playing' | 'paused' }
  | { type: 'player-moved' }
  | { type: 'interaction-nearby'; interaction: WorldInteraction | null }
  | { type: 'interaction-requested'; interactionId: string }
  | { type: 'checkpoint-reached' }
  | { type: 'encounter-detected' }
  | { type: 'encounter-cleared' }
  | { type: 'encounter-checkpoint-required' }
  | { type: 'art-missing'; keys: string[] }

export type WorldInteraction = {
  id: string
  kind: 'evidence' | 'npc'
  labelVi: string
  x: number
  y: number
  radius: number
}
