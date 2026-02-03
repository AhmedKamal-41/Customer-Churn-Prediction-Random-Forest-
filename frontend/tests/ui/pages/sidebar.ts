import { type Locator, type Page } from '@playwright/test'

export class SidebarPage {
  readonly page: Page
  readonly newSessionBtn: Locator
  readonly sessionsList: Locator

  constructor(page: Page) {
    this.page = page
    this.newSessionBtn = page.getByTestId('new-session')
    this.sessionsList = page.getByTestId('sessions-list')
  }

  async newSession(): Promise<void> {
    await this.newSessionBtn.first().click()
  }

  async selectSessionByIndex(index: number): Promise<void> {
    await this.sessionsList.locator('li').nth(index).locator('[data-testid^="session-row-"]').click()
  }

  async getSessionRowBySessionId(sessionId: string): Promise<Locator> {
    return this.page.getByTestId(`session-row-${sessionId}`)
  }

  async selectSessionById(sessionId: string): Promise<void> {
    await this.page.getByTestId(`session-row-${sessionId}`).click()
  }

  async deleteSessionById(sessionId: string): Promise<void> {
    await this.page.getByTestId(`delete-session-${sessionId}`).click()
  }

  async deleteSessionByIndex(index: number): Promise<void> {
    const li = this.sessionsList.locator('li').nth(index)
    await li.locator('[data-testid^="delete-session-"]').click()
  }

  sessionCount(): Promise<number> {
    return this.sessionsList.locator('li').count()
  }

  async getSessionIds(): Promise<string[]> {
    const count = await this.sessionsList.locator('li').count()
    const ids: string[] = []
    for (let i = 0; i < count; i++) {
      const deleteBtn = this.sessionsList.locator('li').nth(i).locator('[data-testid^="delete-session-"]')
      const testId = await deleteBtn.getAttribute('data-testid')
      if (testId) {
        const match = testId.match(/delete-session-(.+)/)
        if (match) ids.push(match[1])
      }
    }
    return ids
  }
}
