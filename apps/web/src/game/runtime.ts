export type GameRuntime = { destroy: (removeCanvas: boolean) => void }
export type GameFactory = (parent: HTMLElement, emit: (event: import('./bridge/events').GameLifecycleEvent) => void) => GameRuntime
