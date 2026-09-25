import { useEffect, useRef } from 'react'
import type { GameLifecycleEvent, WorldInteraction } from './bridge/events'
import type { GameFactory, GameRuntime, GameWorldState } from './runtime'

type GameHostProps = {
  factory: GameFactory
  onLifecycle?: (event: GameLifecycleEvent) => void
  interactions?: WorldInteraction[]
  overlayOpen?: boolean
  worldState?: GameWorldState
}

const EMPTY_INTERACTIONS: WorldInteraction[] = []
export function GameHost({ factory, onLifecycle, interactions = EMPTY_INTERACTIONS,
  overlayOpen = false, worldState }: GameHostProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const lifecycleRef = useRef(onLifecycle)
  const runtimeRef = useRef<GameRuntime | null>(null)
  const interactionsRef = useRef(interactions)
  const overlayRef = useRef(overlayOpen)
  const worldRef = useRef(worldState)

  useEffect(() => {
    lifecycleRef.current = onLifecycle
  }, [onLifecycle])

  useEffect(() => {
    const parent = parentRef.current
    if (!parent) return
    const game = factory(parent, (event) => lifecycleRef.current?.(event))
    runtimeRef.current = game
    game.setInteractions(interactionsRef.current)
    game.setOverlayPaused(overlayRef.current)
    if (worldRef.current) game.setWorldState(worldRef.current)
    lifecycleRef.current?.({ type: 'ready' })
    return () => {
      runtimeRef.current = null
      game.destroy(true)
      lifecycleRef.current?.({ type: 'destroyed' })
    }
  }, [factory])

  useEffect(() => {
    interactionsRef.current = interactions
    runtimeRef.current?.setInteractions(interactions)
  }, [interactions])

  useEffect(() => {
    overlayRef.current = overlayOpen
    runtimeRef.current?.setOverlayPaused(overlayOpen)
  }, [overlayOpen])

  useEffect(() => {
    worldRef.current = worldState
    if (worldState) runtimeRef.current?.setWorldState(worldState)
  }, [worldState])

  return <div ref={parentRef} className="game-canvas" tabIndex={0}
    aria-label="Hiện trường điều tra 2.5D" />
}
