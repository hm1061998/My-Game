import { useEffect, useRef } from 'react'
import type { GameLifecycleEvent } from './bridge/events'
import type { GameFactory } from './runtime'

type GameHostProps = { factory: GameFactory; onLifecycle?: (event: GameLifecycleEvent) => void }

export function GameHost({ factory, onLifecycle }: GameHostProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const lifecycleRef = useRef(onLifecycle)

  useEffect(() => {
    lifecycleRef.current = onLifecycle
  }, [onLifecycle])

  useEffect(() => {
    const parent = parentRef.current
    if (!parent) return
    const game = factory(parent, (event) => lifecycleRef.current?.(event))
    lifecycleRef.current?.({ type: 'ready' })
    return () => {
      game.destroy(true)
      lifecycleRef.current?.({ type: 'destroyed' })
    }
  }, [factory])

  return <div ref={parentRef} className="game-canvas" aria-label="Hiện trường điều tra 2.5D" />
}
