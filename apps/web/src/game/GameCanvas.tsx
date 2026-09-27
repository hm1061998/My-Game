import { createGame } from './createGame'
import { GameHost } from './GameHost'
import type { GameLifecycleEvent, WorldInteraction } from './bridge/events'
import type { CharacterEmote, GameWorldState } from './runtime'

type GameCanvasProps = {
  onLifecycle?: (event: GameLifecycleEvent) => void
  interactions: WorldInteraction[]
  overlayOpen: boolean
  worldState?: GameWorldState
  characterEmote?: CharacterEmote
}

export function GameCanvas({ onLifecycle, interactions, overlayOpen, worldState, characterEmote }: GameCanvasProps) {
  return <GameHost factory={createGame} onLifecycle={onLifecycle}
    interactions={interactions} overlayOpen={overlayOpen} worldState={worldState} characterEmote={characterEmote} />
}
