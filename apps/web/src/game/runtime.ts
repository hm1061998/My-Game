import type { WorldInteraction } from './bridge/events'
import type { CharacterId } from './characterArt'

export type CharacterEmote = { characterId: CharacterId; emote: 'talk' | 'react' } | null

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
  setCharacterEmote: (characterId: CharacterId, emote: 'talk' | 'react' | null) => void
}
export type GameFactory = (parent: HTMLElement, emit: (event: import('./bridge/events').GameLifecycleEvent) => void) => GameRuntime
