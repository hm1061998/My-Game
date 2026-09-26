import { expect, test, type Page, type TestInfo } from '@playwright/test'

type SceneSnapshot = {
  position: { x: number; y: number }
  paused: boolean
  overlayPaused: boolean
  nearestId: string | null
  checkpointId: string
  encounterCleared: boolean
  dodgeRemainingMs: number
  dodgeCount: number
}

declare global {
  interface Window {
    __officeCaseFilesE2E?: { snapshot: () => SceneSnapshot }
  }
}

const snapshot = async (page: Page) => page.evaluate(() => window.__officeCaseFilesE2E?.snapshot() ?? null)

async function resumeIfNeeded(page: Page) {
  const state = await snapshot(page)
  if (state?.paused && !state.overlayPaused) {
    await page.locator('.game-canvas').focus()
    await page.keyboard.press('Escape')
    await expect.poll(async () => (await snapshot(page))?.paused).toBe(false)
  }
}

async function moveAxis(page: Page, axis: 'x' | 'y', target: number, tolerance = 24) {
  // Slow CI renderers move less per key press (movement caps each frame at 50 ms), so the
  // budget is generous; a real obstruction still fails fast through the blocked check below.
  let last: number | null = null
  // Key-up can land a few frames late on slow renderers; halve the hold time after each
  // overshoot (direction flip) so the approach converges instead of oscillating.
  let gain = 1
  let previousSign = 0
  let stuck = 0
  for (let step = 0; step < 120; step += 1) {
    await resumeIfNeeded(page)
    const before = await snapshot(page)
    if (!before) throw new Error('E2E scene observability is unavailable')
    const current = before.position[axis]
    last = current
    const difference = target - current
    if (Math.abs(difference) <= tolerance) return
    if (before.overlayPaused) throw new Error(`Cannot move while overlay is open at ${current}`)
    const key = axis === 'x' ? (difference > 0 ? 'd' : 'a') : (difference > 0 ? 's' : 'w')
    const sign = Math.sign(difference)
    if (previousSign !== 0 && sign !== previousSign) gain = Math.max(0.1, gain / 2)
    previousSign = sign
    const duration = Math.max(50, Math.min(420, Math.abs(difference) / 210 * 1000 * gain))
    await page.locator('.game-canvas').focus()
    await page.keyboard.down(key)
    await page.waitForTimeout(duration)
    await page.keyboard.up(key)
    await page.waitForTimeout(45)
    const after = await snapshot(page)
    if (!after) throw new Error('E2E scene disappeared while moving')
    stuck = Math.abs(after.position[axis] - current) < 1 ? stuck + 1 : 0
    if (stuck >= 3) {
      throw new Error(`Movement blocked on ${axis}: ${current} -> ${after.position[axis]}, target ${target}`)
    }
  }
  throw new Error(`Movement did not reach ${axis}=${target} (last ${axis}=${last})`)
}

async function moveTo(page: Page, x: number, y: number, order: 'xy' | 'yx' = 'xy', tolerance = 24) {
  for (const axis of order as Iterable<'x' | 'y'>) await moveAxis(page, axis, axis === 'x' ? x : y, tolerance)
}

async function expectNearby(page: Page, interactionId: string) {
  await expect.poll(async () => (await snapshot(page))?.nearestId).toBe(interactionId)
}

async function closeOverlay(page: Page) {
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.locator('.game-canvas')).toBeFocused()
}

async function chooseQuestion(page: Page, id: string, choice: string) {
  const dialog = page.getByRole('dialog', { name: 'Sổ tay điều tra' })
  await dialog.getByRole('button', { name: new RegExp(`^${id} ·`) }).click()
  await dialog.getByRole('radio', { name: choice }).check()
  await dialog.getByRole('button', { name: 'Trả lời', exact: true }).click()
}

async function samplePerformance(page: Page, testInfo: TestInfo) {
  const metrics = await page.evaluate(async () => {
    const started = performance.now()
    const frames: number[] = []
    let previous = started
    await new Promise<void>(resolve => {
      const tick = (now: number) => {
        frames.push(now - previous)
        previous = now
        if (now - started >= 1600) resolve()
        else requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    const sorted = [...frames].sort((a, b) => a - b)
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    return {
      sampledMs: Math.round(performance.now() - started),
      frames: frames.length,
      approximateFps: Math.round(frames.length / ((performance.now() - started) / 1000)),
      p95FrameMs: Math.round(sorted[Math.floor(sorted.length * 0.95)] ?? 0),
      longestFrameMs: Math.round(Math.max(...frames)),
      apiDurationsMs: resources.flatMap(entry => {
        const path = new URL(entry.name).pathname
        return path.startsWith('/api/v1/') ? [{ path, duration: Math.round(entry.duration) }] : []
      }),
    }
  })
  await testInfo.attach('performance-sample.json', {
    body: Buffer.from(JSON.stringify(metrics, null, 2)), contentType: 'application/json',
  })
  console.log(`T10 performance sample: ${JSON.stringify(metrics)}`)
  expect(metrics.frames).toBeGreaterThan(20)
  expect(metrics.longestFrameMs).toBeLessThan(1000)
}

test('complete case survives retry, reload and replay', async ({ page }, testInfo) => {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  const failedRequests: string[] = []
  const unexpectedResponses: string[] = []
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  page.on('pageerror', error => pageErrors.push(error.message))
  page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()}`))
  page.on('response', response => {
    if (response.status() >= 500 || (response.status() >= 400 &&
        !(response.status() === 401 && new URL(response.url()).pathname === '/api/v1/session'))) {
      unexpectedResponses.push(`${response.status()} ${response.request().method()} ${response.url()}`)
    }
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'The Swapped Report' })).toBeVisible()
  await expect(page.getByText('Đã kết nối')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Bắt đầu lượt điều tra' })).toBeVisible()
  expect(await page.evaluate(() => document.cookie)).toBe('')

  await page.getByRole('button', { name: 'Bắt đầu lượt điều tra' }).click()
  await expect(page.getByText('Phiên bản tiến độ: 0')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(1)
  await expect.poll(async () => (await snapshot(page))?.position).toEqual({ x: 260, y: 645 })
  await samplePerformance(page, testInfo)

  await moveTo(page, 260, 535, 'yx')
  await moveTo(page, 455, 535)
  await expectNearby(page, 'desk-email')
  await page.keyboard.press('e')
  await expect(page.getByRole('dialog', { name: 'Sổ tay điều tra' })).toBeVisible()

  const firstAnswerRequest = page.waitForRequest(request =>
    request.method() === 'POST' && request.url().endsWith('/api/v1/session/questions/Q01/answers'))
  await page.getByRole('dialog').getByRole('button', { name: /^Q01 ·/ }).click()
  await page.getByRole('dialog').getByRole('radio', { name: 'The previous version two' }).check()
  await page.getByRole('dialog').getByRole('button', { name: 'Trả lời', exact: true }).click()
  const originalRequest = await firstAnswerRequest
  const originalResponse = await originalRequest.response()
  expect(originalResponse?.status()).toBe(200)
  const firstResult = await originalResponse!.json() as { attempts: number; revision: number }
  expect(firstResult.attempts).toBe(1)
  await expect(page.getByRole('status')).toContainText('Chưa đúng')

  const replayResponse = await page.request.post(originalRequest.url(), {
    headers: { 'Content-Type': 'application/json', 'X-Office-Request': '1' },
    data: originalRequest.postDataJSON(),
  })
  expect(replayResponse.status()).toBe(200)
  const replayResult = await replayResponse.json() as { attempts: number; revision: number }
  expect(replayResult).toEqual(firstResult)

  await chooseQuestion(page, 'Q01', 'The approved version three')
  await expect(page.getByRole('status')).toContainText('Chính xác!')
  await closeOverlay(page)

  await moveTo(page, 455, 250, 'yx')
  await moveTo(page, 320, 250)
  await expectNearby(page, 'npc-maya')
  await page.keyboard.press('e')
  await expect(page.getByRole('dialog', { name: 'Hội thoại' })).toContainText('Maya')
  await closeOverlay(page)

  await moveTo(page, 320, 535, 'yx')
  await moveTo(page, 785, 535)
  await moveTo(page, 785, 570, 'yx')
  await expectNearby(page, 'chat-device')
  await page.keyboard.press('e')
  await expect(page.getByRole('dialog', { name: 'Sổ tay điều tra' })).toBeVisible()
  await chooseQuestion(page, 'Q02', 'Whether she should send the previous version')
  await expect(page.getByRole('status')).toContainText('Chính xác!')
  await closeOverlay(page)

  await moveTo(page, 1090, 570)
  await moveTo(page, 1090, 775, 'yx')
  await expect(page.getByText('Mốc đã lưu: Khu họp')).toBeVisible()
  await expect.poll(async () => (await snapshot(page))?.checkpointId).toBe('meeting-zone')

  await moveTo(page, 1160, 770)
  await expectNearby(page, 'meeting-minutes')
  await page.keyboard.press('e')
  await expect(page.getByRole('dialog', { name: 'Sổ tay điều tra' })).toBeVisible()
  await closeOverlay(page)

  // From the minutes (x≈1160) go left first: going up first can clip the meeting table (x≥1190).
  // Tight tolerance: at y≈609 the player would stop at the table (x≈1190), just outside scanner range.
  await moveTo(page, 1090, 585, 'xy', 8)
  // Walk along the scanner row until detected; a fixed hold time depends on renderer speed.
  const scannerResult = page.getByRole('dialog', { name: 'Kết quả máy quét' })
  await page.keyboard.down('d')
  await expect(scannerResult).toBeVisible({ timeout: 15_000 }).finally(() => page.keyboard.up('d'))
  await expect(scannerResult).toContainText('Bị máy quét phát hiện')
  await expect(page.getByText('Máy quét: 1 lần bị phát hiện')).toBeVisible()
  await page.getByRole('button', { name: 'Thử lại' }).click()
  await expect(page.locator('.game-canvas')).toBeFocused()

  // Stay clear of the cabinet (y<=480, plus the 15 px player radius) and outside scanner range.
  // Aim inside the reachable lane instead of its collision boundary; slow CI frames can stop at
  // y≈503 when moving from the meeting lane, which is already a safe corridor position.
  await moveTo(page, 1090, 500, 'yx', 8)
  // A dodge lasts ~300 ms, which a slow runner's snapshot polling can miss; count dodges instead.
  const dodgesBefore = (await snapshot(page))?.dodgeCount ?? 0
  await page.keyboard.down('Space')
  await page.keyboard.up('Space')
  await expect.poll(async () => (await snapshot(page))?.dodgeCount ?? 0).toBeGreaterThan(dodgesBefore)
  await moveTo(page, 1090, 500, 'yx', 8)
  await moveTo(page, 1400, 500, 'xy', 8)
  await expectNearby(page, 'archive-terminal')
  await page.keyboard.press('e')
  await expect(page.getByText('Máy quét: Đã vượt')).toBeVisible()
  await expect.poll(async () => (await snapshot(page))?.encounterCleared).toBe(true)
  await page.keyboard.press('e')
  await expect(page.getByRole('dialog', { name: 'Sổ tay điều tra' })).toBeVisible()
  await chooseQuestion(page, 'Q03', "Nora's account replaced the file with version two")
  await expect(page.getByRole('status')).toContainText('Chính xác!')
  await closeOverlay(page)

  await moveTo(page, 1460, 495, 'xy', 8)
  await moveTo(page, 1460, 760, 'xy') // right of the meeting table (x≤1415) before going down
  await expectNearby(page, 'npc-nora')
  await page.keyboard.press('e')
  await expect(page.getByRole('dialog', { name: 'Hội thoại' })).toContainText('Nora')
  await closeOverlay(page)

  await page.getByRole('button', { name: 'Kết luận vụ án' }).click()
  const resolution = page.getByRole('dialog', { name: 'Hoàn tất vụ án' })
  await expect(resolution.getByRole('heading', { name: 'Kết luận vụ án' })).toBeVisible()
  await resolution.getByRole('radio', { name: 'Nora' }).check()
  await resolution.getByRole('radio', { name: /Misunderstood/ }).check()
  await resolution.getByRole('checkbox', { name: /E03/ }).check()
  await resolution.getByRole('checkbox', { name: /E06/ }).check()
  await resolution.getByRole('button', { name: 'Kiểm tra kết luận' }).click()
  await resolution.getByRole('button', { name: 'Xác nhận kết luận' }).click()
  await expect(resolution.getByRole('heading', { name: 'Kết quả điều tra' })).toBeVisible()
  await expect(resolution.locator('.score-grid')).toContainText('67')
  await expect(resolution.locator('.score-grid')).toContainText('100')

  await resolution.getByRole('button', { name: 'Làm 5 câu ôn tập' }).click()
  await resolution.getByRole('radio', { name: 'previous' }).check()
  await resolution.getByRole('button', { name: 'Trả lời', exact: true }).click()
  await expect(resolution.getByRole('status')).toContainText('Chưa đúng')
  await resolution.getByRole('radio', { name: 'approved' }).check()
  await resolution.getByRole('button', { name: 'Trả lời', exact: true }).click()
  await expect(resolution.getByRole('status')).toContainText('Chính xác!')

  const reviewAnswers = [
    ['R02', 'happening before'], ['R03', 'replaced'], ['R04', 'instead'], ['R05', 'The version history'],
  ] as const
  for (const [id, answer] of reviewAnswers) {
    await resolution.getByRole('button', { name: new RegExp(`^${id} ·`) }).click()
    await resolution.getByRole('radio', { name: answer }).check()
    await resolution.getByRole('button', { name: 'Trả lời', exact: true }).click()
    await expect(resolution.getByRole('status')).toContainText('Chính xác!')
  }
  await expect(resolution.getByText('Hoàn thành 5/5')).toBeVisible()

  await page.reload()
  await expect(page.locator('canvas')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Xem kết quả vụ án' })).toBeVisible()
  await page.getByRole('button', { name: 'Xem kết quả vụ án' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Ôn tập', exact: true }).click()
  await expect(page.getByRole('dialog').getByText('Hoàn thành 5/5')).toBeVisible()

  await page.setViewportSize({ width: 1100, height: 720 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
  await page.setViewportSize({ width: 390, height: 800 })
  await expect(page.getByText('Gameplay cần bàn phím desktop.')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
  await page.setViewportSize({ width: 1280, height: 800 })

  await page.getByRole('dialog').getByRole('button', { name: 'Kết quả', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Chơi lại vụ án' }).click()
  await expect(page.getByText('Phiên bản tiến độ: 0')).toBeVisible()
  await expect(page.getByText('Mốc đã lưu: Sảnh văn phòng')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(1)
  await expect.poll(async () => (await snapshot(page))?.position).toEqual({ x: 260, y: 645 })

  const expectedInitialUnauthorized = consoleErrors.filter(message =>
    message.includes('status of 401 (Unauthorized)'))
  expect(expectedInitialUnauthorized).toHaveLength(1)
  expect(consoleErrors.filter(message => !message.includes('status of 401 (Unauthorized)'))).toEqual([])
  expect(pageErrors).toEqual([])
  expect(failedRequests).toEqual([])
  expect(unexpectedResponses).toEqual([])
})
