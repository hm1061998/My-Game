import { createGame } from './createGame'
import { GameHost } from './GameHost'
import type { GameLifecycleEvent, WorldInteraction } from './bridge/events'

type GameCanvasProps = {
  onLifecycle?: (event: GameLifecycleEvent) => void
  interactions: WorldInteraction[]
  overlayOpen: boolean
}

export function GameCanvas({ onLifecycle, interactions, overlayOpen }: GameCanvasProps) {
  return <GameHost factory={createGame} onLifecycle={onLifecycle}
    interactions={interactions} overlayOpen={overlayOpen} />
}
