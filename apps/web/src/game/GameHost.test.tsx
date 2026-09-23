import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { GameHost } from './GameHost'
import type { GameFactory } from './runtime'

describe('GameHost', () => {
  it('creates and destroys one game instance per mount', () => {
    const destroy = vi.fn()
    const factory: GameFactory = vi.fn(() => ({ destroy }))
    const lifecycle = vi.fn()
    const view = render(<GameHost factory={factory} onLifecycle={lifecycle} />)
    expect(factory).toHaveBeenCalledOnce()
    expect(lifecycle).toHaveBeenCalledWith({ type: 'ready' })
    view.unmount()
    expect(destroy).toHaveBeenCalledOnce()
    expect(destroy).toHaveBeenCalledWith(true)
    expect(lifecycle).toHaveBeenLastCalledWith({ type: 'destroyed' })
  })
})
