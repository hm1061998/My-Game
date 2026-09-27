import { expect, test, type Page, type TestInfo } from '@playwright/test'

const snapshot = (page: Page) => page.evaluate(() => window.__officeCaseFilesE2E?.snapshot() ?? null)

async function resumeIfNeeded(page: Page) {
  const state = await snapshot(page)
  if (state?.paused && !state.overlayPaused) {
    await page.locator('.game-canvas').focus()
    await page.keyboard.press('Escape')
    await expect.poll(async () => (await snapshot(page))?.paused).toBe(false)
  }
}

async function moveAxis(page: Page, axis: 'x' | 'y', target: number, tolerance = 24) {
  let last: number | null = null
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
    if (previousSign && sign !== previousSign) gain = Math.max(0.1, gain / 2)
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
    if (stuck >= 3) throw new Error(`Movement blocked on ${axis}: ${current} -> ${after.position[axis]}, target ${target}`)
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

async function attachSceneActingView(page: Page, testInfo: TestInfo, name: string) {
  const backdrop = page.locator('.investigation-backdrop')
  const dialog = page.locator('.investigation-dialog')
  const original = await backdrop.evaluate(element => ({
    background: (element as HTMLElement).style.background,
    filter: (element as HTMLElement).style.backdropFilter,
    dialogVisibility: (document.querySelector('.investigation-dialog') as HTMLElement).style.visibility,
  }))
  await backdrop.evaluate(element => {
    const style = (element as HTMLElement).style
    style.background = 'transparent'
    style.backdropFilter = 'none'
  })
  await dialog.evaluate(element => { (element as HTMLElement).style.visibility = 'hidden' })
  await page.waitForTimeout(120)
  await testInfo.attach(name, { body: await page.screenshot(), contentType: 'image/png' })
  await backdrop.evaluate((element, saved) => {
    const style = (element as HTMLElement).style
    style.background = saved.background
    style.backdropFilter = saved.filter
  }, original)
  await dialog.evaluate((element, saved) => { (element as HTMLElement).style.visibility = saved.dialogVisibility }, original)
}

test('M1 v2 teaches through the evidence, dodge and Nora reveal without quiz gates', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => localStorage.setItem('office-case-files.audio.v1',
    JSON.stringify({ muted: true, ambience: false, effects: false })))
  const pageErrors: string[] = []
  const failedRequests: string[] = []
  const unexpectedResponses: string[] = []
  page.on('pageerror', error => pageErrors.push(error.message))
  page.on('requestfailed', request => failedRequests.push(`${request.method()} ${request.url()}`))
  page.on('response', response => {
    if (response.status() >= 500 || (response.status() >= 400 &&
        !(response.status() === 401 && new URL(response.url()).pathname === '/api/v1/session')))
      unexpectedResponses.push(`${response.status()} ${response.request().method()} ${response.url()}`)
  })

  await page.goto('/')
  await page.locator('details.audio-settings > summary').click()
  await expect(page.getByRole('button', { name: 'Bật âm thanh' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Bắt đầu lượt điều tra' })).toBeVisible()
  await page.getByRole('button', { name: 'Bắt đầu lượt điều tra' }).click()
  await expect(page.locator('canvas')).toHaveCount(1)
  await expect.poll(async () => (await snapshot(page))?.position).toEqual({ x: 260, y: 645 })
  await expect.poll(async () => (await snapshot(page))?.ambientMoteMotionEnabled).toBe(false)

  await moveTo(page, 260, 535, 'yx')
  await moveTo(page, 455, 535)
  await expectNearby(page, 'desk-email')
  await page.keyboard.press('e')
  const notebook = page.getByRole('dialog', { name: 'Sổ tay điều tra' })
  await expect(notebook).toBeVisible()
  await expect(notebook.getByRole('heading', { name: "E01 · Maya's email" })).toBeVisible()
  const englishClue = notebook.locator('p[lang="en"]')
  await expect(englishClue).toBeVisible()
  await expect(notebook.locator('p[lang="vi"]')).toHaveCount(0)
  const translation = notebook.getByRole('button', { name: 'Hiện bản dịch' }).first()
  const revisionBeforeTranslation = await page.getByText(/Phiên bản tiến độ:/).innerText()
  await translation.click()
  await expect(notebook.locator('p[lang="vi"]').first()).toBeVisible()
  await notebook.getByRole('button', { name: 'Ẩn bản dịch' }).first().click()
  await expect(notebook.locator('p[lang="vi"]')).toHaveCount(0)
  await expect(page.getByText(/Phiên bản tiến độ:/)).toHaveText(revisionBeforeTranslation)

  await notebook.getByRole('button', { name: /^Q01 ·/ }).click()
  await notebook.getByRole('radio', { name: 'The approved version three' }).check()
  await notebook.getByRole('button', { name: 'Trả lời', exact: true }).click()
  await expect(notebook.locator('.answer-feedback')).toContainText('Chính xác!')
  await closeOverlay(page)

  await moveTo(page, 455, 250, 'yx')
  await moveTo(page, 320, 250)
  await expectNearby(page, 'npc-maya')
  await page.keyboard.press('e')
  const dialogue = page.getByRole('dialog', { name: 'Hội thoại' })
  await expect(dialogue).toContainText('Maya')
  await expect.poll(async () => (await snapshot(page))?.npcAnimations.maya).toBe('maya-down-talk')
  await testInfo.attach('m1-maya-dialogue.png', { body: await page.screenshot(), contentType: 'image/png' })
  await attachSceneActingView(page, testInfo, 'm1-maya-acting.png')
  await closeOverlay(page)

  await moveTo(page, 320, 535, 'yx')
  await moveTo(page, 785, 570)
  await expectNearby(page, 'chat-device')
  await page.keyboard.press('e')
  await expect(notebook).toBeVisible()
  await expect(notebook.getByRole('heading', { name: 'E02 · Team chat' })).toBeVisible()
  const progressBeforeNote = await page.getByText(/Phiên bản tiến độ:/).innerText()
  await notebook.getByRole('button', { name: 'Ghi lại suy luận' }).click()
  await notebook.getByLabel('Điều đã biết').fill('The revised file was sent before the meeting.')
  await notebook.getByLabel('Điều còn chưa rõ').fill('Who changed the version?')
  await notebook.getByRole('button', { name: 'Bỏ qua, tiếp tục' }).click()
  await expect(notebook.getByRole('button', { name: 'Sửa ghi chú' })).toBeVisible()
  await notebook.getByRole('button', { name: 'Sửa ghi chú' }).click()
  await expect(notebook.getByLabel('Điều đã biết')).toHaveValue('The revised file was sent before the meeting.')
  await expect(notebook.getByLabel('Điều còn chưa rõ')).toHaveValue('Who changed the version?')
  await expect(page.getByText(/Phiên bản tiến độ:/)).toHaveText(progressBeforeNote)
  await notebook.getByRole('button', { name: 'Bỏ qua, tiếp tục' }).click()
  await closeOverlay(page)

  await moveTo(page, 1090, 570, 'xy')
  await moveTo(page, 1090, 775, 'yx')
  await expect(page.getByText('Mốc đã lưu: Khu họp')).toBeVisible()
  await expect(page.getByText('The scanner sweeps from left to right. Wait for the light to pass, then dodge through the gap.')).toBeVisible()
  await expect(page.getByRole('group', { name: 'Nghe nội dung tiếng Anh' })).toBeVisible()
  await moveTo(page, 1160, 770)
  await expectNearby(page, 'meeting-minutes')
  await page.keyboard.press('e')
  await expect(notebook).toBeVisible()
  await closeOverlay(page)

  await moveTo(page, 1090, 585, 'xy', 8)
  const retry = page.getByRole('dialog', { name: 'Kết quả máy quét' })
  await page.keyboard.down('d')
  await expect(retry).toBeVisible({ timeout: 15_000 }).finally(() => page.keyboard.up('d'))
  await retry.getByRole('button', { name: 'Thử lại' }).click()
  await moveTo(page, 1090, 500, 'yx', 8)
  const dodgesBefore = (await snapshot(page))?.dodgeCount ?? 0
  const startX = (await snapshot(page))?.position.x ?? 0
  await page.keyboard.down('d')
  await page.waitForTimeout(100)
  await page.keyboard.up('d')
  await expect.poll(async () => (await snapshot(page))?.position.x ?? 0).toBeGreaterThan(startX)
  await page.keyboard.press('Space')
  await expect.poll(async () => (await snapshot(page))?.dodgeCount ?? 0).toBeGreaterThan(dodgesBefore)
  await moveTo(page, 1400, 500, 'xy', 8)
  await expectNearby(page, 'archive-terminal')
  await page.keyboard.press('e')
  await expect(page.getByText('Máy quét: Đã vượt')).toBeVisible()
  await expect.poll(async () => (await snapshot(page))?.encounterCleared).toBe(true)
  await page.keyboard.press('e')
  await expect(notebook).toBeVisible()
  await expect(notebook.getByRole('heading', { name: 'E03 · File version history' })).toBeVisible()
  await notebook.getByRole('button', { name: 'Sửa ghi chú' }).click()
  await expect(notebook.getByLabel('Điều đã biết')).toHaveValue('The revised file was sent before the meeting.')
  await notebook.getByRole('button', { name: 'Bỏ qua, tiếp tục' }).click()
  await closeOverlay(page)

  await moveTo(page, 1460, 495, 'xy', 8)
  await moveTo(page, 1460, 760, 'xy')
  await expectNearby(page, 'npc-nora')
  await page.keyboard.press('e')
  await expect(dialogue).toContainText('Nora')
  await expect(dialogue.getByText(/Lời khai chi tiết sẽ mở/)).toHaveCount(0)
  await expect(dialogue.getByRole('button', { name: 'Hiện bản dịch' }).first()).toBeVisible()
  await expect.poll(async () => (await snapshot(page))?.npcAnimations.nora).toBe('nora-down-react')
  await expect(dialogue.locator('.clue-stamp')).toContainText('E06')
  await testInfo.attach('m1-nora-reveal.png', { body: await page.screenshot(), contentType: 'image/png' })
  await attachSceneActingView(page, testInfo, 'm1-nora-acting.png')
  await closeOverlay(page)
  await page.getByRole('button', { name: 'Mở sổ tay điều tra' }).click()
  await expect(page.getByRole('dialog', { name: 'Sổ tay điều tra' }).getByRole('button', { name: /^E06 ·/ })).toBeVisible()

  expect(pageErrors).toEqual([])
  expect(failedRequests).toEqual([])
  expect(unexpectedResponses).toEqual([])
})
