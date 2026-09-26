import { expect, test, type Page, type TestInfo } from '@playwright/test'

// T27 V5 visual-state checks. Assertions use stable DOM geometry and states;
// screenshots are attached only as local review evidence (no pixel equality).

async function attachShot(page: Page, testInfo: TestInfo, name: string) {
  await testInfo.attach(name, { body: await page.screenshot(), contentType: 'image/png' })
}

async function trackErrors(page: Page) {
  const pageErrors: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  return pageErrors
}

async function startCase(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Bắt đầu lượt điều tra' }).click()
  await expect(page.getByText('Phiên bản tiến độ: 0')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(1)
}

async function layout(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas')!.getBoundingClientRect()
    return {
      canvasWidth: Math.round(canvas.width), canvasHeight: Math.round(canvas.height),
      viewportHeight: innerHeight,
      verticalOverflow: document.documentElement.scrollHeight - innerHeight,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
}

test('game-first shell fits desktop viewports with every texture ready', async ({ page }, testInfo) => {
  const pageErrors = await trackErrors(page)
  const assetResponses: { url: string; status: number; type: string }[] = []
  page.on('response', response => {
    if (response.url().includes('/assets/')) assetResponses.push({
      url: new URL(response.url()).pathname, status: response.status(),
      type: response.headers()['content-type'] ?? '',
    })
  })
  await startCase(page)
  await expect.poll(() => assetResponses.length).toBeGreaterThanOrEqual(22)
  expect(assetResponses.filter(item => item.status !== 200 || !item.type.includes('svg'))).toEqual([])
  expect(assetResponses).toContainEqual(expect.objectContaining({
    url: '/assets/office/window-light.svg', status: 200,
  }))
  await expect(page.getByText('Một số hình ảnh văn phòng không tải được')).toHaveCount(0)
  const portraits = await page.evaluate(async () => Promise.all(['player', 'maya', 'leo', 'nora'].map(id =>
    new Promise<{ id: string; width: number; height: number }>((resolve, reject) => {
      const portrait = new Image()
      portrait.onload = () => resolve({ id, width: portrait.naturalWidth, height: portrait.naturalHeight })
      portrait.onerror = () => reject(new Error(`Portrait did not decode: ${id}`))
      portrait.src = `/assets/characters/${id}-portrait.svg`
    }))))
  expect(portraits).toEqual(['player', 'maya', 'leo', 'nora'].map(id => ({ id, width: 160, height: 160 })))

  for (const size of [{ width: 1280, height: 800 }, { width: 1100, height: 720 }]) {
    await page.setViewportSize(size)
    await expect.poll(async () => (await layout(page)).canvasHeight / size.height).toBeGreaterThan(0.7)
    const measured = await layout(page)
    expect(measured.verticalOverflow, JSON.stringify(measured)).toBeLessThanOrEqual(0)
    expect(measured.horizontalOverflow).toBe(0)
    await attachShot(page, testInfo, `shell-${size.width}x${size.height}.png`)
  }

  await page.setViewportSize({ width: 1280, height: 800 })
  await page.locator('canvas').evaluate(canvas => { canvas.style.filter = 'grayscale(1)' })
  await attachShot(page, testInfo, 'shell-grayscale-1280x800.png')
  await page.locator('canvas').evaluate(canvas => { canvas.style.filter = '' })
  const before = (await layout(page)).canvasWidth
  await page.getByRole('button', { name: /Thu gọn/ }).click()
  await expect(page.getByRole('button', { name: /Nhiệm vụ/ })).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByLabel('Thông tin hiện trường')).toContainText('Thu thập hồ sơ')
  await expect.poll(async () => (await layout(page)).canvasWidth).toBeGreaterThan(before + 150)
  await page.getByRole('button', { name: /Nhiệm vụ/ }).click()
  await expect(page.getByText('Mốc đã lưu: Sảnh văn phòng')).toBeVisible()

  const transfer = await page.evaluate(() => (performance.getEntriesByType('resource') as PerformanceResourceTiming[])
    .filter(entry => entry.name.includes('/assets/'))
    .reduce((sum, entry) => sum + (entry.transferSize || entry.encodedBodySize), 0))
  console.log(`T27 asset transfer bytes: ${transfer}`)
  expect(pageErrors).toEqual([])
})

test('an HTML fallback for a texture shows placeholders and a recoverable notice', async ({ page }, testInfo) => {
  const pageErrors = await trackErrors(page)
  for (const path of ['**/assets/office/desk.svg', '**/assets/office/window-light.svg',
    '**/assets/characters/player-sheet.svg']) {
    await page.route(path, route => route.fulfill({
      status: 200, contentType: 'text/html', body: '<!doctype html><html><body>fallback</body></html>',
    }))
  }
  await startCase(page)
  await expect(page.getByText('Một số hình ảnh văn phòng không tải được')).toBeVisible()
  await page.locator('.game-canvas').focus()
  await page.keyboard.down('d')
  try {
    await expect.poll(() => page.evaluate(() => window.__officeCaseFilesE2E?.snapshot().position.x ?? 0))
      .toBeGreaterThan(260)
  } finally { await page.keyboard.up('d') }
  await attachShot(page, testInfo, 'missing-texture-fallback.png')
  expect(pageErrors).toEqual([])
})

test('the office keeps daylight static and disables mote motion under reduced motion', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await startCase(page)
  const atmosphere = await page.evaluate(() => window.__officeCaseFilesE2E?.snapshot())
  expect(atmosphere?.ambientMoteCount).toBe(8)
  expect(atmosphere?.ambientMoteMotionEnabled).toBe(false)
  expect(await page.locator('canvas').count()).toBe(1)
  await attachShot(page, testInfo, 'office-daylight-reduced-motion.png')
})

test('offline API and reduced motion keep readable, non-color-only states', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('**/api/v1/**', route => route.abort('connectionrefused'))
  await page.goto('/')
  const alerts = page.getByRole('alert')
  await expect(alerts.filter({ hasText: 'Backend chưa phản hồi' })).toBeVisible()
  await expect(page.locator('.status-badge[data-tone="offline"]').first()).toContainText('⚠')
  expect(await page.evaluate(() => getComputedStyle(document.documentElement)
    .getPropertyValue('--motion-base').trim())).toBe('0ms')
  await expect(page.locator('canvas')).toHaveCount(1)
  await attachShot(page, testInfo, 'offline-reduced-motion.png')

  await page.setViewportSize({ width: 390, height: 800 })
  await expect(page.getByText('Gameplay cần bàn phím desktop.')).toBeVisible()
  expect((await layout(page)).horizontalOverflow).toBe(0)
  await attachShot(page, testInfo, 'content-shell-390.png')
})
