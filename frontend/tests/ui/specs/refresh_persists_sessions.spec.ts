import { test, expect } from '@playwright/test'
import { SidebarPage } from '../pages/sidebar'
import { ChatPage } from '../pages/chat'

test.describe('Persistence', () => {
  test('create session, send message, reload -> session and message remain', async ({ page }) => {
    await page.goto('/chat')
    const sidebar = new SidebarPage(page)
    const chat = new ChatPage(page)

    await sidebar.newSession()
    await expect(chat.chatInput).toBeVisible({ timeout: 10000 })
    await chat.sendMessage('30')
    await expect(chat.lastUserMessage()).toContainText('30', { timeout: 5000 })

    const idsBefore = await sidebar.getSessionIds()
    expect(idsBefore.length).toBeGreaterThanOrEqual(1)
    const sessionId = idsBefore[idsBefore.length - 1]

    await page.reload()
    await expect(page.getByTestId('sessions-list').or(page.getByTestId('new-session')).first()).toBeVisible({
      timeout: 10000,
    })

    await page.getByTestId(`session-row-${sessionId}`).first().click()
    await expect(chat.messages.getByTestId('message-user').filter({ hasText: '30' })).toBeVisible({
      timeout: 5000,
    })
  })
})
