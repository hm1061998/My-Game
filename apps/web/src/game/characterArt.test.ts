/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ANIM_STATES, CHARACTER_IDS, characterAnim, FRAME, portraitFor, portraitUrl, SHEET, sheetFrames, sheetUrl } from './characterArt'
import { isSvgDocument } from './officeArt'

const root = process.cwd()

describe('character art', () => {
  it('ships a valid local sheet and portrait for every character', () => {
    const parser = new DOMParser()
    for (const id of CHARACTER_IDS) {
      const sheet = readFileSync(resolve(root, 'public', sheetUrl(id).slice(1)), 'utf8')
      expect(isSvgDocument(sheet), id).toBe(true)
      expect(sheet).toContain(`width="${SHEET.width}" height="${SHEET.height}"`)
      const portrait = readFileSync(resolve(root, 'public', portraitUrl(id).slice(1)), 'utf8')
      expect(isSvgDocument(portrait), id).toBe(true)
      expect(portrait).toContain('width="160" height="160"')
      for (const asset of [sheet, portrait]) {
        const document = parser.parseFromString(asset, 'image/svg+xml')
        expect(document.querySelector('parsererror'), id).toBeNull()
        expect(document.querySelectorAll('image, foreignObject')).toHaveLength(0)
        expect(asset).not.toMatch(/(?:href|src)="https?:\/\//)
      }
      const sheetDocument = parser.parseFromString(sheet, 'image/svg+xml')
      expect(Array.from(sheetDocument.documentElement.children).filter(node => node.tagName === 'g')).toHaveLength(90)
    }
  })

  it('slices 3 directions x 30 frames inside the sheet with stable foot anchors', () => {
    const frames = sheetFrames()
    expect(frames).toHaveLength(90)
    expect(new Set(frames.map(frame => frame.name)).size).toBe(90)
    for (const frame of frames) {
      expect(frame.x + FRAME.width).toBeLessThanOrEqual(SHEET.width)
      expect(frame.y + FRAME.height).toBeLessThanOrEqual(SHEET.height)
      expect(frame.y % FRAME.height + FRAME.footY).toBe(112)
    }
    expect(SHEET).toEqual({ width: 2400, height: 360 })
    expect(ANIM_STATES).toEqual([
      { state: 'idle', start: 0, count: 4, fps: 4 },
      { state: 'walk', start: 4, count: 6, fps: 10 },
      { state: 'run', start: 10, count: 6, fps: 14 },
      { state: 'talk', start: 16, count: 4, fps: 6 },
      { state: 'react', start: 20, count: 4, fps: 8 },
      { state: 'dodge', start: 24, count: 6, fps: 14 },
    ])
  })

  it('chooses four-direction idle/walk/run/dodge poses from input only', () => {
    expect(characterAnim({ x: 0, y: 0 }, false, false, 'up')).toEqual({ facing: 'up', row: 'up', flipX: false, state: 'idle' })
    expect(characterAnim({ x: -1, y: 1 }, false, false, 'down')).toMatchObject({ facing: 'left', row: 'side', flipX: true, state: 'walk' })
    expect(characterAnim({ x: 0, y: 1 }, true, false, 'up')).toMatchObject({ facing: 'down', state: 'run' })
    expect(characterAnim({ x: 0, y: 0 }, false, true, 'right').state).toBe('dodge')
  })

  it('prioritizes a dialogue emote and distinguishes dodge from running', () => {
    expect(characterAnim({ x: 1, y: 0 }, true, true, 'down', 'talk'))
      .toMatchObject({ state: 'talk', row: 'side', flipX: false })
    expect(characterAnim({ x: 0, y: 0 }, false, false, 'up', 'react').state).toBe('react')
    expect(characterAnim({ x: 0, y: 0 }, false, true, 'up').state).toBe('dodge')
  })

  it('maps only NPC interactions to portraits', () => {
    expect(portraitFor('npc-nora')).toBe('nora')
    expect(portraitFor('desk-email')).toBeNull()
    expect(portraitFor('npc-unknown')).toBeNull()
  })
})
