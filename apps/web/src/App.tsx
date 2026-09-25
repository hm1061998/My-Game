import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useCallback, useState } from "react";
import {
  resumeSession,
  saveMeetingCheckpoint,
  startSession,
  type SessionProgress,
} from "./api/session";
import type { GameLifecycleEvent } from "./game/bridge/events";
import "./App.css";

const GameCanvas = lazy(async () => {
  const module = await import("./game/GameCanvas");
  return { default: module.GameCanvas };
});

type HealthResponse = { status: string; service: string; utc: string };

async function getHealth(): Promise<HealthResponse> {
  const response = await fetch("/api/v1/health");
  if (!response.ok)
    throw new Error(`Health request failed with ${response.status}`);
  return response.json() as Promise<HealthResponse>;
}

export default function App() {
  const [gameStatus, setGameStatus] = useState("Đang khởi tạo hiện trường…");
  const queryClient = useQueryClient();
  const health = useQuery({
    queryKey: ["api-health"],
    queryFn: getHealth,
    retry: 1,
  });
  const session = useQuery({
    queryKey: ["session"],
    queryFn: resumeSession,
    retry: false,
  });
  const started = useMutation({
    mutationFn: startSession,
    onSuccess: (progress) =>
      queryClient.setQueryData<SessionProgress>(["session"], progress),
  });
  const checkpoint = useMutation({
    mutationFn: () => saveMeetingCheckpoint(session.data!.revision),
    onSuccess: (progress) =>
      queryClient.setQueryData<SessionProgress>(["session"], progress),
    onError: () =>
      void queryClient.invalidateQueries({ queryKey: ["session"] }),
  });
  const handleLifecycle = useCallback((event: GameLifecycleEvent) => {
    if (event.type === "ready") setGameStatus("Hiện trường đã sẵn sàng");
    if (event.type === "destroyed") setGameStatus("Hiện trường đã đóng");
    if (event.type === "play-state")
      setGameStatus(event.state === "paused" ? "Đã tạm dừng" : "Đang khám phá");
  }, []);

  return (
    <main className="app-shell">
      <header className="case-header">
        <div>
          <p className="eyebrow">OFFICE CASE FILES · PROTOTYPE</p>
          <h1>The Swapped Report</h1>
          <p className="case-summary">
            Một bản báo cáo quan trọng đã bị tráo. Hãy khám phá văn phòng, đọc
            manh mối tiếng Anh và tìm ra chuyện gì đã xảy ra.
          </p>
        </div>
        <dl className="status-panel" aria-label="Trạng thái hệ thống">
          <div>
            <dt>Game</dt>
            <dd>{gameStatus}</dd>
          </div>
          <div>
            <dt>API</dt>
            <dd
              className={
                health.isSuccess ? "online" : health.isError ? "offline" : ""
              }
            >
              {health.isSuccess
                ? "Đã kết nối"
                : health.isError
                  ? "Chưa kết nối"
                  : "Đang kiểm tra…"}
            </dd>
          </div>
        </dl>
      </header>

      <section className="workspace" aria-label="Khu vực điều tra">
        <aside className="mission-card">
          <p className="label">NHIỆM VỤ HIỆN TẠI</p>
          <h2>Explore the office</h2>
          <p>
            Khám phá mặt bằng văn phòng. Thử đi vòng qua bàn, tủ và khu họp
            trước khi bắt đầu điều tra.
          </p>
          <div className="controls" aria-label="Điều khiển">
            <span>
              <kbd>WASD</kbd> hoặc phím mũi tên: di chuyển
            </span>
            <span>
              <kbd>Shift</kbd> Chạy
            </span>
            <span>
              <kbd>Esc</kbd> Tạm dừng / tiếp tục
            </span>
          </div>
          <div className="session-panel" aria-live="polite">
            <h3>Lượt điều tra</h3>
            {session.isPending && <p>Đang kiểm tra lượt chơi…</p>}
            {session.isError && (
              <p role="alert">
                Không tải được tiến độ. Kiểm tra API rồi tải lại trang.
              </p>
            )}
            {session.isSuccess && !session.data && (
              <>
                <p>Chưa có lượt chơi trên trình duyệt này.</p>
                <button
                  type="button"
                  disabled={started.isPending}
                  onClick={() => started.mutate()}
                >
                  {started.isPending
                    ? "Đang tạo lượt…"
                    : "Bắt đầu lượt điều tra"}
                </button>
              </>
            )}
            {session.data && (
              <>
                <p>
                  Mốc đã lưu:{" "}
                  <strong>
                    {session.data.checkpointId === "meeting-zone"
                      ? "Khu họp"
                      : "Sảnh văn phòng"}
                  </strong>
                </p>
                <p>Phiên bản tiến độ: {session.data.revision}</p>
                {session.data.checkpointId === "office-entry" && (
                  <button
                    type="button"
                    disabled={checkpoint.isPending}
                    onClick={() => checkpoint.mutate()}
                  >
                    {checkpoint.isPending ? "Đang lưu…" : "Lưu thử mốc khu họp"}
                  </button>
                )}
              </>
            )}
            {(started.isError || checkpoint.isError) && (
              <p role="alert">
                Không lưu được tiến độ. Hãy kiểm tra API hoặc tải lại trang rồi
                thử lại.
              </p>
            )}
          </div>
        </aside>

        <div className="scene-card">
          <div className="scene-toolbar">
            <span>FLOOR 08 · MAIN OFFICE</span>
            <span className="prototype-tag">OFFICE MAP · MOVEMENT</span>
          </div>
          <Suspense
            fallback={
              <div className="game-loading">Đang dựng hiện trường…</div>
            }
          >
            <GameCanvas onLifecycle={handleLifecycle} />
          </Suspense>
        </div>
      </section>

      {health.isError && (
        <p className="api-warning" role="alert">
          Backend chưa phản hồi. Khởi động API tại cổng 5062 rồi thử tải lại
          trang.
        </p>
      )}
    </main>
  );
}
