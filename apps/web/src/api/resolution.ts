import { InvestigationError } from './investigation'

export type Option = { id: string; label: string }
export type ConclusionEvidence = { id: string; title: string; kind: string }
export type ConclusionView = { isReady: boolean; suspects: Option[]; reasons: Option[]; evidence: ConclusionEvidence[] }
export type ConclusionResult = { suspectId: string; reasonId: string; evidenceIds: string[];
  readingScore: number; investigationScore: number; revision: number; submittedAtUtc: string;
  explanation: string; assistanceUsed: boolean }
export type ReviewItem = { id: string; prompt: string; choices: { id: string; text: string }[];
  attempts: number; isCompleted: boolean; explanation: string | null }
export type ReviewAnswer = { reviewItemId: string; revision: number; attempts: number;
  isCorrect: boolean; isCompleted: boolean; explanation: string | null }

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid resolution response')
  return value as Record<string, unknown>
}
function list(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) throw new Error('Invalid resolution response')
  return value.map(record)
}
function string(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Invalid resolution response')
  return value
}
function number(value: unknown): number {
  if (typeof value !== 'number') throw new Error('Invalid resolution response')
  return value
}
function boolean(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new Error('Invalid resolution response')
  return value
}
async function json(response: Response): Promise<unknown> {
  const value: unknown = await response.json()
  if (!response.ok) {
    const problem = value && typeof value === 'object' ? value as Record<string, unknown> : {}
    throw new InvestigationError(response.status, String(problem.code ?? 'request_failed'))
  }
  return value
}
function parseResult(value: unknown): ConclusionResult {
  const item = record(value)
  if (!Array.isArray(item.evidenceIds) || !item.evidenceIds.every(id => typeof id === 'string'))
    throw new Error('Invalid resolution response')
  return { suspectId: string(item.suspectId), reasonId: string(item.reasonId), evidenceIds: item.evidenceIds,
    readingScore: number(item.readingScore), investigationScore: number(item.investigationScore),
    revision: number(item.revision), submittedAtUtc: string(item.submittedAtUtc),
    explanation: string(item.explanation), assistanceUsed: boolean(item.assistanceUsed) }
}

export async function getConclusion(): Promise<ConclusionView> {
  const value = record(await json(await fetch('/api/v1/session/conclusion')))
  return { isReady: boolean(value.isReady),
    suspects: list(value.suspects).map(item => ({ id: string(item.id), label: string(item.label) })),
    reasons: list(value.reasons).map(item => ({ id: string(item.id), label: string(item.label) })),
    evidence: list(value.evidence).map(item => ({ id: string(item.id), title: string(item.title), kind: string(item.kind) })) }
}
export async function submitConclusion(suspectId: string, reasonId: string, evidenceIds: string[],
  submissionId: string, revision: number): Promise<ConclusionResult> {
  return parseResult(await json(await fetch('/api/v1/session/conclusion', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Office-Request': '1' },
    body: JSON.stringify({ suspectId, reasonId, evidenceIds, submissionId, revision }),
  })))
}
export async function getResult(): Promise<ConclusionResult> {
  return parseResult(await json(await fetch('/api/v1/session/result')))
}
export async function getReview(): Promise<ReviewItem[]> {
  return list(await json(await fetch('/api/v1/session/review'))).map(item => ({
    id: string(item.id), prompt: string(item.prompt), attempts: number(item.attempts),
    isCompleted: boolean(item.isCompleted),
    explanation: item.explanation === null ? null : string(item.explanation),
    choices: list(item.choices).map(choice => ({ id: string(choice.id), text: string(choice.text) })),
  }))
}
export async function answerReview(itemId: string, choiceId: string, submissionId: string,
  revision: number): Promise<ReviewAnswer> {
  const item = record(await json(await fetch(`/api/v1/session/review/${encodeURIComponent(itemId)}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Office-Request': '1' },
    body: JSON.stringify({ choiceId, submissionId, revision }),
  })))
  return { reviewItemId: string(item.reviewItemId), revision: number(item.revision),
    attempts: number(item.attempts), isCorrect: boolean(item.isCorrect),
    isCompleted: boolean(item.isCompleted), explanation: item.explanation === null ? null : string(item.explanation) }
}
