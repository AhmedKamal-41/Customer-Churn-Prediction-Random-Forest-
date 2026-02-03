import { type Locator, type Page } from '@playwright/test'

export class ChatPage {
  readonly page: Page
  readonly chatInput: Locator
  readonly sendButton: Locator
  readonly messages: Locator

  constructor(page: Page) {
    this.page = page
    this.chatInput = page.getByTestId('chat-input')
    this.sendButton = page.getByTestId('send-button')
    this.messages = page.getByTestId('messages')
  }

  async sendMessage(text: string): Promise<void> {
    await this.chatInput.fill(text)
    await this.sendButton.click()
  }

  lastAssistantMessage(): Locator {
    return this.messages.getByTestId('message-assistant').last()
  }

  lastUserMessage(): Locator {
    return this.messages.getByTestId('message-user').last()
  }

  async messagesCount(): Promise<number> {
    const user = await this.messages.getByTestId('message-user').count()
    const assistant = await this.messages.getByTestId('message-assistant').count()
    return user + assistant
  }
}
