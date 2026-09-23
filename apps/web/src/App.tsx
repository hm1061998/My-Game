import { useQuery } from '@tanstack/react-query'
import { lazy, Suspense, useCallback, useState } from 'react'
import type { GameLifecycleEvent } from './game/bridge/events'
import './App.css'

const GameCanvas = lazy(async () => {
  const module = await import('./game/GameCanvas')
  return { default: module.GameCanvas }
})

type HealthResponse = { status: string; service: string; utc: string }

async function getHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/v1/health')
  if (!response.ok) throw new Error(`Health request failed with ${response.status}`)
  return response.json() as Promise<HealthResponse>
}

export default function App() {
  const [gameStatus, setGameStatus] = useState('Đang khởi tạo hiện trường…')
  const health = useQuery({ queryKey: ['api-health'], queryFn: getHealth, retry: 1 })
  const handleLifecycle = useCallback((event: GameLifecycleEvent) => {
    setGameStatus(event.type === 'ready' ? 'Hiện trường đã sẵn sàng' : 'Hiện trường đã đóng')
  }, [])

  return (
    <main className="app-shell">
      <header className="case-header">
        <div>
          <p className="eyebrow">OFFICE CASE FILES · PROTOTYPE</p>
          <h1>The Swapped Report</h1>
          <p className="case-summary">
            Một bản báo cáo quan trọng đã bị tráo. Hãy khám phá văn phòng, đọc manh mối
            tiếng Anh và tìm ra chuyện gì đã xảy ra.
          </p>
        </div>
        <dl className="status-panel" aria-label="Trạng thái hệ thống">
          <div><dt>Game</dt><dd>{gameStatus}</dd></div>
          <div>
            <dt>API</dt>
            <dd className={health.isSuccess ? 'online' : health.isError ? 'offline' : ''}>
              {health.isSuccess ? 'Đã kết nối' : health.isError ? 'Chưa kết nối' : 'Đang kiểm tra…'}
            </dd>
          </div>
        </dl>
      </header>

      <section className="workspace" aria-label="Khu vực điều tra">
        <aside className="mission-card">
          <p className="label">NHIỆM VỤ HIỆN TẠI</p>
          <h2>Meet Maya in the lobby</h2>
          <p>Gặp Maya tại sảnh để nhận thông tin đầu tiên về bản báo cáo.</p>
          <div className="controls" aria-label="Điều khiển dự kiến">
            <span><kbd>WASD</kbd> Di chuyển</span>
            <span><kbd>E</kbd> Tương tác</span>
            <span><kbd>Space</kbd> Né</span>
          </div>
        </aside>

        <div className="scene-card">
          <div className="scene-toolbar">
            <span>FLOOR 08 · MAIN OFFICE</span>
            <span className="prototype-tag">2.5D FOUNDATION</span>
          </div>
          <Suspense fallback={<div className="game-loading">Đang dựng hiện trường…</div>}>
            <GameCanvas onLifecycle={handleLifecycle} />
          </Suspense>
        </div>
      </section>

      {health.isError && (
        <p className="api-warning" role="alert">
          Backend chưa phản hồi. Khởi động API tại cổng 5062 rồi thử tải lại trang.
        </p>
      )}
    </main>
  )
}
