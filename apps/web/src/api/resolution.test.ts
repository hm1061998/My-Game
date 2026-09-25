import { afterEach, describe, expect, it, vi } from 'vitest'
import { getConclusion, getReview, submitConclusion } from './resolution'

afterEach(() => vi.unstubAllGlobals())

describe('resolution API validation', () => {
  it('reads only the public conclusion choices', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      isReady: true,
      suspects: [{ id: 'nora', label: 'Nora' }],
      reasons: [{ id: 'misread', label: 'Misread' }],
      evidence: [{ id: 'E03', title: 'History', kind: 'history' }],
    }), { status: 200 })))
    const result = await getConclusion()
    expect(result.isReady).toBe(true)
    expect(result.suspects).toEqual([{ id: 'nora', label: 'Nora' }])
  })

  it('rejects malformed score responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      suspectId: 'nora', reasonId: 'misread', evidenceIds: ['E03', 'E06'],
      readingScore: '100', investigationScore: 100, revision: 1,
      submittedAtUtc: '2026-09-25T00:00:00Z', explanation: 'Done', assistanceUsed: false,
    }), { status: 200 })))
    await expect(submitConclusion('nora', 'misread', ['E03', 'E06'], crypto.randomUUID(), 0))
      .rejects.toThrow('Invalid resolution response')
  })

  it('accepts review items without private correct choice IDs', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([{
      id: 'R01', prompt: 'Prompt', choices: [{ id: 'A', text: 'Answer' }],
      attempts: 0, isCompleted: false, explanation: null,
    }]), { status: 200 })))
    const result = await getReview()
    expect(result[0]).toMatchObject({ id: 'R01', isCompleted: false, explanation: null })
  })
})
