/**
 * MSW browser worker. Only started when VITE_E2E=true (E2E tests).
 */
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

export async function startE2EMocks() {
  return worker.start({
    quiet: true,
    onUnhandledRequest: 'bypass',
  })
}
