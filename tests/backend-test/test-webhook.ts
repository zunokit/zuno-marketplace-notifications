/**
 * Test Webhook Feature
 * Tests the project's webhook subscription and sending functionality
 *
 * Usage: npx tsx tests/backend-test/test-webhook.ts
 * Note: Requires `pnpm dev` running on localhost:3000
 */

import 'dotenv/config'

async function testWebhook() {
  const BASE_URL = process.env.API_URL || 'http://localhost:3000'

  console.log('🧪 Testing Webhook Feature\n')
  console.log(`Base URL: ${BASE_URL}\n`)

  // 1. Create a webhook subscription
  console.log('1️⃣ Creating webhook subscription...')
  try {
    const createRes = await fetch(`${BASE_URL}/api/webhooks/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId: '00000000-0000-0000-0000-000000000000', // Replace with valid org ID
        url: 'https://webhook.site/test', // Use webhook.site for testing
        events: ['notification.sent', 'notification.failed'],
        description: 'Test webhook',
      }),
    })

    const createData = await createRes.json()
    console.log(`   Status: ${createRes.status}`)
    console.log(`   Response:`, JSON.stringify(createData, null, 2))

    if (createRes.ok && createData.id) {
      // 2. List webhooks
      console.log('\n2️⃣ Listing webhooks...')
      const listRes = await fetch(`${BASE_URL}/api/webhooks/${createData.id}`)
      const listData = await listRes.json()
      console.log(`   Status: ${listRes.status}`)
      console.log(`   Response:`, JSON.stringify(listData, null, 2))

      // 3. Test webhook (send test payload)
      console.log('\n3️⃣ Sending test webhook...')
      const testRes = await fetch(
        `${BASE_URL}/api/webhooks/${createData.id}/test`,
        {
          method: 'POST',
        }
      )
      const testData = await testRes.json()
      console.log(`   Status: ${testRes.status}`)
      console.log(`   Response:`, JSON.stringify(testData, null, 2))

      // 4. Delete webhook
      console.log('\n4️⃣ Deleting webhook...')
      const deleteRes = await fetch(
        `${BASE_URL}/api/webhooks/${createData.id}`,
        {
          method: 'DELETE',
        }
      )
      console.log(`   Status: ${deleteRes.status}`)
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
  }

  console.log('\n✅ Webhook test completed')
}

testWebhook()
