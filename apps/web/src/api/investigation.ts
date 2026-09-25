import type { WorldInteraction } from '../game/bridge/events'

export type CaseMap = { caseId: string; caseVersion: string; interactions: WorldInteraction[] }
export type GlossaryItem = { id: string; term: string; meaningVi: string; exampleEn: string }
export type EvidenceSummary = { id: string; kind: string; title: string }
export type Notebook = { caseId: string; caseVersion: string; evidence: EvidenceSummary[]; glossary: GlossaryItem[] }
export type Evidence = EvidenceSummary & { body: string; glossary: GlossaryItem[] }
export type InteractionResult = {
  interactionId: string; kind: 'evidence' | 'npc'; revision: number; title: string | null
  dialogue: string[] | null; collectedEvidenceId: string | null; statementLocked: boolean
}

export class InvestigationError extends Error {
  readonly status: number
  readonly code: string
  constructor(status: number, code: string) {
    super(code)
    this.status = status
    this.code = code
  }
}

async function readJson(response: Response): Promise<unknown> {
  const value: unknown = await response.json()
  if (!response.ok) {
    const problem = value && typeof value === 'object' ? value as Record<string, unknown> : {}
    throw new InvestigationError(response.status, String(problem.code ?? 'request_failed'))
  }
  return value
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid investigation response')
  return value as Record<string, unknown>
}

function list(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) throw new Error('Invalid investigation response')
  return value.map(record)
}

function string(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Invalid investigation response')
  return value
}

function glossary(value: unknown): GlossaryItem[] {
  return list(value).map(item => ({ id: string(item.id), term: string(item.term),
    meaningVi: string(item.meaningVi), exampleEn: string(item.exampleEn) }))
}

export async function getCaseMap(caseId: string, version: string): Promise<CaseMap> {
  const value = record(await readJson(await fetch(`/api/v1/cases/${encodeURIComponent(caseId)}/map?version=${encodeURIComponent(version)}`)))
  return { caseId: string(value.caseId), caseVersion: string(value.caseVersion),
    interactions: list(value.interactions).map(item => {
      if ((item.kind !== 'npc' && item.kind !== 'evidence') ||
          typeof item.x !== 'number' || typeof item.y !== 'number' || typeof item.radius !== 'number')
        throw new Error('Invalid case map')
      return { id: string(item.id), kind: item.kind, labelVi: string(item.labelVi),
        x: item.x, y: item.y, radius: item.radius }
    }) }
}

export async function getNotebook(): Promise<Notebook> {
  const value = record(await readJson(await fetch('/api/v1/session/notebook')))
  return { caseId: string(value.caseId), caseVersion: string(value.caseVersion),
    evidence: list(value.evidence).map(item => ({ id: string(item.id), kind: string(item.kind), title: string(item.title) })),
    glossary: glossary(value.glossary) }
}

export async function getEvidence(id: string): Promise<Evidence> {
  const value = record(await readJson(await fetch(`/api/v1/session/evidence/${encodeURIComponent(id)}`)))
  return { id: string(value.id), kind: string(value.kind), title: string(value.title),
    body: string(value.body), glossary: glossary(value.glossary) }
}

export async function interact(id: string, submissionId: string, revision: number): Promise<InteractionResult> {
  const value = record(await readJson(await fetch(`/api/v1/session/interactions/${encodeURIComponent(id)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Office-Request': '1' },
    body: JSON.stringify({ submissionId, revision }),
  })))
  if ((value.kind !== 'npc' && value.kind !== 'evidence') || typeof value.revision !== 'number' ||
      (value.title !== null && typeof value.title !== 'string') ||
      (value.collectedEvidenceId !== null && typeof value.collectedEvidenceId !== 'string') ||
      typeof value.statementLocked !== 'boolean' ||
      (value.dialogue !== null && (!Array.isArray(value.dialogue) || !value.dialogue.every(item => typeof item === 'string'))))
    throw new Error('Invalid interaction response')
  return { interactionId: string(value.interactionId), kind: value.kind, revision: value.revision,
    title: value.title, dialogue: value.dialogue, collectedEvidenceId: value.collectedEvidenceId,
    statementLocked: value.statementLocked } as InteractionResult
}
