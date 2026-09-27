import { StrictMode } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GameHost } from './GameHost'
import type { GameFactory } from './runtime'
import type { CharacterId } from './characterArt'

const noEmote = vi.fn()
const emoteProps = (characterId: CharacterId, emote: 'talk' | 'react') => ({ characterId, emote })

describe('GameHost', () => {
  it('creates and destroys one game instance per mount', () => {
    const destroy = vi.fn()
    const setCharacterEmote = vi.fn()
    const factory: GameFactory = vi.fn(() => ({ destroy, setInteractions: vi.fn(), setOverlayPaused: vi.fn(), setWorldState: vi.fn(), setCharacterEmote }))
    const lifecycle = vi.fn()
    const view = render(<GameHost factory={factory} onLifecycle={lifecycle} />)
    expect(factory).toHaveBeenCalledOnce()
    expect(lifecycle).toHaveBeenCalledWith({ type: 'ready' })
    expect(view.container.querySelector('.game-canvas')).toHaveFocus()
    view.unmount()
    expect(destroy).toHaveBeenCalledOnce()
    expect(destroy).toHaveBeenCalledWith(true)
    expect(lifecycle).toHaveBeenLastCalledWith({ type: 'destroyed' })
  })

  it('removes the old canvas before a StrictMode effect replay', () => {
    const factory: GameFactory = vi.fn((parent) => {
      parent.append(document.createElement('canvas'))
      return { destroy: vi.fn(), setInteractions: vi.fn(), setOverlayPaused: vi.fn(), setWorldState: vi.fn(), setCharacterEmote: noEmote }
    })
    const view = render(<StrictMode><GameHost factory={factory} /></StrictMode>)
    expect(factory).toHaveBeenCalledTimes(2)
    expect(view.container.querySelectorAll('canvas')).toHaveLength(1)
    view.unmount()
    expect(view.container.querySelectorAll('canvas')).toHaveLength(0)
  })

  it('forwards game play-state changes to the DOM owner', () => {
    const factory: GameFactory = (_parent, emit) => {
      emit({ type: 'play-state', state: 'paused' })
      return { destroy: vi.fn(), setInteractions: vi.fn(), setOverlayPaused: vi.fn(), setWorldState: vi.fn(), setCharacterEmote: noEmote }
    }
    const lifecycle = vi.fn()
    const view = render(<GameHost factory={factory} onLifecycle={lifecycle} />)
    expect(lifecycle).toHaveBeenCalledWith({ type: 'play-state', state: 'paused' })
    view.unmount()
  })

  it('forwards map changes and overlay pause without remounting the game', () => {
    const setInteractions = vi.fn()
    const setOverlayPaused = vi.fn()
    const setWorldState = vi.fn()
    const setCharacterEmote = vi.fn()
    const factory: GameFactory = vi.fn(() => ({ destroy: vi.fn(), setInteractions, setOverlayPaused, setWorldState, setCharacterEmote }))
    const view = render(<GameHost factory={factory} />)
    const interactions = [{ id: 'desk-email', kind: 'evidence' as const,
      labelVi: 'Email trên bàn', x: 455, y: 535, radius: 75 }]
    view.rerender(<GameHost factory={factory} interactions={interactions} overlayOpen
      worldState={{ checkpointId: 'office-entry', encounterCleared: false, assistEnabled: false }}
      characterEmote={emoteProps('maya', 'talk')} />)
    expect(factory).toHaveBeenCalledOnce()
    expect(setInteractions).toHaveBeenLastCalledWith(interactions)
    expect(setOverlayPaused).toHaveBeenLastCalledWith(true)
    expect(setWorldState).toHaveBeenCalledWith({ checkpointId: 'office-entry', encounterCleared: false, assistEnabled: false })
    expect(setCharacterEmote).toHaveBeenLastCalledWith('maya', 'talk')
    view.rerender(<GameHost factory={factory} characterEmote={emoteProps('nora', 'react')} />)
    expect(setCharacterEmote).toHaveBeenLastCalledWith('nora', 'react')
    view.rerender(<GameHost factory={factory} characterEmote={null} />)
    expect(setCharacterEmote).toHaveBeenLastCalledWith('nora', null)
    view.unmount()
  })

  it('clears the active emote when the canvas loses focus', () => {
    const setCharacterEmote = vi.fn()
    const factory: GameFactory = vi.fn(() => ({ destroy: vi.fn(), setInteractions: vi.fn(), setOverlayPaused: vi.fn(), setWorldState: vi.fn(), setCharacterEmote }))
    const view = render(<GameHost factory={factory} characterEmote={emoteProps('maya', 'talk')} />)
    window.dispatchEvent(new FocusEvent('blur'))
    expect(setCharacterEmote).toHaveBeenLastCalledWith('maya', null)
    view.unmount()
  })
})
