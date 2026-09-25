import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { getCaseMap, getEvidence, getNotebook, interact, InvestigationError, type Evidence, type InteractionResult } from "./api/investigation";
import {
  resumeSession,
  saveMeetingCheckpoint,
  startSession,
  type SessionProgress,
} from "./api/session";
import type { GameLifecycleEvent, WorldInteraction } from "./game/bridge/events";
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
  const [nearby, setNearby] = useState<WorldInteraction | null>(null);
  const [overlay, setOverlay] = useState<"notebook" | "dialogue" | null>(null);
  const [dialogue, setDialogue] = useState<InteractionResult | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const retryRef = useRef<{ id: string; submissionId: string; revision: number } | null>(null);
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
  const caseMap = useQuery({
    queryKey: ["case-map", session.data?.caseId, session.data?.caseVersion],
    queryFn: () => getCaseMap(session.data!.caseId, session.data!.caseVersion),
    enabled: !!session.data,
  });
  const notebook = useQuery({ queryKey: ["notebook"], queryFn: getNotebook, enabled: !!session.data });
  const evidence = useQuery({
    queryKey: ["evidence", selectedEvidenceId], queryFn: () => getEvidence(selectedEvidenceId!),
    enabled: !!selectedEvidenceId && overlay === "notebook",
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
  const interaction = useMutation({
    mutationFn: ({ id, submissionId, revision }: { id: string; submissionId: string; revision: number }) =>
      interact(id, submissionId, revision),
    onSuccess: (result) => {
      retryRef.current = null;
      queryClient.setQueryData<SessionProgress>(["session"], previous =>
        previous ? { ...previous, revision: result.revision } : previous);
      void queryClient.invalidateQueries({ queryKey: ["notebook"] });
      setNotice(null);
      if (result.dialogue) {
        setDialogue(result);
        setOverlay("dialogue");
      } else if (result.collectedEvidenceId) {
        setSelectedEvidenceId(result.collectedEvidenceId);
        setOverlay("notebook");
      }
    },
    onError: (error) => {
      if (error instanceof InvestigationError && error.code === "interaction_locked")
        setNotice("Manh mối này chưa mở. Hãy tiếp tục điều tra trước.");
      else if (error instanceof InvestigationError && error.code === "revision_conflict")
        setNotice("Tiến độ đã thay đổi. Đang tải lại để thử tiếp.");
      else setNotice("Không thể tương tác. Kiểm tra kết nối rồi thử lại.");
      if (error instanceof InvestigationError) {
        retryRef.current = null;
        void queryClient.invalidateQueries({ queryKey: ["session"] });
      }
    },
  });
  const handleLifecycle = useCallback((event: GameLifecycleEvent) => {
    if (event.type === "ready") setGameStatus("Hiện trường đã sẵn sàng");
    if (event.type === "destroyed") setGameStatus("Hiện trường đã đóng");
    if (event.type === "play-state")
      setGameStatus(event.state === "paused" ? "Đã tạm dừng" : "Đang khám phá");
    if (event.type === "interaction-nearby") setNearby(event.interaction);
    if (event.type === "interaction-requested" && session.data && !interaction.isPending && !overlay) {
      setNotice(null);
      const pending = retryRef.current;
      const request = pending?.id === event.interactionId ? pending :
        { id: event.interactionId, submissionId: crypto.randomUUID(), revision: session.data.revision };
      retryRef.current = request;
      interaction.mutate(request);
    }
  }, [session.data, interaction, overlay]);

  useEffect(() => {
    if (!overlay) return;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        setOverlay(null);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [overlay]);

  useEffect(() => {
    if (overlay) return;
    document.querySelector<HTMLElement>(".game-canvas")?.focus();
  }, [overlay]);

  const openNotebook = () => { setSelectedEvidenceId(null); setOverlay("notebook"); };

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
            Tìm email, chat và biên bản; nói chuyện với đồng nghiệp để hiểu vụ báo cáo bị tráo.
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
            <span><kbd>E</kbd> Tương tác khi đứng gần điểm điều tra</span>
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
                <button type="button" onClick={openNotebook}>Mở sổ tay điều tra</button>
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
            <span className="prototype-tag">OFFICE MAP · INVESTIGATION</span>
          </div>
          {caseMap.isError && <p role="alert" className="scene-notice">Không tải được bản đồ vụ án. Kiểm tra API rồi tải lại trang.</p>}
          {nearby && session.data && <p className="scene-notice" aria-live="polite"><kbd>E</kbd> {nearby.labelVi}</p>}
          {notice && <p role="alert" className="scene-notice">{notice}</p>}
          <Suspense
            fallback={
              <div className="game-loading">Đang dựng hiện trường…</div>
            }
          >
            <GameCanvas onLifecycle={handleLifecycle} interactions={caseMap.data?.interactions ?? []} overlayOpen={!!overlay} />
          </Suspense>
        </div>
      </section>

      {overlay && <div className="investigation-backdrop">
        <section ref={dialogRef} tabIndex={-1} className="investigation-dialog" role="dialog" aria-modal="true" aria-label={overlay === "notebook" ? "Sổ tay điều tra" : "Hội thoại"}>
          <button className="close-dialog" type="button" onClick={() => setOverlay(null)}>Đóng (Esc)</button>
          {overlay === "dialogue" && dialogue && <>
            <h2>{dialogue.title ?? "Đồng nghiệp"}</h2>
            {dialogue.dialogue?.map((line, index) => <p key={index}>{line}</p>)}
            {dialogue.statementLocked && <p className="muted">Lời khai chi tiết sẽ mở khi có đủ bằng chứng.</p>}
          </>}
          {overlay === "notebook" && <>
            <h2>Sổ tay điều tra</h2>
            {notebook.isPending && <p>Đang tải manh mối…</p>}
            {notebook.isError && <p role="alert">Không tải được sổ tay. Hãy thử lại.</p>}
            {notebook.data && <div className="notebook-layout">
              <nav aria-label="Manh mối đã thu thập">
                <h3>Manh mối ({notebook.data.evidence.length})</h3>
                {notebook.data.evidence.length === 0 && <p>Chưa thu thập manh mối nào.</p>}
                {notebook.data.evidence.map(item => <button type="button" key={item.id}
                  onClick={() => setSelectedEvidenceId(item.id)} aria-current={selectedEvidenceId === item.id ? "true" : undefined}>
                  {item.id} · {item.title}</button>)}
              </nav>
              <article>
                {selectedEvidenceId && evidence.isPending && <p>Đang tải nội dung…</p>}
                {selectedEvidenceId && evidence.isError && <p role="alert">Không đọc được manh mối này.</p>}
                {selectedEvidenceId && evidence.data && <EvidenceDetail evidence={evidence.data} />}
                {!selectedEvidenceId && <p>Chọn một manh mối để đọc.</p>}
                <h3>Từ vựng đã gặp</h3>
                {notebook.data.glossary.length === 0 && <p>Chưa có từ vựng.</p>}
                <dl className="glossary-list">{notebook.data.glossary.map(item => <div key={item.id}>
                  <dt>{item.term} — {item.meaningVi}</dt><dd>{item.exampleEn}</dd>
                </div>)}</dl>
              </article>
            </div>}
          </>}
        </section>
      </div>}

      {health.isError && (
        <p className="api-warning" role="alert">
          Backend chưa phản hồi. Khởi động API tại cổng 5062 rồi thử tải lại
          trang.
        </p>
      )}
    </main>
  );
}

function EvidenceDetail({ evidence }: { evidence: Evidence }) {
  return <><h3>{evidence.id} · {evidence.title}</h3><p lang="en">{evidence.body}</p></>;
}
