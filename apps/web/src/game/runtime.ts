import type { WorldInteraction } from './bridge/events'

export type GameWorldState = {
  checkpointId: string
  encounterCleared: boolean
  assistEnabled: boolean
}

export type GameRuntime = {
  destroy: (removeCanvas: boolean) => void
  setInteractions: (interactions: WorldInteraction[]) => void
  setOverlayPaused: (paused: boolean) => void
  setWorldState: (state: GameWorldState) => void
}
export type GameFactory = (parent: HTMLElement, emit: (event: import('./bridge/events').GameLifecycleEvent) => void) => GameRuntime
