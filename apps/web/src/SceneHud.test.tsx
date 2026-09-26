import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SceneHud } from './SceneHud'

const session = {
  caseId: 'swapped-report', caseVersion: '1', status: 'Investigating', revision: 3,
  mapId: 'office-floor-08', checkpointId: 'meeting-zone', encounterCleared: false,
  encounterFailures: 2, assistanceUsed: true, expiresAtUtc: '2026-10-25T00:00:00Z',
}

describe('SceneHud', () => {
  it('exposes progress and nearby action as readable DOM text', () => {
    render(<SceneHud objective="Vượt máy quét" session={session}
      nearby={{ id: 'npc-nora', kind: 'npc', labelVi: 'Nói chuyện với Nora', x: 0, y: 0, radius: 80 }}
      notice={null} mapError={false} />)
    expect(screen.getByLabelText('Thông tin hiện trường')).toHaveTextContent('Vượt máy quét')
    expect(screen.getByLabelText('Tiến độ nhanh')).toHaveTextContent('2 lần phát hiện')
    expect(screen.getByText('Nói chuyện với Nora')).toBeInTheDocument()
  })

  it('announces map and progression errors', () => {
    render(<SceneHud objective="Điều tra" session={null} nearby={null}
      notice="Tiến độ đã thay đổi" mapError />)
    expect(screen.getAllByRole('alert')).toHaveLength(2)
  })

  it('shows a dismissible first-action hint without hiding gameplay status', async () => {
    const onDismiss = vi.fn()
    render(<SceneHud objective="Tìm email" session={session} nearby={null}
      notice={null} mapError={false} tutorialHint="Đi tới email trên bàn bằng WASD."
      onDismissTutorial={onDismiss} />)
    expect(screen.getByRole('status')).toHaveTextContent('Đi tới email trên bàn bằng WASD.')
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ qua hướng dẫn' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})
