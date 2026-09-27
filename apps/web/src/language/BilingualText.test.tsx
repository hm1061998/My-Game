import { useState } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { BilingualText } from './BilingualText'

afterEach(() => cleanup())

function Harness() {
  const [showTranslation, setShowTranslation] = useState(false)
  return <BilingualText english="Use the approved report." vietnamese="Dùng báo cáo đã được duyệt."
    showTranslation={showTranslation} onToggle={() => setShowTranslation(value => !value)} />
}

describe('BilingualText', () => {
  it('shows English first, then reveals and hides Vietnamese with a keyboard-operable control', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    expect(screen.getByText('Use the approved report.')).toHaveAttribute('lang', 'en')
    expect(screen.queryByText('Dùng báo cáo đã được duyệt.')).not.toBeInTheDocument()
    const toggle = screen.getByRole('button', { name: 'Hiện bản dịch' })
    toggle.focus()
    await user.keyboard('{Enter}')

    expect(screen.getByText('Dùng báo cáo đã được duyệt.')).toHaveAttribute('lang', 'vi')
    expect(screen.getByRole('button', { name: 'Ẩn bản dịch' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'Ẩn bản dịch' }))
    expect(screen.queryByText('Dùng báo cáo đã được duyệt.')).not.toBeInTheDocument()
  })

  it('does not render a translation control when the case has no translation', () => {
    render(<BilingualText english="English only." showTranslation={false} onToggle={() => {}} />)

    expect(screen.getByText('English only.')).toHaveAttribute('lang', 'en')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
