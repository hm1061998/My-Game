/// <reference types="node" />
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { artUrl, DECOR, footOrigin, isSvgDocument, OFFICE_ART, ZONES } from './officeArt'

const root = process.cwd()
const caseFile = resolve(root, '../../services/api/Content/Cases/swapped-report.v1.json')

describe('office art manifest', () => {
  it('has a local SVG file with matching size for every texture key', () => {
    for (const asset of OFFICE_ART) {
      const file = resolve(root, 'public', artUrl(asset.key).slice(1))
      expect(existsSync(file), asset.key).toBe(true)
      const text = readFileSync(file, 'utf8')
      expect(text).toContain(`width="${asset.width}" height="${asset.height}"`)
      expect(text).not.toMatch(/https?:\/\/(?!www\.w3\.org)/)
    }
  })

  it('tiles the walkable floor with zones that neither overlap nor leave gaps', () => {
    const area = ZONES.reduce((sum, zone) => sum + zone.width * zone.height, 0)
    expect(area).toBe(1472 * 796)
    for (const zone of ZONES) {
      expect(zone.x).toBeGreaterThanOrEqual(64)
      expect(zone.x + zone.width).toBeLessThanOrEqual(1536)
      expect(zone.y + zone.height).toBeLessThanOrEqual(938)
    }
  })

  it('anchors furniture on its foot row', () => {
    expect(footOrigin('desk')).toEqual({ x: 0.5, y: 160 / 176 })
    expect(footOrigin('papers').y).toBe(1)
  })

  it('keeps decor outside every interaction radius', () => {
    const { interactions } = JSON.parse(readFileSync(caseFile, 'utf8')) as {
      interactions: { id: string; x: number; y: number; radius: number }[] }
    for (const item of DECOR) {
      for (const target of interactions) {
        expect(Math.hypot(item.x - target.x, item.y - target.y), `${item.key}@${item.x},${item.y} vs ${target.id}`)
          .toBeGreaterThan(target.radius)
      }
    }
  })

  it('rejects an HTML fallback or broken SVG so the scene can use its placeholder', () => {
    expect(isSvgDocument('<!doctype html><html><body></body></html>')).toBe(false)
    expect(isSvgDocument('<svg xmlns="http://www.w3.org/2000/svg"><rect a="1" a="2"/></svg>')).toBe(false)
    expect(isSvgDocument(readFileSync(resolve(root, 'public/assets/office/desk.svg'), 'utf8'))).toBe(true)
  })
})
