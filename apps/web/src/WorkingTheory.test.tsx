import { useState } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { WorkingTheory } from './WorkingTheory'

afterEach(() => cleanup())

function Harness() {
  const [state, setState] = useState({ open: false, known: '', uncertain: '' })
  return <WorkingTheory open={state.open} known={state.known} uncertain={state.uncertain}
    onKnownChange={known => setState(previous => ({ ...previous, known }))}
    onUncertainChange={uncertain => setState(previous => ({ ...previous, uncertain }))}
    onOpen={() => setState(previous => ({ ...previous, open: true }))}
    onSkip={() => setState(previous => ({ ...previous, open: false }))} />
}

describe('WorkingTheory', () => {
  it('lets the player skip and reopen both non-scored notes without losing text', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Ghi lại suy luận' }))
    const known = screen.getByRole('textbox', { name: 'Điều đã biết' })
    const uncertain = screen.getByRole('textbox', { name: 'Điều còn chưa rõ' })
    await user.type(known, 'Nora asked about the previous version.')
    await user.type(uncertain, 'Which file did she send?')
    expect(known).toHaveAttribute('maxLength', '160')
    expect(uncertain).toHaveAttribute('maxLength', '160')

    await user.click(screen.getByRole('button', { name: 'Bỏ qua, tiếp tục' }))
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sửa ghi chú' }))
    expect(screen.getByRole('textbox', { name: 'Điều đã biết' })).toHaveValue('Nora asked about the previous version.')
    expect(screen.getByRole('textbox', { name: 'Điều còn chưa rõ' })).toHaveValue('Which file did she send?')
  })

  it('does not provide any scoring or network submission action', () => {
    render(<Harness />)

    expect(screen.queryByRole('button', { name: /lưu|gửi|trả lời/i })).not.toBeInTheDocument()
    expect(screen.getByText(/không tính điểm/i)).toBeInTheDocument()
  })
})
