import { test, expect } from '@playwright/test'
import { SidebarPage } from '../pages/sidebar'
import { ChatPage } from '../pages/chat'

test.describe('Delete flow', () => {
  test('create 2 sessions, activate first, delete active -> navigates to remaining, chat input works', async ({
    page,
  }) => {
    await page.goto('/chat')
    const sidebar = new SidebarPage(page)
    const chat = new ChatPage(page)

    await sidebar.newSession()
    await chat.sendMessage('30')
    await sidebar.newSession()
    await chat.sendMessage('25')

    const ids = await sidebar.getSessionIds()
    expect(ids.length).toBeGreaterThanOrEqual(2)
    const firstId = ids[1]
    const secondId = ids[0]

    await sidebar.selectSessionById(firstId)
    await expect(page.getByTestId(`session-row-${firstId}`)).toBeVisible()

    await sidebar.deleteSessionById(firstId)

    await expect(page.getByTestId(`session-row-${secondId}`)).toBeVisible({ timeout: 5000 })
    await sidebar.selectSessionById(secondId)
    await expect(chat.chatInput).toBeVisible({ timeout: 15000 })
    await chat.sendMessage('12')
    await expect(chat.lastUserMessage()).toContainText('12', { timeout: 5000 })
  })
})
