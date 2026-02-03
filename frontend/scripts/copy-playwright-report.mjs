#!/usr/bin/env node
/**
 * Copies playwright-report to public/playwright-report so the report is served
 * at /playwright-report/ when running npm run dev. Run after npm run test:ui.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendDir = path.resolve(__dirname, '..')
const srcDir = path.join(frontendDir, 'playwright-report')
const destDir = path.join(frontendDir, 'public', 'playwright-report')

if (!fs.existsSync(srcDir)) {
  console.warn('playwright-report not found. Run npm run test:ui first.')
  process.exit(0)
}

fs.rmSync(destDir, { recursive: true, force: true })
fs.cpSync(srcDir, destDir, { recursive: true })
console.log('Copied playwright-report to public/playwright-report')
