/**
 * Test WebSocket Feature
 * Tests the project's WebSocket notification functionality
 *
 * Usage: npx tsx tests/backend-test/test-websocket.ts
 * Note: Requires WebSocket server running (usually on port 3001)
 */

import WebSocket from 'ws'
import 'dotenv/config'

async function testWebSocket() {
  const WS_URL = process.env.WS_URL || 'ws://localhost:3001'
  const BASE_URL = process.env.API_URL || 'http://localhost:3000'
  console.log('🧪 Testing WebSocket Feature\n')

  // 1. Check WebSocket status via API
  console.log('1️⃣ Checking WebSocket status...')
  try {
    const statusRes = await fetch(`${BASE_URL}/api/websocket/status`)
    const statusData = await statusRes.json()
    console.log(`   Status: ${statusRes.status}`)
    console.log(`   Response:`, JSON.stringify(statusData, null, 2))
  } catch (error) {
    console.log(
      `   ⚠️ Status endpoint not available: ${error instanceof Error ? error.message : error}`
    )
  }

  // 2. Test WebSocket connection
  console.log('\n2️⃣ Testing WebSocket connection...')
  console.log(`   Connecting to ${WS_URL}...`)

  return new Promise<void>((resolve) => {
    const ws = new WebSocket(WS_URL)
    let messageCount = 0

    const timeout = setTimeout(() => {
      console.log('\n   ⏱️ Test timeout (10s)')
      ws.close()
      resolve()
    }, 10000)

    ws.on('open', () => {
      console.log('   ✅ Connected!')

      // Subscribe to notifications
      console.log('\n3️⃣ Subscribing to notifications...')
      ws.send(
        JSON.stringify({
          type: 'subscribe',
          payload: {
            userId: 'test-user-123',
            organizationId: 'test-org-456',
          },
        })
      )

      // Test ping
      setTimeout(() => {
        console.log('\n4️⃣ Sending ping...')
        ws.send(JSON.stringify({ type: 'ping' }))
      }, 1000)

      // Close after tests
      setTimeout(() => {
        console.log('\n5️⃣ Closing connection...')
        clearTimeout(timeout)
        ws.close()
      }, 3000)
    })

    ws.on('message', (data: Buffer) => {
      messageCount++
      const message = data.toString()
      console.log(`   📩 Message ${messageCount}:`, message)
    })

    ws.on('close', () => {
      console.log('   ❌ Disconnected')
      console.log(
        `\n✅ WebSocket test completed (${messageCount} messages received)`
      )
      resolve()
    })

    ws.on('error', (err) => {
      console.error(`   ❌ Connection error: ${err.message}`)
      console.log('\n   💡 Make sure WebSocket server is running')
      clearTimeout(timeout)
      resolve()
    })
  })
}

testWebSocket()
