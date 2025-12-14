/**
 * Test All Backend Features
 * Runs all backend feature tests
 *
 * Usage: npx tsx tests/backend-test/test-all.ts
 * Note: Requires `pnpm dev` running
 */

import 'dotenv/config'
const BASE_URL = process.env.API_URL || 'http://localhost:3000'

async function testHealth() {
  console.log('🏥 Testing Health Check...')
  try {
    const res = await fetch(`${BASE_URL}/api/health`)
    const data = await res.json()
    console.log(`   Status: ${res.status}`)
    console.log(`   Response:`, JSON.stringify(data, null, 2))
    return res.ok
  } catch (error) {
    console.error(
      `   ❌ Error: ${error instanceof Error ? error.message : error}`
    )
    return false
  }
}

async function testApiKeyAuth() {
  console.log('\n🔑 Testing API Key Authentication...')
  const apiKey = process.env.API_KEY

  try {
    // Test without API key (should get 401 from proxy)
    console.log('   Without API key:')
    const noKeyRes = await fetch(`${BASE_URL}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    console.log(`   Status: ${noKeyRes.status} (expected 401)`)
    const noKeyPassed = noKeyRes.status === 401

    if (apiKey) {
      // Test with API key
      console.log('   With API key:')
      const withKeyRes = await fetch(`${BASE_URL}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          organizationId: 'test-org',
          userId: 'test-user',
          type: 'WELCOME',
          channel: 'EMAIL',
        }),
      })
      console.log(`   Status: ${withKeyRes.status}`)
      const data = await withKeyRes.json()
      console.log(`   Response:`, JSON.stringify(data, null, 2))
    } else {
      console.log('   ⚠️ No API_KEY set, skipping authenticated test')
    }

    return noKeyPassed
  } catch (error) {
    console.error(
      `   ❌ Error: ${error instanceof Error ? error.message : error}`
    )
    return false
  }
}

async function testWebhookService() {
  console.log('\n🪝 Testing Webhook Service...')
  try {
    // Import and test webhook service directly
    const { WebhookService } = await import(
      '@/infrastructure/webhooks/webhook.service'
    )
    const service = new WebhookService()

    // Test signature generation
    const payload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: { id: '123' },
    }
    const signature = service.generateSignature(payload, 'test-secret')
    console.log(`   Signature generated: ${signature.substring(0, 16)}...`)

    // Test signature verification
    const isValid = service.verifySignature(payload, signature, 'test-secret')
    console.log(`   Signature verification: ${isValid ? '✅' : '❌'}`)

    return isValid
  } catch (error) {
    console.error(
      `   ❌ Error: ${error instanceof Error ? error.message : error}`
    )
    return false
  }
}

async function main() {
  console.log('🧪 Backend Feature Tests\n')
  console.log(`Base URL: ${BASE_URL}\n`)
  console.log('='.repeat(50))

  const results: Record<string, boolean> = {}

  results.health = await testHealth()
  results.apiKeyAuth = await testApiKeyAuth()
  results.webhookService = await testWebhookService()

  console.log('\n' + '='.repeat(50))
  console.log('\n📊 Test Results:')
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`   ${passed ? '✅' : '❌'} ${test}`)
  })

  const allPassed = Object.values(results).every(Boolean)
  console.log(
    `\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}`
  )

  process.exit(allPassed ? 0 : 1)
}

main()
