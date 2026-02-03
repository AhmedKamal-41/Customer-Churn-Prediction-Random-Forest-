import { test, expect } from '@playwright/test'
import { SidebarPage } from '../pages/sidebar'
import { ChatPage } from '../pages/chat'

test.describe('Smoke', () => {
  test('app loads, sessions list or new session exists, chat input visible after creating session', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Churn Assistant' }).first()).toBeVisible()
    await expect(page.getByText('Model Dashboard').or(page.getByText('Churn Assistant')).first()).toBeVisible()

    await page.goto('/chat')
    const sidebar = new SidebarPage(page)
    await expect(sidebar.newSessionBtn.first()).toBeVisible()

    await sidebar.newSession()
    const chat = new ChatPage(page)
    await expect(chat.chatInput).toBeVisible({ timeout: 10000 })
  })
})
