import type { SessionProgress } from './api/session'
import type { WorldInteraction } from './game/bridge/events'

type Props = {
  objective: string
  session: SessionProgress | null
  nearby: WorldInteraction | null
  notice: string | null
  mapError: boolean
}

export function SceneHud({ objective, session, nearby, notice, mapError }: Props) {
  return <div className="scene-hud" aria-label="Thông tin hiện trường">
    <div className="hud-objective"><span>NHIỆM VỤ</span><strong>{objective}</strong></div>
    {session && <div className="hud-chips" aria-label="Tiến độ nhanh">
      <span>{session.checkpointId === 'meeting-zone' ? '✓ Mốc khu họp' : '○ Mốc sảnh'}</span>
      <span>{session.encounterCleared ? '✓ Máy quét đã vượt' :
        `◆ Máy quét · ${session.encounterFailures} lần phát hiện`}</span>
      {session.assistanceUsed && <span>Hỗ trợ chậm đang bật</span>}
    </div>}
    <div className="hud-messages" aria-live="polite">
      {mapError && <p role="alert">Không tải được bản đồ vụ án. Kiểm tra API rồi tải lại trang.</p>}
      {nearby && session && <p className="interaction-prompt"><kbd>E</kbd><span>
        {nearby.kind === 'npc' ? 'Đồng nghiệp' : 'Hồ sơ'}<strong>{nearby.labelVi}</strong>
      </span></p>}
      {notice && <p role="alert">{notice}</p>}
    </div>
  </div>
}
