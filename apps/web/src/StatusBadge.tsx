import type { ReactNode } from 'react'
import { STATUS_GLYPH, type StatusTone } from './theme/tokens'

type Props = { tone: StatusTone; children: ReactNode; role?: 'alert' | 'status' }

export function StatusBadge({ tone, children, role }: Props) {
  return <p className={`status-badge status-${tone}`} data-tone={tone} role={role}>
    <span className="status-glyph" aria-hidden="true">{STATUS_GLYPH[tone]}</span>
    <span>{children}</span>
  </p>
}
