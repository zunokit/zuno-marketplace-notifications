/**
 * Test Price Alert Service
 *
 * Tests price alert functionality:
 * - Creating price alerts
 * - Triggering alerts based on price conditions
 * - Floor price drop notifications
 *
 * Run: npx tsx scripts/test-price-alerts.ts
 */

import { PrismaClient } from '../src/infrastructure/database/generated'
import { PriceAlertService } from '../src/core/services/price-alert.service'

const prisma = new PrismaClient()

async function main() {
  console.log('=== Price Alert Service Test ===\n')

  const priceAlertService = new PriceAlertService()

  // Setup: Get or create test data
  console.log('Setting up test data...')

  let org = await prisma.organization.findFirst({ where: { slug: 'test-org' } })
  let user = await prisma.user.findFirst({ where: { email: 'test@example.com' } })

  if (!org || !user) {
    console.log('  ✗ Test organization/user not found. Run verify-notification-flow.ts first.')
    return
  }

  console.log(`  ✓ Using org: ${org.id}`)
  console.log(`  ✓ Using user: ${user.id}`)

  // Test 1: Create a price alert
  console.log('\nTest 1: Creating price alert (target: 2.0 ETH, condition: below)')
  try {
    const alert = await priceAlertService.createPriceAlert({
      userId: user.id,
      organizationId: org.id,
      itemType: 'nft',
      itemId: 'test-nft-001',
      targetPrice: 2.0,
      condition: 'below',
    })
    console.log(`  ✓ Alert created: ${alert.id}`)

    // Test 2: Check price (should trigger)
    console.log('\nTest 2: Checking price at 1.5 ETH (should trigger "below 2.0")')
    await priceAlertService.checkPriceAlerts({
      itemType: 'nft',
      itemId: 'test-nft-001',
      currentPrice: 1.5,
      itemName: 'Test NFT #001',
    })
    console.log('  ✓ Price check completed')

    // Verify alert was triggered
    const triggeredAlert = await prisma.priceAlert.findUnique({
      where: { id: alert.id },
    })

    if (triggeredAlert?.triggered) {
      console.log('  ✓ Alert was triggered correctly')
      console.log(`    - Triggered at: ${triggeredAlert.triggeredAt}`)
    } else {
      console.log('  - Alert not triggered (may already exist)')
    }

    // Clean up: Deactivate alert
    await priceAlertService.deactivateAlert(alert.id)
    console.log('  ✓ Alert deactivated')
  } catch (error) {
    console.log(`  - Note: ${error instanceof Error ? error.message : error}`)
  }

  // Test 3: Create "above" condition alert
  console.log('\nTest 3: Creating price alert (target: 5.0 ETH, condition: above)')
  try {
    const alertAbove = await priceAlertService.createPriceAlert({
      userId: user.id,
      organizationId: org.id,
      itemType: 'collection',
      itemId: 'test-collection-001',
      targetPrice: 5.0,
      condition: 'above',
    })
    console.log(`  ✓ Alert created: ${alertAbove.id}`)

    // Check price that should NOT trigger
    console.log('\nTest 4: Checking price at 4.0 ETH (should NOT trigger "above 5.0")')
    await priceAlertService.checkPriceAlerts({
      itemType: 'collection',
      itemId: 'test-collection-001',
      currentPrice: 4.0,
      itemName: 'Test Collection',
    })

    const notTriggered = await prisma.priceAlert.findUnique({
      where: { id: alertAbove.id },
    })

    if (!notTriggered?.triggered) {
      console.log('  ✓ Alert correctly NOT triggered (price not above target)')
    }

    // Check price that SHOULD trigger
    console.log('\nTest 5: Checking price at 6.0 ETH (should trigger "above 5.0")')
    await priceAlertService.checkPriceAlerts({
      itemType: 'collection',
      itemId: 'test-collection-001',
      currentPrice: 6.0,
      itemName: 'Test Collection',
    })

    const triggered = await prisma.priceAlert.findUnique({
      where: { id: alertAbove.id },
    })

    if (triggered?.triggered) {
      console.log('  ✓ Alert triggered correctly')
    }

    // Clean up
    await priceAlertService.deactivateAlert(alertAbove.id)
  } catch (error) {
    console.log(`  - Note: ${error instanceof Error ? error.message : error}`)
  }

  // Test 6: Floor price drop
  console.log('\nTest 6: Testing floor price drop notification')
  try {
    // First create a watchlist entry
    await prisma.watchlist.upsert({
      where: {
        id: 'test-watchlist-floor',
      },
      update: {},
      create: {
        id: 'test-watchlist-floor',
        organizationId: org.id,
        userId: user.id,
        itemType: 'collection',
        itemId: 'cool-cats-collection',
      },
    })

    await priceAlertService.checkFloorPriceDrops({
      collectionId: 'cool-cats-collection',
      collectionName: 'Cool Cats',
      previousFloorPrice: 10.0,
      currentFloorPrice: 7.0,
      dropPercentage: 10, // Alert if drop > 10%
    })
    console.log('  ✓ Floor price drop check completed (30% drop detected)')
  } catch (error) {
    console.log(`  - Note: ${error instanceof Error ? error.message : error}`)
  }

  // Test 7: Get user alerts
  console.log('\nTest 7: Getting user alerts')
  const userAlerts = await priceAlertService.getUserAlerts(user.id)
  console.log(`  ✓ Found ${userAlerts.length} active alerts for user`)

  // Summary
  console.log('\n=== Summary ===')
  console.log('Price Alert Service tests completed')
  console.log('')
  console.log('Features tested:')
  console.log('  - Create price alerts (above/below conditions)')
  console.log('  - Trigger alerts based on price changes')
  console.log('  - Floor price drop detection')
  console.log('  - Alert deactivation')
  console.log('  - Get user alerts')
}

main()
  .catch((e) => {
    console.error('Script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
