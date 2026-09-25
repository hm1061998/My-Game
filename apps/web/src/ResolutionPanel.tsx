import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { InvestigationError } from './api/investigation'
import { answerReview, getConclusion, getResult, getReview, submitConclusion,
  type ConclusionResult, type ReviewAnswer } from './api/resolution'
import type { SessionProgress } from './api/session'

type Props = { session: SessionProgress; replayPending: boolean; onReplay: () => void }

export function ResolutionPanel({ session, replayPending, onReplay }: Props) {
  const queryClient = useQueryClient()
  const [view, setView] = useState<'conclusion' | 'result' | 'review'>(
    session.status === 'Completed' ? 'result' : 'conclusion')
  const [suspectId, setSuspectId] = useState('')
  const [reasonId, setReasonId] = useState('')
  const [evidenceIds, setEvidenceIds] = useState<string[]>([])
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviewItemId, setReviewItemId] = useState<string | null>(null)
  const [reviewChoiceId, setReviewChoiceId] = useState<string | null>(null)
  const [reviewFeedback, setReviewFeedback] = useState<ReviewAnswer | null>(null)
  const conclusionRetry = useRef<{ suspectId: string; reasonId: string; evidenceIds: string[];
    submissionId: string; revision: number } | null>(null)
  const reviewRetry = useRef<{ itemId: string; choiceId: string; submissionId: string; revision: number } | null>(null)

  const conclusion = useQuery({ queryKey: ['conclusion'], queryFn: getConclusion })
  const result = useQuery({ queryKey: ['result'], queryFn: getResult,
    enabled: session.status === 'Completed' || view === 'result' })
  const review = useQuery({ queryKey: ['review'], queryFn: getReview,
    enabled: session.status === 'Completed' && view === 'review' })

  const submit = useMutation({
    mutationFn: (request: NonNullable<typeof conclusionRetry.current>) =>
      submitConclusion(request.suspectId, request.reasonId, request.evidenceIds,
        request.submissionId, request.revision),
    onSuccess: (data: ConclusionResult) => {
      conclusionRetry.current = null
      queryClient.setQueryData<SessionProgress>(['session'], previous => previous ?
        { ...previous, status: 'Completed', revision: data.revision } : previous)
      queryClient.setQueryData(['result'], data)
      setError(null); setConfirming(false); setView('result')
    },
    onError: (problem) => {
      setError(problem instanceof InvestigationError && problem.code === 'revision_conflict'
        ? 'Tiến độ đã thay đổi. Đã tải lại trạng thái; lựa chọn của bạn vẫn được giữ.'
        : 'Không gửi được kết luận. Lựa chọn vẫn được giữ để bạn thử lại.')
      if (problem instanceof InvestigationError) {
        void queryClient.invalidateQueries({ queryKey: ['session'] })
        if (problem.code === 'revision_conflict') conclusionRetry.current = null
        if (problem.code === 'conclusion_completed') {
          void queryClient.invalidateQueries({ queryKey: ['result'] }); setView('result')
        }
      }
    },
  })

  const reviewAnswer = useMutation({
    mutationFn: (request: NonNullable<typeof reviewRetry.current>) =>
      answerReview(request.itemId, request.choiceId, request.submissionId, request.revision),
    onSuccess: data => {
      reviewRetry.current = null
      queryClient.setQueryData<SessionProgress>(['session'], previous => previous ?
        { ...previous, revision: data.revision } : previous)
      setReviewFeedback(data); setError(null)
      void queryClient.invalidateQueries({ queryKey: ['review'] })
    },
    onError: problem => {
      setError(problem instanceof InvestigationError && problem.code === 'revision_conflict'
        ? 'Tiến độ review đã thay đổi. Đang tải lại; lựa chọn vẫn được giữ.'
        : 'Không gửi được câu trả lời review. Hãy thử lại.')
      if (problem instanceof InvestigationError) {
        reviewRetry.current = null
        void queryClient.invalidateQueries({ queryKey: ['session'] })
        void queryClient.invalidateQueries({ queryKey: ['review'] })
      }
    },
  })

  const activeView = session.status === 'Completed' && view === 'conclusion' ? 'result' : view

  const sendConclusion = () => {
    if (!suspectId || !reasonId || evidenceIds.length !== 2 || submit.isPending) return
    const previous = conclusionRetry.current
    const same = previous?.suspectId === suspectId && previous.reasonId === reasonId &&
      previous.evidenceIds.join('|') === evidenceIds.join('|')
    const request = same ? previous : { suspectId, reasonId, evidenceIds: [...evidenceIds],
      submissionId: crypto.randomUUID(), revision: session.revision }
    conclusionRetry.current = request
    submit.mutate(request)
  }
  const sendReview = () => {
    if (!reviewItemId || !reviewChoiceId || reviewAnswer.isPending) return
    const previous = reviewRetry.current
    const request = previous?.itemId === reviewItemId && previous.choiceId === reviewChoiceId ? previous :
      { itemId: reviewItemId, choiceId: reviewChoiceId, submissionId: crypto.randomUUID(), revision: session.revision }
    reviewRetry.current = request
    reviewAnswer.mutate(request)
  }
  const activeReview = review.data?.find(item => item.id === reviewItemId) ?? review.data?.find(item => !item.isCompleted)

  return <div className="resolution-panel">
    <nav className="resolution-tabs" aria-label="Hoàn tất vụ án">
      {session.status !== 'Completed' && <button type="button" aria-current={activeView === 'conclusion'} onClick={() => setView('conclusion')}>Kết luận</button>}
      {session.status === 'Completed' && <button type="button" aria-current={activeView === 'result'} onClick={() => setView('result')}>Kết quả</button>}
      {session.status === 'Completed' && <button type="button" aria-current={activeView === 'review'} onClick={() => setView('review')}>Ôn tập</button>}
    </nav>

    {activeView === 'conclusion' && <section>
      <h2>Kết luận vụ án</h2>
      {conclusion.isPending && <p>Đang kiểm tra hồ sơ…</p>}
      {conclusion.isError && <p role="alert">Không tải được biểu mẫu kết luận.</p>}
      {conclusion.data && !conclusion.data.isReady && <p role="status">Chưa sẵn sàng: hoàn thành Q01–Q03 và thu thập E03, E06.</p>}
      {conclusion.data?.isReady && <>
        <fieldset><legend>Ai đã thay tệp?</legend>{conclusion.data.suspects.map(item => <label key={item.id}>
          <input type="radio" name="suspect" checked={suspectId === item.id} onChange={() => { setSuspectId(item.id); setConfirming(false) }} /> {item.label}
        </label>)}</fieldset>
        <fieldset><legend>Lý do</legend>{conclusion.data.reasons.map(item => <label key={item.id}>
          <input type="radio" name="reason" checked={reasonId === item.id} onChange={() => { setReasonId(item.id); setConfirming(false) }} /> <span lang="en">{item.label}</span>
        </label>)}</fieldset>
        <fieldset><legend>Chọn đúng 2 bằng chứng</legend>{conclusion.data.evidence.map(item => <label key={item.id}>
          <input type="checkbox" checked={evidenceIds.includes(item.id)} disabled={!evidenceIds.includes(item.id) && evidenceIds.length >= 2}
            onChange={() => { setEvidenceIds(ids => ids.includes(item.id) ? ids.filter(id => id !== item.id) : [...ids, item.id]); setConfirming(false) }} />
          {item.id} · {item.title}
        </label>)}</fieldset>
        {!confirming ? <button type="button" disabled={!suspectId || !reasonId || evidenceIds.length !== 2}
          onClick={() => setConfirming(true)}>Kiểm tra kết luận</button> : <div className="confirmation-box" role="alert">
          <p>Kết luận là quyết định cuối cùng và không thể sửa trong lượt này.</p>
          <button type="button" onClick={() => setConfirming(false)}>Quay lại sửa</button>
          <button type="button" disabled={submit.isPending} onClick={sendConclusion}>{submit.isPending ? 'Đang gửi…' : 'Xác nhận kết luận'}</button>
        </div>}
      </>}
    </section>}

    {activeView === 'result' && <section>
      <h2>Kết quả điều tra</h2>
      {result.isPending && <p>Đang tải kết quả…</p>}
      {result.isError && <p role="alert">Không tải được kết quả đã lưu.</p>}
      {result.data && <>
        <div className="score-grid"><p><strong>{result.data.readingScore}</strong><span>Điểm đọc hiểu</span></p>
          <p><strong>{result.data.investigationScore}</strong><span>Điểm điều tra</span></p></div>
        <p lang="en">{result.data.explanation}</p>
        <p>{result.data.assistanceUsed ? 'Đã dùng hỗ trợ máy quét; điểm tiếng Anh không bị ảnh hưởng.' : 'Không dùng hỗ trợ máy quét.'}</p>
        <button type="button" onClick={() => setView('review')}>Làm 5 câu ôn tập</button>
        <button type="button" disabled={replayPending} onClick={onReplay}>{replayPending ? 'Đang tạo lượt…' : 'Chơi lại vụ án'}</button>
      </>}
    </section>}

    {activeView === 'review' && <section>
      <h2>Ôn tập sau vụ án</h2>
      {review.isPending && <p>Đang tải bài ôn tập…</p>}
      {review.isError && <p role="alert">Không tải được bài ôn tập.</p>}
      {review.data && <>
        <p>Hoàn thành {review.data.filter(item => item.isCompleted).length}/5</p>
        <div className="review-list">{review.data.map(item => <button type="button" key={item.id}
          aria-current={activeReview?.id === item.id} onClick={() => { setReviewItemId(item.id); setReviewChoiceId(null); setReviewFeedback(null) }}>
          {item.id} · {item.isCompleted ? 'Đã đúng' : 'Chưa xong'}
        </button>)}</div>
        {activeReview && <div className="review-card"><h3>{activeReview.id}</h3><p lang="en">{activeReview.prompt}</p>
          {!activeReview.isCompleted && <fieldset><legend>Chọn đáp án</legend>{activeReview.choices.map(choice => <label key={choice.id}>
            <input type="radio" name="review-choice" checked={reviewChoiceId === choice.id}
              onChange={() => { setReviewItemId(activeReview.id); setReviewChoiceId(choice.id); setReviewFeedback(null) }} /> <span lang="en">{choice.text}</span>
          </label>)}</fieldset>}
          {!activeReview.isCompleted && <button type="button" disabled={!reviewChoiceId || reviewAnswer.isPending} onClick={sendReview}>
            {reviewAnswer.isPending ? 'Đang gửi…' : 'Trả lời'}</button>}
          {reviewFeedback?.reviewItemId === activeReview.id && <p role="status">{reviewFeedback.isCorrect ? 'Chính xác!' : 'Chưa đúng, hãy thử lại.'} {reviewFeedback.explanation}</p>}
          {activeReview.isCompleted && activeReview.explanation && <p lang="en">{activeReview.explanation}</p>}
        </div>}
      </>}
    </section>}
    {error && <p role="alert">{error}</p>}
  </div>
}
