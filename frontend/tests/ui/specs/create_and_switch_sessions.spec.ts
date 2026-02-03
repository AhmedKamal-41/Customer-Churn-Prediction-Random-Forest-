import { test, expect } from '@playwright/test'
import { SidebarPage } from '../pages/sidebar'
import { ChatPage } from '../pages/chat'

test.describe('Sessions flow', () => {
  test('create session A, send age 30; create session B, send age 25; switch A/B and verify messages', async ({
    page,
  }) => {
    await page.goto('/chat')
    const sidebar = new SidebarPage(page)
    const chat = new ChatPage(page)

    await sidebar.newSession()
    await expect(chat.chatInput).toBeVisible({ timeout: 10000 })
    await chat.sendMessage('30')
    await expect(chat.lastAssistantMessage()).toContainText(/months|tenure/i, { timeout: 8000 })

    await sidebar.newSession()
    await expect(chat.chatInput).toBeVisible({ timeout: 5000 })
    await chat.sendMessage('25')
    await expect(chat.lastAssistantMessage()).toContainText(/months|tenure/i, { timeout: 8000 })

    const ids = await sidebar.getSessionIds()
    expect(ids.length).toBeGreaterThanOrEqual(2)
    const idA = ids[1]
    const idB = ids[0]

    await sidebar.selectSessionById(idA)
    await page.waitForURL(new RegExp(`/chat/${idA}`), { timeout: 5000 })
    await expect(chat.messages.getByTestId('message-user').filter({ hasText: '30' })).toBeVisible({
      timeout: 8000,
    })

    await sidebar.selectSessionById(idB)
    await page.waitForURL(/\/chat\/.+/, { timeout: 5000 })
    await expect(chat.messages.getByTestId('message-user').filter({ hasText: '25' })).toBeVisible({
      timeout: 8000,
    })

    await sidebar.selectSessionById(idA)
    await page.waitForURL(new RegExp(`/chat/${idA}`), { timeout: 5000 })
    await expect(chat.messages.getByTestId('message-user').filter({ hasText: '30' })).toBeVisible({
      timeout: 8000,
    })
  })
})
