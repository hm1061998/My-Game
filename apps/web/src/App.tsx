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
    if (event.type === 'ready') setGameStatus('Hiện trường đã sẵn sàng')
    if (event.type === 'destroyed') setGameStatus('Hiện trường đã đóng')
    if (event.type === 'play-state') setGameStatus(event.state === 'paused' ? 'Đã tạm dừng' : 'Đang khám phá')
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
          <h2>Explore the office</h2>
          <p>Khám phá mặt bằng văn phòng. Thử đi vòng qua bàn, tủ và khu họp trước khi bắt đầu điều tra.</p>
          <div className="controls" aria-label="Điều khiển">
            <span><kbd>WASD</kbd> hoặc phím mũi tên: di chuyển</span>
            <span><kbd>Shift</kbd> Chạy</span>
            <span><kbd>Esc</kbd> Tạm dừng / tiếp tục</span>
          </div>
        </aside>

        <div className="scene-card">
          <div className="scene-toolbar">
            <span>FLOOR 08 · MAIN OFFICE</span>
            <span className="prototype-tag">OFFICE MAP · MOVEMENT</span>
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
