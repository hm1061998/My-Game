import { createGame } from './createGame'
import { GameHost } from './GameHost'
import type { GameLifecycleEvent } from './bridge/events'

type GameCanvasProps = { onLifecycle?: (event: GameLifecycleEvent) => void }

export function GameCanvas({ onLifecycle }: GameCanvasProps) {
  return <GameHost factory={createGame} onLifecycle={onLifecycle} />
}
