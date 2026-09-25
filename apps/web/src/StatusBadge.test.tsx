import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from './StatusBadge'
import { colorNumber, STATUS_GLYPH } from './theme/tokens'

describe('StatusBadge', () => {
  it('gives every state a distinct glyph so tone never relies on color alone', () => {
    expect(new Set(Object.values(STATUS_GLYPH)).size).toBe(Object.keys(STATUS_GLYPH).length)
  })

  it('renders readable text with a decorative glyph and optional alert role', () => {
    render(<StatusBadge tone="offline" role="alert">Chưa kết nối</StatusBadge>)
    const badge = screen.getByRole('alert')
    expect(badge).toHaveTextContent('Chưa kết nối')
    expect(badge).toHaveAttribute('data-tone', 'offline')
    expect(badge.querySelector('[aria-hidden="true"]')).toHaveTextContent('⚠')
  })

  it('converts CSS hex tokens into Phaser color numbers', () => {
    expect(colorNumber('#1d3b3a')).toBe(0x1d3b3a)
  })
})
