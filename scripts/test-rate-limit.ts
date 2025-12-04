/**
 * Test Rate Limiting Service
 *
 * Tests rate limiting functionality:
 * - Per-minute, per-hour, per-day limits
 * - Rate limit checking
 * - Quota remaining
 *
 * Note: Requires Redis to be running (pnpm docker:up)
 *
 * Run: npx tsx scripts/test-rate-limit.ts
 */

import { RateLimitService } from '../src/core/services/rate-limit.service'

async function main() {
  console.log('=== Rate Limit Service Test ===\n')

  const rateLimitService = new RateLimitService()
  const testOrgId = 'test-org-rate-limit'
  const channel = 'EMAIL' as const

  // Custom config for testing (lower limits)
  const testConfig = {
    maxPerMinute: 5,
    maxPerHour: 20,
    maxPerDay: 100,
  }

  console.log('Test config:', testConfig)
  console.log('')

  // Test 1: Check initial rate limit (should allow)
  console.log('Test 1: Initial rate limit check')
  try {
    const result1 = await rateLimitService.checkRateLimit(testOrgId, channel, testConfig)
    console.log(`  - Allowed: ${result1.allowed}`)
    console.log(`  - Remaining: ${result1.remaining}`)
    console.log(`  - Limit: ${result1.limit}`)

    if (result1.allowed) {
      console.log('  ✓ Initial request allowed')
    } else {
      console.log('  ✗ Initial request should be allowed')
    }
  } catch (error) {
    console.log(`  ✗ Error: ${error instanceof Error ? error.message : error}`)
    console.log('  Note: Make sure Redis is running (pnpm docker:up)')
    return
  }

  // Test 2: Multiple requests within limit
  console.log('\nTest 2: Multiple requests within limit (4 more)')
  for (let i = 2; i <= 5; i++) {
    const result = await rateLimitService.checkRateLimit(testOrgId, channel, testConfig)
    console.log(`  Request ${i}: allowed=${result.allowed}, remaining=${result.remaining}`)
  }

  // Test 3: Exceed rate limit
  console.log('\nTest 3: Exceeding rate limit (6th request)')
  const exceededResult = await rateLimitService.checkRateLimit(testOrgId, channel, testConfig)
  if (!exceededResult.allowed) {
    console.log('  ✓ Rate limit correctly enforced')
    console.log(`    - Remaining: ${exceededResult.remaining}`)
    console.log(`    - Reset at: ${exceededResult.resetAt.toISOString()}`)
  } else {
    console.log('  ✗ Rate limit should have been exceeded')
  }

  // Test 4: Get remaining quota
  console.log('\nTest 4: Getting remaining quota')
  const quota = await rateLimitService.getRemainingQuota(testOrgId, channel, testConfig)
  console.log(`  - Minute remaining: ${quota.minute}`)
  console.log(`  - Hour remaining: ${quota.hour}`)
  console.log(`  - Day remaining: ${quota.day}`)

  // Test 5: Reset rate limit
  console.log('\nTest 5: Resetting rate limit')
  await rateLimitService.resetRateLimit(testOrgId, channel)
  console.log('  ✓ Rate limit reset')

  // Verify reset worked
  const afterReset = await rateLimitService.checkRateLimit(testOrgId, channel, testConfig)
  if (afterReset.allowed && afterReset.remaining === testConfig.maxPerMinute - 1) {
    console.log('  ✓ Rate limit correctly reset')
  }

  // Test 6: Different channels have separate limits
  console.log('\nTest 6: Different channels have separate limits')
  const emailResult = await rateLimitService.checkRateLimit(testOrgId, 'EMAIL', testConfig)
  const wsResult = await rateLimitService.checkRateLimit(testOrgId, 'WEBSOCKET', testConfig)
  
  console.log(`  - EMAIL remaining: ${emailResult.remaining}`)
  console.log(`  - WEBSOCKET remaining: ${wsResult.remaining}`)
  
  if (emailResult.remaining !== wsResult.remaining || wsResult.remaining === testConfig.maxPerMinute - 1) {
    console.log('  ✓ Channels have separate rate limits')
  }

  // Clean up
  await rateLimitService.resetRateLimit(testOrgId, 'EMAIL')
  await rateLimitService.resetRateLimit(testOrgId, 'WEBSOCKET')

  // Summary
  console.log('\n=== Summary ===')
  console.log('Rate Limit Service tests completed')
  console.log('')
  console.log('Features tested:')
  console.log('  - Rate limit checking')
  console.log('  - Limit enforcement')
  console.log('  - Remaining quota retrieval')
  console.log('  - Rate limit reset')
  console.log('  - Per-channel rate limits')
}

main()
  .catch((e) => {
    console.error('Script failed:', e)
    process.exit(1)
  })
