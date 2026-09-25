import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GameHost } from './GameHost'
import type { GameFactory } from './runtime'

describe('GameHost', () => {
  it('creates and destroys one game instance per mount', () => {
    const destroy = vi.fn()
    const factory: GameFactory = vi.fn(() => ({ destroy, setInteractions: vi.fn(), setOverlayPaused: vi.fn() }))
    const lifecycle = vi.fn()
    const view = render(<GameHost factory={factory} onLifecycle={lifecycle} />)
    expect(factory).toHaveBeenCalledOnce()
    expect(lifecycle).toHaveBeenCalledWith({ type: 'ready' })
    view.unmount()
    expect(destroy).toHaveBeenCalledOnce()
    expect(destroy).toHaveBeenCalledWith(true)
    expect(lifecycle).toHaveBeenLastCalledWith({ type: 'destroyed' })
  })

  it('forwards game play-state changes to the DOM owner', () => {
    const factory: GameFactory = (_parent, emit) => {
      emit({ type: 'play-state', state: 'paused' })
      return { destroy: vi.fn(), setInteractions: vi.fn(), setOverlayPaused: vi.fn() }
    }
    const lifecycle = vi.fn()
    const view = render(<GameHost factory={factory} onLifecycle={lifecycle} />)
    expect(lifecycle).toHaveBeenCalledWith({ type: 'play-state', state: 'paused' })
    view.unmount()
  })

  it('forwards map changes and overlay pause without remounting the game', () => {
    const setInteractions = vi.fn()
    const setOverlayPaused = vi.fn()
    const factory: GameFactory = vi.fn(() => ({ destroy: vi.fn(), setInteractions, setOverlayPaused }))
    const view = render(<GameHost factory={factory} />)
    const interactions = [{ id: 'desk-email', kind: 'evidence' as const,
      labelVi: 'Email trên bàn', x: 455, y: 535, radius: 75 }]
    view.rerender(<GameHost factory={factory} interactions={interactions} overlayOpen />)
    expect(factory).toHaveBeenCalledOnce()
    expect(setInteractions).toHaveBeenLastCalledWith(interactions)
    expect(setOverlayPaused).toHaveBeenLastCalledWith(true)
    view.unmount()
  })
})
