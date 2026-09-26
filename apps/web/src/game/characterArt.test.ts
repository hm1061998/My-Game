/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CHARACTER_IDS, characterAnim, FRAME, portraitFor, portraitUrl, SHEET, sheetFrames, sheetUrl } from './characterArt'
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
      expect(Array.from(sheetDocument.documentElement.children).filter(node => node.tagName === 'g')).toHaveLength(48)
    }
  })

  it('slices 3 directions x 16 frames inside the sheet', () => {
    const frames = sheetFrames()
    expect(frames).toHaveLength(48)
    expect(new Set(frames.map(frame => frame.name)).size).toBe(48)
    for (const frame of frames) {
      expect(frame.x + FRAME.width).toBeLessThanOrEqual(SHEET.width)
      expect(frame.y + FRAME.height).toBeLessThanOrEqual(SHEET.height)
    }
  })

  it('chooses four-direction idle/walk/run poses from input only', () => {
    expect(characterAnim({ x: 0, y: 0 }, false, false, 'up')).toEqual({ facing: 'up', row: 'up', flipX: false, state: 'idle' })
    expect(characterAnim({ x: -1, y: 1 }, false, false, 'down')).toMatchObject({ facing: 'left', row: 'side', flipX: true, state: 'walk' })
    expect(characterAnim({ x: 0, y: 1 }, true, false, 'up')).toMatchObject({ facing: 'down', state: 'run' })
    expect(characterAnim({ x: 0, y: 0 }, false, true, 'right').state).toBe('run')
  })

  it('maps only NPC interactions to portraits', () => {
    expect(portraitFor('npc-nora')).toBe('nora')
    expect(portraitFor('desk-email')).toBeNull()
    expect(portraitFor('npc-unknown')).toBeNull()
  })
})
