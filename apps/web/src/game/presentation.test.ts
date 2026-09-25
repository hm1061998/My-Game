import { describe, expect, it } from 'vitest'
import { characterStyle, currentObjective, evidenceStyle, interactionLabel, movementPose } from './presentation'

describe('presentation helpers', () => {
  it('keeps character and evidence variants distinct', () => {
    expect(characterStyle('maya').jacket).not.toBe(characterStyle('nora').jacket)
    expect(characterStyle('leo').badge).toBe('L')
    expect(evidenceStyle('desk-email').symbol).not.toBe(evidenceStyle('chat-device').symbol)
    expect(interactionLabel('npc-nora', 'fallback')).toBe('NPC · NORA')
  })

  it('derives movement pose without changing gameplay coordinates', () => {
    expect(movementPose({ x: -1, y: 0 }, 100, false, 1).facing).toBe(-1)
    expect(movementPose({ x: 0, y: 0 }, 100, false, -1)).toEqual({
      facing: -1, bob: 0, stride: 0, tilt: 0, shadowScale: 1,
    })
    expect(movementPose({ x: 1, y: 0 }, 100, true, 1).shadowScale).toBeGreaterThan(1)
  })

  it('describes stable session milestones for the DOM HUD', () => {
    expect(currentObjective(null)).toContain('Bắt đầu')
    expect(currentObjective({ status: 'Investigating', checkpointId: 'meeting-zone', encounterCleared: false }))
      .toContain('máy quét')
    expect(currentObjective({ status: 'Completed', checkpointId: 'meeting-zone', encounterCleared: true }))
      .toContain('hoàn tất')
  })
})
