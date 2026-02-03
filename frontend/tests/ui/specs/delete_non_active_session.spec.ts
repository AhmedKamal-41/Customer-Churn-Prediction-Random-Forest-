import { test, expect } from '@playwright/test'
import { SidebarPage } from '../pages/sidebar'
import { ChatPage } from '../pages/chat'

test.describe('Delete flow', () => {
  test('create 3 sessions, activate second, delete first -> first disappears, active unchanged', async ({
    page,
  }) => {
    await page.goto('/chat')
    const sidebar = new SidebarPage(page)
    const chat = new ChatPage(page)

    await sidebar.newSession()
    await chat.sendMessage('30')
    await sidebar.newSession()
    await chat.sendMessage('25')
    await sidebar.newSession()
    await chat.sendMessage('40')

    const idsBefore = await sidebar.getSessionIds()
    expect(idsBefore.length).toBeGreaterThanOrEqual(3)
    const deletedId = idsBefore[0]
    const activeId = idsBefore[1]

    await sidebar.selectSessionById(activeId)
    await expect(page.getByTestId(`session-row-${activeId}`)).toBeVisible()

    await sidebar.deleteSessionByIndex(0)

    await expect(page.getByTestId(`session-row-${deletedId}`)).not.toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId(`session-row-${activeId}`)).toBeVisible()
    const countAfter = await sidebar.sessionCount()
    expect(countAfter).toBe(idsBefore.length - 1)
  })
})
