export type GameLifecycleEvent =
  | { type: 'ready' }
  | { type: 'destroyed' }
  | { type: 'play-state'; state: 'playing' | 'paused' }
