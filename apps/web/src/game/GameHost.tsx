import { useEffect, useRef } from 'react'
import type { GameLifecycleEvent, WorldInteraction } from './bridge/events'
import type { CharacterEmote, GameFactory, GameRuntime, GameWorldState } from './runtime'

type GameHostProps = {
  factory: GameFactory
  onLifecycle?: (event: GameLifecycleEvent) => void
  interactions?: WorldInteraction[]
  overlayOpen?: boolean
  worldState?: GameWorldState
  characterEmote?: CharacterEmote
}

const EMPTY_INTERACTIONS: WorldInteraction[] = []
export function GameHost({ factory, onLifecycle, interactions = EMPTY_INTERACTIONS,
  overlayOpen = false, worldState, characterEmote = null }: GameHostProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const lifecycleRef = useRef(onLifecycle)
  const runtimeRef = useRef<GameRuntime | null>(null)
  const interactionsRef = useRef(interactions)
  const overlayRef = useRef(overlayOpen)
  const worldRef = useRef(worldState)
  const emoteRef = useRef(characterEmote)
  const activeEmoteRef = useRef<CharacterEmote>(null)
  const focusLostRef = useRef(false)

  useEffect(() => {
    lifecycleRef.current = onLifecycle
  }, [onLifecycle])

  useEffect(() => {
    emoteRef.current = characterEmote
  }, [characterEmote])

  useEffect(() => {
    const parent = parentRef.current
    if (!parent) return
    const game = factory(parent, (event) => {
      if (event.type === 'play-state' && event.state === 'playing' && focusLostRef.current) {
        focusLostRef.current = false
        const requested = emoteRef.current
        if (requested) {
          runtimeRef.current?.setCharacterEmote(requested.characterId, requested.emote)
          activeEmoteRef.current = requested
        }
      }
      lifecycleRef.current?.(event)
    })
    runtimeRef.current = game
    game.setInteractions(interactionsRef.current)
    game.setOverlayPaused(overlayRef.current)
    if (worldRef.current) game.setWorldState(worldRef.current)
    const clearEmote = () => {
      const active = activeEmoteRef.current
      if (active) game.setCharacterEmote(active.characterId, null)
      activeEmoteRef.current = null
    }
    const onBlur = () => { focusLostRef.current = true; clearEmote() }
    window.addEventListener('blur', onBlur)
    if (!overlayRef.current) parent.focus()
    lifecycleRef.current?.({ type: 'ready' })
    return () => {
      runtimeRef.current = null
      window.removeEventListener('blur', onBlur)
      clearEmote()
      game.destroy(true)
      parent.replaceChildren()
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

  useEffect(() => {
    const game = runtimeRef.current
    if (!game || focusLostRef.current) return
    const active = activeEmoteRef.current
    if (active && (!characterEmote || active.characterId !== characterEmote.characterId))
      game.setCharacterEmote(active.characterId, null)
    if (characterEmote) game.setCharacterEmote(characterEmote.characterId, characterEmote.emote)
    activeEmoteRef.current = characterEmote
  }, [characterEmote])

  return <div ref={parentRef} className="game-canvas" tabIndex={0}
    aria-label="Hiện trường điều tra 2.5D" />
}
