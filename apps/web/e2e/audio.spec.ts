import { expect, test } from '@playwright/test'

declare global {
  interface Window {
    __officeAmbienceStats?: { duration: number; channels: number; rms: number; peak: number; loopEdgeDelta: number }
  }
}

test('office ambience is gesture-gated and fetched from the local Vite asset only', async ({ page }) => {
  await page.addInitScript(() => {
    const decode = window.AudioContext.prototype.decodeAudioData
    window.AudioContext.prototype.decodeAudioData = function (data, ...callbacks) {
      return decode.call(this, data, ...callbacks).then(buffer => {
        const first = buffer.getChannelData(0)
        let energy = 0
        let edgeDelta = 0
        let peak = 0
        for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
          const samples = buffer.getChannelData(channel)
          for (const sample of samples) {
            energy += sample * sample
            peak = Math.max(peak, Math.abs(sample))
          }
          edgeDelta = Math.max(edgeDelta, Math.abs(samples[1] - samples[0]),
            Math.abs(samples[samples.length - 1] - samples[samples.length - 2]))
        }
        window.__officeAmbienceStats = {
          duration: buffer.duration,
          channels: buffer.numberOfChannels,
          rms: Math.sqrt(energy / (first.length * buffer.numberOfChannels)),
          peak,
          loopEdgeDelta: edgeDelta,
        }
        return buffer
      })
    }
  })
  const audioRequests: string[] = []
  page.on('request', request => {
    if (/\.(mp3|wav|ogg)(?:\?|$)/i.test(request.url()) &&
      ['fetch', 'media'].includes(request.resourceType())) audioRequests.push(request.url())
  })

  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Bắt đầu lượt điều tra' })).toBeVisible()
  await page.locator('details.audio-settings > summary').click()
  await expect(page.getByRole('button', { name: 'Kích hoạt âm thanh' })).toBeVisible()
  expect(audioRequests).toEqual([])

  const audioRequest = page.waitForRequest(request =>
    /office-quiet-traffic.*\.mp3(?:\?|$)/i.test(request.url()) &&
    ['fetch', 'media'].includes(request.resourceType()))
  await page.getByRole('button', { name: 'Kích hoạt âm thanh' }).click()
  const request = await audioRequest
  expect(new URL(request.url()).origin).toBe(new URL(page.url()).origin)
  expect((await request.response())?.status()).toBe(200)
  await expect(page.getByRole('button', { name: 'Âm thanh đã sẵn sàng' })).toBeVisible()
  await expect.poll(() => page.evaluate(() => window.__officeAmbienceStats?.duration ?? 0)).toBeGreaterThan(119)
  const stats = await page.evaluate(() => window.__officeAmbienceStats)
  expect(stats?.duration).toBeLessThan(121)
  expect(stats?.rms).toBeGreaterThan(0.0001)
  console.log(`T29 decoded MP3: ${JSON.stringify(stats)}`)

  await page.getByRole('button', { name: 'Tắt tất cả âm thanh' }).click()
  await expect(page.getByRole('button', { name: 'Bật âm thanh' })).toBeVisible()
  await page.getByRole('button', { name: 'Bật âm thanh' }).click()
  await expect(page.getByRole('button', { name: 'Âm thanh đã sẵn sàng' })).toBeVisible()
  expect(audioRequests).toHaveLength(1)
})
