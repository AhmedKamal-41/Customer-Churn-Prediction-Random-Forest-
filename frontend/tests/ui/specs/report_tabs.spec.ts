import { test, expect } from '@playwright/test'
import { SidebarPage } from '../pages/sidebar'
import { ChatPage } from '../pages/chat'

test.describe('Report / panel tabs', () => {
  test('report-tabs exists; click Profile, Insights and content changes', async ({ page }) => {
    await page.goto('/chat')
    const sidebar = new SidebarPage(page)
    const chat = new ChatPage(page)

    await sidebar.newSession()
    await expect(chat.chatInput).toBeVisible({ timeout: 10000 })

    const reportTabs = page.getByTestId('report-tabs')
    await expect(reportTabs.first()).toBeVisible({ timeout: 5000 })

    await reportTabs.getByRole('tab', { name: 'Profile' }).first().click()
    await expect(page.getByText(/Profile|Customer|answers/i).first()).toBeVisible({ timeout: 3000 })

    await reportTabs.getByRole('tab', { name: 'Insights' }).first().click()
    await expect(page.getByText(/Insights|Risk|Prediction/i).first()).toBeVisible({ timeout: 3000 })
  })
})
