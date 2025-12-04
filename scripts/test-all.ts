/**
 * Run All Tests
 *
 * Comprehensive test suite that runs all test scripts.
 *
 * Run: npx tsx scripts/test-all.ts
 */

import { execSync } from 'child_process'
import path from 'path'

interface TestResult {
  name: string
  success: boolean
  duration: number
  error?: string
}

const tests = [
  { name: 'System Status', script: 'check-status.ts' },
  { name: 'Email Channel', script: 'test-email-channel.ts' },
  { name: 'React Email Templates', script: 'test-react-email.ts' },
  { name: 'Notification Flow', script: 'verify-notification-flow.ts' },
  { name: 'Process Outbox', script: 'process-outbox.ts' },
  { name: 'Webhook Service', script: 'test-webhook.ts' },
  { name: 'Price Alerts', script: 'test-price-alerts.ts' },
  { name: 'Rate Limiting', script: 'test-rate-limit.ts' },
]

async function runTest(name: string, script: string): Promise<TestResult> {
  const startTime = Date.now()
  const scriptPath = path.join(__dirname, script)

  try {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Running: ${name}`)
    console.log('='.repeat(60))

    execSync(`npx tsx "${scriptPath}"`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    })

    return {
      name,
      success: true,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    return {
      name,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║         ZUNO NOTIFICATIONS - COMPREHENSIVE TEST          ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log('')
  console.log(`Tests to run: ${tests.length}`)
  console.log('Prerequisites:')
  console.log('  - Docker services running (pnpm docker:up)')
  console.log('  - Database migrated (pnpm db:migrate)')
  console.log('')

  const results: TestResult[] = []
  const overallStart = Date.now()

  for (const test of tests) {
    const result = await runTest(test.name, test.script)
    results.push(result)
  }

  const overallDuration = Date.now() - overallStart

  // Print summary
  console.log('\n')
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║                      TEST SUMMARY                        ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log('')

  const passed = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  console.log('Results:')
  console.log('─'.repeat(60))

  for (const result of results) {
    const status = result.success ? '✓ PASS' : '✗ FAIL'
    const duration = `${(result.duration / 1000).toFixed(2)}s`
    console.log(`  ${status.padEnd(8)} │ ${result.name.padEnd(30)} │ ${duration}`)
    if (!result.success && result.error) {
      console.log(`           │ Error: ${result.error.substring(0, 45)}...`)
    }
  }

  console.log('─'.repeat(60))
  console.log('')
  console.log(`Total: ${results.length} tests`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)
  console.log(`Duration: ${(overallDuration / 1000).toFixed(2)}s`)
  console.log('')

  if (failed > 0) {
    console.log('⚠️  Some tests failed. Check output above for details.')
    process.exit(1)
  } else {
    console.log('✅ All tests passed!')
    console.log('')
    console.log('📧 View emails at: http://localhost:8025')
  }
}

main()
  .catch((e) => {
    console.error('Test runner failed:', e)
    process.exit(1)
  })
