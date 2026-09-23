export type GameRuntime = { destroy: (removeCanvas: boolean) => void }
export type GameFactory = (parent: HTMLElement) => GameRuntime
