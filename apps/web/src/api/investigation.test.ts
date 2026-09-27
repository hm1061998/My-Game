import { afterEach, describe, expect, it, vi } from 'vitest'
import { getEvidence, interact } from './investigation'

const response = (value: unknown) => new Response(JSON.stringify(value), {
  status: 200, headers: { 'Content-Type': 'application/json' },
})

afterEach(() => vi.unstubAllGlobals())

describe('optional case translations', () => {
  it('accepts v1 evidence with an absent translation and v2 evidence with Vietnamese text', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ id: 'E01', kind: 'email', title: 'Email', body: 'Use version three.', glossary: [] }))
      .mockResolvedValueOnce(response({ id: 'E01', kind: 'email', title: 'Email', body: 'Use version three.',
        bodyVi: 'Dùng phiên bản ba.', glossary: [] }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getEvidence('E01')).resolves.toMatchObject({ bodyVi: null })
    await expect(getEvidence('E01')).resolves.toMatchObject({ bodyVi: 'Dùng phiên bản ba.' })
  })

  it('accepts a null v1 dialogue translation and rejects a misaligned v2 array', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ interactionId: 'npc-maya', kind: 'npc', revision: 1,
        title: 'Maya', dialogue: ['One', 'Two'], dialogueVi: null,
        collectedEvidenceId: null, statementLocked: false }))
      .mockResolvedValueOnce(response({ interactionId: 'npc-maya', kind: 'npc', revision: 1,
        title: 'Maya', dialogue: ['One', 'Two'], dialogueVi: ['Một câu'],
        collectedEvidenceId: null, statementLocked: false }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(interact('npc-maya', 'submission', 0)).resolves.toMatchObject({ dialogueVi: null })
    await expect(interact('npc-maya', 'submission', 0)).rejects.toThrow('Invalid interaction response')
  })

  it('rejects non-string Vietnamese evidence text', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ id: 'E01', kind: 'email', title: 'Email',
      body: 'Use version three.', bodyVi: 7, glossary: [] })))

    await expect(getEvidence('E01')).rejects.toThrow('Invalid investigation response')
  })
})
