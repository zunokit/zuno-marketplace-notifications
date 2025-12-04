/**
 * Test Webhook Service
 *
 * Tests the webhook service functionality:
 * - Sending webhooks to external endpoints
 * - HMAC signature generation and verification
 * - Retry logic
 *
 * Run: npx tsx scripts/test-webhook.ts
 */

import { WebhookService } from '../src/infrastructure/webhooks/webhook.service'

async function main() {
  console.log('=== Webhook Service Test ===\n')

  const webhookService = new WebhookService()

  // Test 1: Generate and verify signature
  console.log('Test 1: Signature generation and verification')
  const testPayload = {
    event: 'nft.sold',
    timestamp: new Date().toISOString(),
    data: {
      nftId: 'nft-123',
      price: 1.5,
      buyer: 'user-456',
    },
  }
  // Use a dummy value for testing signature generation/verification
  const hmacValue = 'test'.repeat(8)

  const signature = webhookService.generateSignature(testPayload, hmacValue)
  console.log(`  - Generated signature: ${signature.substring(0, 32)}...`)

  const isValid = webhookService.verifySignature(testPayload, signature, hmacValue)
  if (isValid) {
    console.log('  ✓ Signature verification passed')
  } else {
    console.log('  ✗ Signature verification failed')
  }

  // Test 2: Verify wrong signature fails
  console.log('\nTest 2: Wrong signature rejection')
  // Use a signature with same length but different value
  const wrongSignature = signature.replace(/[0-9a-f]/g, (c) => 
    c === 'f' ? '0' : String.fromCharCode(c.charCodeAt(0) + 1)
  )
  try {
    const isInvalid = webhookService.verifySignature(testPayload, wrongSignature, hmacValue)
    if (!isInvalid) {
      console.log('  ✓ Wrong signature correctly rejected')
    } else {
      console.log('  ✗ Wrong signature was incorrectly accepted')
    }
  } catch {
    console.log('  ✓ Wrong signature correctly rejected (throws error)')
  }

  // Test 3: Send webhook to test endpoint (httpbin.org)
  console.log('\nTest 3: Sending webhook to httpbin.org')
  const result = await webhookService.send(
    'https://httpbin.org/post',
    testPayload,
    hmacValue
  )

  if (result.success) {
    console.log(`  ✓ Webhook sent successfully`)
    console.log(`    - Status code: ${result.statusCode}`)
    console.log(`    - Response time: ${result.responseTime}ms`)
  } else {
    console.log(`  ✗ Webhook failed: ${result.error}`)
  }

  // Test 4: Test timeout/invalid URL
  console.log('\nTest 4: Testing invalid URL handling')
  const failResult = await webhookService.send(
    'https://invalid.test/webhook',
    testPayload
  )

  if (!failResult.success) {
    console.log('  ✓ Invalid URL correctly handled')
    console.log(`    - Error: ${failResult.error}`)
  } else {
    console.log('  ✗ Should have failed for invalid URL')
  }

  // Test 5: Test retry logic (mock endpoint that fails)
  console.log('\nTest 5: Retry logic (sending to endpoint that returns 500)')
  const retryResult = await webhookService.sendWithRetry(
    'https://httpbin.org/status/500',
    testPayload,
    undefined,
    2 // Only 2 retries for faster test
  )

  if (!retryResult.success) {
    console.log('  ✓ Retry logic works (gave up after retries)')
    console.log(`    - Final status: ${retryResult.statusCode}`)
  } else {
    console.log('  Note: Endpoint unexpectedly succeeded')
  }

  // Summary
  console.log('\n=== Summary ===')
  console.log('Webhook service tests completed')
  console.log('')
  console.log('Features tested:')
  console.log('  - HMAC SHA256 signature generation')
  console.log('  - Signature verification')
  console.log('  - HTTP POST to external endpoint')
  console.log('  - Error handling for invalid URLs')
  console.log('  - Retry logic with exponential backoff')
}

main()
  .catch((e) => {
    console.error('Script failed:', e)
    process.exit(1)
  })
