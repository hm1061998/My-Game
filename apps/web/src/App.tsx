import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { answerQuestion, getCaseMap, getEvidence, getNotebook, getQuestions, interact, InvestigationError,
  type AnswerResult, type Evidence, type InteractionResult } from "./api/investigation";
import {
  resumeSession,
  recordEncounter,
  saveMeetingCheckpoint,
  startSession,
  type SessionProgress,
} from "./api/session";
import type { GameLifecycleEvent, WorldInteraction } from "./game/bridge/events";
import { currentObjective } from "./game/presentation";
import { ResolutionPanel } from "./ResolutionPanel";
import { SceneHud } from "./SceneHud";
import { StatusBadge } from "./StatusBadge";
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
  const [overlay, setOverlay] = useState<"notebook" | "dialogue" | "retry" | "resolution" | null>(null);
  const [dialogue, setDialogue] = useState<InteractionResult | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<AnswerResult | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [assistEnabled, setAssistEnabled] = useState(false);
  const [encounterError, setEncounterError] = useState<string | null>(null);
  const [encounterOutcome, setEncounterOutcome] = useState<"detected" | "cleared" | null>(null);
  const [gameGeneration, setGameGeneration] = useState(0);
  const dialogRef = useRef<HTMLElement>(null);
  const retryRef = useRef<{ id: string; submissionId: string; revision: number } | null>(null);
  const answerRetryRef = useRef<{ id: string; choiceId: string; submissionId: string; revision: number } | null>(null);
  const encounterRetryRef = useRef<{ outcome: "detected" | "cleared"; assistanceUsed: boolean;
    submissionId: string; revision: number } | null>(null);
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
  const questions = useQuery({ queryKey: ["questions"], queryFn: getQuestions, enabled: !!session.data });
  const evidence = useQuery({
    queryKey: ["evidence", selectedEvidenceId], queryFn: () => getEvidence(selectedEvidenceId!),
    enabled: !!selectedEvidenceId && overlay === "notebook",
  });
  const started = useMutation({
    mutationFn: startSession,
    onSuccess: (progress) => {
      queryClient.setQueryData<SessionProgress>(["session"], progress);
      void queryClient.invalidateQueries({ queryKey: ["notebook"] });
      void queryClient.invalidateQueries({ queryKey: ["questions"] });
      void queryClient.removeQueries({ queryKey: ["result"] });
      void queryClient.removeQueries({ queryKey: ["review"] });
      void queryClient.removeQueries({ queryKey: ["conclusion"] });
      setGameGeneration(value => value + 1);
      setOverlay(null); setSelectedEvidenceId(null); setSelectedQuestionId(null);
    },
  });
  const checkpoint = useMutation({
    mutationFn: () => saveMeetingCheckpoint(session.data!.revision),
    onSuccess: (progress) => {
      queryClient.setQueryData<SessionProgress>(["session"], progress);
      setNotice("Đã lưu mốc an toàn tại khu họp.");
    },
    onError: () => {
      setNotice("Không lưu được mốc an toàn. Đứng gần dấu mốc để thử lại.");
      void queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
  const encounter = useMutation({
    mutationFn: ({ outcome, assistanceUsed, submissionId, revision }:
      { outcome: "detected" | "cleared"; assistanceUsed: boolean;
        submissionId: string; revision: number }) =>
      recordEncounter(outcome, assistanceUsed, submissionId, revision),
    onSuccess: (progress, request) => {
      encounterRetryRef.current = null;
      queryClient.setQueryData<SessionProgress>(["session"], progress);
      setEncounterError(null);
      if (request.outcome === "cleared") {
        setOverlay(null);
        setNotice("Đã vượt máy quét. Nhấn E tại terminal để đọc hồ sơ E03.");
      } else setNotice("Bị phát hiện; quay về mốc an toàn. Bạn có thể thử lại.");
    },
    onError: () => {
      setEncounterError("Không lưu được kết quả. Hãy thử gửi lại trước khi tiếp tục.");
      setOverlay("retry");
      void queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
  const interaction = useMutation({
    mutationFn: ({ id, submissionId, revision }: { id: string; submissionId: string; revision: number }) =>
      interact(id, submissionId, revision),
    onSuccess: (result) => {
      retryRef.current = null;
      queryClient.setQueryData<SessionProgress>(["session"], previous =>
        previous ? { ...previous, revision: result.revision } : previous);
      void queryClient.invalidateQueries({ queryKey: ["notebook"] });
      void queryClient.invalidateQueries({ queryKey: ["questions"] });
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
  const answer = useMutation({
    mutationFn: ({ id, choiceId, submissionId, revision }:
      { id: string; choiceId: string; submissionId: string; revision: number }) =>
      answerQuestion(id, choiceId, submissionId, revision),
    onSuccess: (result) => {
      answerRetryRef.current = null;
      queryClient.setQueryData<SessionProgress>(["session"], previous =>
        previous ? { ...previous, revision: result.revision } : previous);
      void queryClient.invalidateQueries({ queryKey: ["questions"] });
      setAnswerFeedback(result);
      setAnswerError(null);
    },
    onError: (error) => {
      setAnswerError(error instanceof InvestigationError && error.code === "revision_conflict"
        ? "Tiến độ đã thay đổi. Hãy tải lại sổ tay rồi thử lại."
        : "Không gửi được câu trả lời. Hãy kiểm tra kết nối rồi thử lại.");
      if (error instanceof InvestigationError) {
        answerRetryRef.current = null;
        void queryClient.invalidateQueries({ queryKey: ["session"] });
        void queryClient.invalidateQueries({ queryKey: ["questions"] });
      }
    },
  });
  const handleLifecycle = useCallback((event: GameLifecycleEvent) => {
    if (event.type === "ready") setGameStatus("Hiện trường đã sẵn sàng");
    if (event.type === "destroyed") setGameStatus("Hiện trường đã đóng");
    if (event.type === "play-state")
      setGameStatus(event.state === "paused" ? "Đã tạm dừng" : "Đang khám phá");
    if (event.type === "interaction-nearby") setNearby(event.interaction);
    if (event.type === "checkpoint-reached" && session.data?.checkpointId === "office-entry" &&
        !checkpoint.isPending) checkpoint.mutate();
    if (event.type === "encounter-checkpoint-required")
      setNotice("Hãy chạm mốc an toàn tại khu họp trước khi vào kho lưu trữ.");
    if ((event.type === "encounter-detected" || event.type === "encounter-cleared") &&
        session.data && !encounter.isPending && !encounterRetryRef.current) {
      const request = { outcome: event.type === "encounter-detected" ? "detected" as const : "cleared" as const,
        assistanceUsed: event.type === "encounter-cleared" && assistEnabled,
        submissionId: crypto.randomUUID(), revision: session.data.revision };
      encounterRetryRef.current = request;
      setEncounterOutcome(request.outcome);
      setEncounterError(null);
      if (request.outcome === "detected") setOverlay("retry");
      encounter.mutate(request);
    }
    if (event.type === "interaction-requested" && session.data && !interaction.isPending && !overlay) {
      setNotice(null);
      const pending = retryRef.current;
      const request = pending?.id === event.interactionId ? pending :
        { id: event.interactionId, submissionId: crypto.randomUUID(), revision: session.data.revision };
      retryRef.current = request;
      interaction.mutate(request);
    }
  }, [session.data, interaction, overlay, checkpoint, encounter, assistEnabled]);

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
  const selectQuestion = (id: string) => {
    setSelectedQuestionId(id); setSelectedChoiceId(null); setAnswerFeedback(null); setAnswerError(null);
  };
  const submitAnswer = () => {
    if (!session.data || !selectedQuestionId || !selectedChoiceId || answer.isPending) return;
    const previous = answerRetryRef.current;
    const request = previous?.id === selectedQuestionId && previous.choiceId === selectedChoiceId ? previous :
      { id: selectedQuestionId, choiceId: selectedChoiceId,
        submissionId: crypto.randomUUID(), revision: session.data.revision };
    answerRetryRef.current = request;
    answer.mutate(request);
  };
  const retryEncounter = () => {
    const request = encounterRetryRef.current;
    if (request) encounter.mutate(request);
  };
  const activeQuestion = questions.data?.find(item => item.id === selectedQuestionId);
  const worldState = useMemo(() => session.data ? {
    checkpointId: session.data.checkpointId,
    encounterCleared: session.data.encounterCleared,
    assistEnabled,
  } : undefined, [session.data, assistEnabled]);
  const objective = currentObjective(session.data ?? null);

  return (
    <main className="app-shell">
      <header className="case-bar">
        <div className="case-title">
          <p className="eyebrow">OFFICE CASE FILES · CASE 01</p>
          <h1>The Swapped Report</h1>
        </div>
        <p className="case-summary">
          Một bản báo cáo quan trọng đã bị tráo. Hãy khám phá văn phòng, đọc
          manh mối tiếng Anh và tìm ra chuyện gì đã xảy ra.
        </p>
        <div className="status-panel" aria-label="Trạng thái hệ thống">
          <StatusBadge tone={gameStatus.startsWith("Đang khởi") ? "loading" : "success"}>
            <span className="status-key">Game</span> {gameStatus}
          </StatusBadge>
          <StatusBadge tone={health.isSuccess ? "success" : health.isError ? "offline" : "loading"}>
            <span className="status-key">API</span>{" "}
            {health.isSuccess ? "Đã kết nối" : health.isError ? "Chưa kết nối" : "Đang kiểm tra…"}
          </StatusBadge>
        </div>
      </header>

      <section className={`workspace${drawerOpen ? "" : " drawer-collapsed"}`} aria-label="Khu vực điều tra">
        <div className="scene-card">
          <div className="scene-stage">
            <SceneHud objective={objective} session={session.data ?? null} nearby={nearby}
              notice={notice} mapError={caseMap.isError} />
            <Suspense fallback={<div className="game-loading"><StatusBadge tone="loading">Đang dựng hiện trường…</StatusBadge></div>}>
              <GameCanvas key={gameGeneration} onLifecycle={handleLifecycle} interactions={caseMap.data?.interactions ?? []}
                overlayOpen={!!overlay} worldState={worldState} />
            </Suspense>
          </div>
          <div className="control-strip" aria-label="Điều khiển">
            <span><kbd>WASD</kbd>/<kbd>↑↓←→</kbd> Di chuyển</span>
            <span><kbd>Shift</kbd> Chạy</span>
            <span><kbd>E</kbd> Tương tác</span>
            <span><kbd>Space</kbd> Né máy quét</span>
            <span><kbd>Esc</kbd> Tạm dừng</span>
          </div>
          <p className="desktop-notice" role="note">Gameplay cần bàn phím desktop. Nội dung hồ sơ và kết quả vẫn đọc được trên màn hình hẹp.</p>
        </div>

        <aside className="mission-drawer" aria-label="Nhiệm vụ và lượt điều tra">
          <button type="button" className="drawer-toggle" aria-expanded={drawerOpen}
            aria-controls="mission-drawer-body" onClick={() => setDrawerOpen(open => !open)}>
            <span aria-hidden="true">{drawerOpen ? "›" : "‹"}</span>
            <span className="drawer-toggle-label">{drawerOpen ? "Thu gọn" : "Nhiệm vụ"}</span>
          </button>
          <div id="mission-drawer-body" className="drawer-body" hidden={!drawerOpen}>
            <p className="label">NHIỆM VỤ HIỆN TẠI</p>
            <h2 lang="en">Explore the office</h2>
            <p>{objective}</p>
            <div className="session-panel" aria-live="polite">
              <h3>Lượt điều tra</h3>
              {session.isPending && <StatusBadge tone="loading">Đang kiểm tra lượt chơi…</StatusBadge>}
              {session.isError && <StatusBadge tone="offline" role="alert">
                Không tải được tiến độ. Kiểm tra API rồi tải lại trang.</StatusBadge>}
              {session.isSuccess && !session.data && (
                <>
                  <StatusBadge tone="missing">Chưa có lượt chơi trên trình duyệt này.</StatusBadge>
                  <button type="button" className="primary-action" disabled={started.isPending}
                    onClick={() => started.mutate()}>
                    {started.isPending ? "Đang tạo lượt…" : "Bắt đầu lượt điều tra"}
                  </button>
                </>
              )}
              {session.data && (
                <>
                  <button type="button" className="primary-action" onClick={openNotebook}>Mở sổ tay điều tra</button>
                  <button type="button" className="secondary-action" onClick={() => setOverlay("resolution")}>
                    {session.data.status === "Completed" ? "Xem kết quả vụ án" : "Kết luận vụ án"}
                  </button>
                  <div className="session-facts">
                    <p>Mốc đã lưu:{" "}
                      <strong>{session.data.checkpointId === "meeting-zone" ? "Khu họp" : "Sảnh văn phòng"}</strong>
                    </p>
                    <p>Máy quét: {session.data.encounterCleared ? "Đã vượt" :
                      `${session.data.encounterFailures} lần bị phát hiện`}</p>
                    {session.data.assistanceUsed && <p>Đã dùng chế độ hỗ trợ quét chậm.</p>}
                    <p className="diagnostic">Phiên bản tiến độ: {session.data.revision}</p>
                  </div>
                </>
              )}
              {started.isError && <StatusBadge tone="offline" role="alert">
                Không lưu được tiến độ. Hãy kiểm tra API hoặc tải lại trang rồi thử lại.</StatusBadge>}
            </div>
          </div>
        </aside>
      </section>

      {overlay && <div className="investigation-backdrop">
        <section ref={dialogRef} tabIndex={-1} className="investigation-dialog" role="dialog" aria-modal="true"
          aria-label={overlay === "notebook" ? "Sổ tay điều tra" : overlay === "retry" ? "Kết quả máy quét" : overlay === "resolution" ? "Hoàn tất vụ án" : "Hội thoại"}>
          <button className="close-dialog" type="button" onClick={() => setOverlay(null)}>Đóng (Esc)</button>
          {overlay === "retry" && <>
            <h2>{encounterOutcome === "cleared" ?
              "Xác nhận vượt máy quét" : "Bị máy quét phát hiện"}</h2>
            <StatusBadge tone={encounterOutcome === "cleared" ? "success" : "recovery"}>
              {encounterOutcome === "cleared" ? "Đang lưu kết quả vượt qua máy quét." :
                "Bạn đã quay về mốc an toàn. Manh mối và câu trả lời đã lưu vẫn còn."}</StatusBadge>
            <p>Số lần bị phát hiện: {session.data?.encounterFailures ?? 0}</p>
            {session.data && session.data.encounterFailures >= 2 && !assistEnabled &&
              <button type="button" onClick={() => setAssistEnabled(true)}>Bật hỗ trợ: máy quét chậm hơn</button>}
            {assistEnabled && <p>Hỗ trợ quét chậm đang bật; không ảnh hưởng điểm tiếng Anh.</p>}
            {encounterError && <p role="alert">{encounterError}</p>}
            {encounterError &&
              <button type="button" disabled={encounter.isPending}
                onClick={retryEncounter}>Gửi lại kết quả</button>}
            <button type="button" disabled={encounter.isPending || !!encounterError}
              onClick={() => setOverlay(null)}>Thử lại</button>
          </>}
          {overlay === "dialogue" && dialogue && <>
            <h2>{dialogue.title ?? "Đồng nghiệp"}</h2>
            {dialogue.dialogue?.map((line, index) => <p key={index}>{line}</p>)}
            {dialogue.statementLocked && <StatusBadge tone="locked">Lời khai chi tiết sẽ mở khi có đủ bằng chứng.</StatusBadge>}
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
                <h3>Câu hỏi đọc hiểu</h3>
                {questions.isPending && <p>Đang tải câu hỏi…</p>}
                {questions.isError && <p role="alert">Không tải được câu hỏi.</p>}
                {questions.data?.length === 0 && <p>Thu thập manh mối để mở câu hỏi.</p>}
                <div className="question-list">{questions.data?.map(item => <button type="button" key={item.id}
                  onClick={() => selectQuestion(item.id)} aria-current={selectedQuestionId === item.id ? "true" : undefined}>
                  {item.id} · {item.isPassed ? "Đã hoàn thành" : "Cần trả lời"}
                </button>)}</div>
                {activeQuestion && <section className="question-card" aria-label={`Câu hỏi ${activeQuestion.id}`}>
                  <h4>{activeQuestion.id}</h4><p lang="en">{activeQuestion.prompt}</p>
                  <p>Số lần trả lời: {activeQuestion.attempts}</p>
                  {!activeQuestion.isPassed && <>
                    <div role="radiogroup" aria-label="Chọn câu trả lời">
                      {activeQuestion.choices.map(choice => <label key={choice.id}>
                        <input type="radio" name="answer-choice" value={choice.id}
                          checked={selectedChoiceId === choice.id}
                          onChange={() => { setSelectedChoiceId(choice.id); setAnswerError(null); }} />
                        <span lang="en">{choice.text}</span>
                      </label>)}
                    </div>
                    <button type="button" disabled={!selectedChoiceId || answer.isPending} onClick={submitAnswer}>
                      {answer.isPending ? "Đang gửi…" : "Trả lời"}
                    </button>
                  </>}
                  {answerFeedback?.questionId === activeQuestion.id && <p role="status" className="answer-feedback">
                    {answerFeedback.isCorrect ? "Chính xác! Hãy kiểm tra hồ sơ vừa mở tại điểm điều tra." :
                      "Chưa đúng. Hãy đọc lại manh mối và thử lần nữa."}
                    {answerFeedback.explanation && <span lang="en"> {answerFeedback.explanation}</span>}
                  </p>}
                  {activeQuestion.isPassed && !answerFeedback && activeQuestion.explanation &&
                    <p lang="en" className="answer-feedback">{activeQuestion.explanation}</p>}
                  {answerError && <p role="alert">{answerError}</p>}
                </section>}
                <h3>Từ vựng đã gặp</h3>
                {notebook.data.glossary.length === 0 && <p>Chưa có từ vựng.</p>}
                <dl className="glossary-list">{notebook.data.glossary.map(item => <div key={item.id}>
                  <dt>{item.term} — {item.meaningVi}</dt><dd>{item.exampleEn}</dd>
                </div>)}</dl>
              </article>
            </div>}
          </>}
          {overlay === "resolution" && session.data && <ResolutionPanel session={session.data}
            replayPending={started.isPending} onReplay={() => started.mutate()} />}
        </section>
      </div>}

      {health.isError && (
        <div className="api-warning"><StatusBadge tone="offline" role="alert">
          Backend chưa phản hồi. Khởi động API tại cổng 5062 rồi thử tải lại trang.
        </StatusBadge></div>
      )}
    </main>
  );
}

function EvidenceDetail({ evidence }: { evidence: Evidence }) {
  return <><h3>{evidence.id} · {evidence.title}</h3><p lang="en">{evidence.body}</p></>;
}
