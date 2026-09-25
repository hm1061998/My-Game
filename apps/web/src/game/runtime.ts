import type { WorldInteraction } from './bridge/events'

export type GameRuntime = {
  destroy: (removeCanvas: boolean) => void
  setInteractions: (interactions: WorldInteraction[]) => void
  setOverlayPaused: (paused: boolean) => void
}
export type GameFactory = (parent: HTMLElement, emit: (event: import('./bridge/events').GameLifecycleEvent) => void) => GameRuntime
