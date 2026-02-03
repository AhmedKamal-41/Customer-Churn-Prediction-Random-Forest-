#!/usr/bin/env node
/**
 * Reads Playwright JSON report (playwright-report/results.json), computes summary,
 * and writes site/qa/automation-summary.json for the Automation Dashboard and GitHub Pages.
 * Run from repo root after Playwright tests (e.g. in CI).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const RESULTS_PATH = process.env.PLAYWRIGHT_JSON_RESULTS_PATH ||
  path.join(repoRoot, 'frontend', 'playwright-report', 'results.json')
const OUT_DIR = path.join(repoRoot, 'site', 'qa')
const OUT_FILE = path.join(OUT_DIR, 'automation-summary.json')

function collectSpecsFromSuite(suite) {
  if (!suite) return []
  const specs = suite.specs || []
  const fromChildren = (suite.suites || []).flatMap(collectSpecsFromSuite)
  return [...specs, ...fromChildren]
}

function collectAllTests(report) {
  const suites = report.suites || []
  const specs = suites.flatMap(collectSpecsFromSuite)
  const tests = specs.flatMap((spec) => spec.tests || [])
  return tests
}

function getStatusFromTest(test) {
  const results = test.results || []
  const last = results[results.length - 1]
  return last ? last.status : 'skipped'
}

function getDurationFromTest(test) {
  const results = test.results || []
  return results.reduce((sum, r) => sum + (r.duration ?? 0), 0)
}

function main() {
  let raw
  try {
    raw = fs.readFileSync(RESULTS_PATH, 'utf8')
  } catch (err) {
    console.error('Failed to read Playwright results:', RESULTS_PATH, err.message)
    process.exit(1)
  }

  let report
  try {
    report = JSON.parse(raw)
  } catch (err) {
    console.error('Invalid JSON in', RESULTS_PATH, err.message)
    process.exit(1)
  }

  const allTests = collectAllTests(report)

  const counts = { passed: 0, failed: 0, skipped: 0, timedOut: 0 }
  let totalDurationMs = 0

  for (const test of allTests) {
    const status = getStatusFromTest(test)
    if (status === 'passed') counts.passed++
    else if (status === 'failed' || status === 'timedOut') counts.failed++
    else if (status === 'skipped') counts.skipped++
    else counts.failed++
    totalDurationMs += getDurationFromTest(test)
  }

  const total = allTests.length
  const durationSec = Math.round(totalDurationMs / 1000)
  const status = counts.failed > 0 ? 'fail' : 'pass'

  const repo = process.env.GITHUB_REPOSITORY || 'owner/repo'
  const [owner, repoName] = repo.split('/')
  const reportUrl = `https://${owner}.github.io/${repoName}/playwright-report/`
  const runUrl = process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : null

  const summary = {
    status,
    total,
    passed: counts.passed,
    failed: counts.failed,
    skipped: counts.skipped,
    durationSec,
    timestamp: new Date().toISOString(),
    branch: process.env.GITHUB_REF_NAME || 'main',
    commit: process.env.GITHUB_SHA || '',
    runUrl: runUrl || undefined,
    reportUrl,
    message: undefined,
    runnerOs: process.env.RUNNER_OS || undefined,
  }

  try {
    fs.mkdirSync(OUT_DIR, { recursive: true })
    fs.writeFileSync(OUT_FILE, JSON.stringify(summary, null, 2), 'utf8')
    console.log('Wrote', OUT_FILE)
  } catch (err) {
    console.error('Failed to write summary:', OUT_FILE, err.message)
    process.exit(1)
  }
}

main()
