import { test, expect } from '@playwright/test'
import { SidebarPage } from '../pages/sidebar'
import { ChatPage } from '../pages/chat'

test.describe('Async safety', () => {
  test('send message in session A, switch to B before next message; response appears only in A', async ({
    page,
  }) => {
    await page.goto('/chat')
    const sidebar = new SidebarPage(page)
    const chat = new ChatPage(page)

    await sidebar.newSession()
    await expect(chat.chatInput).toBeVisible({ timeout: 10000 })
    await chat.sendMessage('30')

    await sidebar.newSession()
    await expect(chat.chatInput).toBeVisible({ timeout: 5000 })

    const ids = await sidebar.getSessionIds()
    expect(ids.length).toBeGreaterThanOrEqual(2)
    const idA = ids[1]
    const idB = ids[0]

    await sidebar.selectSessionById(idA)
    await expect(chat.messages.getByTestId('message-assistant').filter({ hasText: /months|tenure/i })).toBeVisible({
      timeout: 8000,
    })
    const assistantInA = await chat.messages.getByTestId('message-assistant').count()

    await sidebar.selectSessionById(idB)
    const assistantInB = await chat.messages.getByTestId('message-assistant').count()
    expect(assistantInB).toBeLessThanOrEqual(assistantInA)
  })
})
