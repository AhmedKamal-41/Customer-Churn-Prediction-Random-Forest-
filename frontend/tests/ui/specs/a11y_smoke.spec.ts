import { test, expect } from '@playwright/test'
import { SidebarPage } from '../pages/sidebar'
import { ChatPage } from '../pages/chat'

test.describe('Accessibility', () => {
  test('delete button has aria-label; chat input focusable; send works via Enter', async ({
    page,
  }) => {
    await page.goto('/chat')
    const sidebar = new SidebarPage(page)
    const chat = new ChatPage(page)

    await sidebar.newSession()
    await expect(chat.chatInput).toBeVisible({ timeout: 10000 })

    const deleteBtn = page.getByRole('button', { name: 'Delete session' }).first()
    await expect(deleteBtn).toBeVisible({ timeout: 5000 })
    await expect(deleteBtn).toHaveAttribute('aria-label', 'Delete session')

    await chat.chatInput.focus()
    await chat.chatInput.fill('35')
    await page.keyboard.press('Enter')
    await expect(chat.lastUserMessage()).toContainText('35', { timeout: 8000 })
  })
})
