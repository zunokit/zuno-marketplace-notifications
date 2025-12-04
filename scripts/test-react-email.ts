/**
 * Test React Email Templates
 *
 * Renders all React Email templates and sends them via Mailpit.
 * View emails at http://localhost:8025
 *
 * Run: npx tsx scripts/test-react-email.ts
 */

import { TemplateService } from '../src/infrastructure/templates/template.service'
import { EmailChannel } from '../src/infrastructure/channels/email/email.channel'

async function main() {
  console.log('=== React Email Templates Test ===\n')

  const templateService = new TemplateService()
  const emailChannel = new EmailChannel()

  // List available templates
  const templates = templateService.getAvailableTemplates()
  console.log('Available templates:', templates.length)
  templates.forEach((t) => console.log(`  - ${t}`))
  console.log('')

  // Test data for each template
  const testData: Record<string, Record<string, unknown>> = {
    'welcome-email': {
      userName: 'John Doe',
      organizationName: 'Zuno Marketplace',
    },
    'auction-won-email': {
      userName: 'John Doe',
      nftName: 'CryptoPunk #1234',
      bidAmount: '2.5 ETH',
    },
    'auction-outbid-email': {
      nftName: 'Bored Ape #5678',
      nftImage: 'https://via.placeholder.com/400x400/4F46E5/ffffff?text=NFT',
      yourBid: 1.5,
      newBid: 2.0,
      auctionEndTime: new Date(Date.now() + 3600000).toISOString(),
      auctionUrl: 'https://zuno.market/auction/5678',
    },
    'floor-price-drop-email': {
      collectionName: 'Cool Cats',
      collectionImage: 'https://via.placeholder.com/400x400/10B981/ffffff?text=Collection',
      previousPrice: 5.0,
      currentPrice: 3.5,
      dropPercentage: 30,
      collectionUrl: 'https://zuno.market/collection/cool-cats',
    },
    'drop-announcement-email': {
      dropName: 'Genesis Collection',
      dropImage: 'https://via.placeholder.com/600x300/8B5CF6/ffffff?text=Drop',
      description: 'The first ever Genesis Collection featuring 10,000 unique NFTs.',
      startDate: new Date(Date.now() + 86400000).toISOString(),
      totalSupply: 10000,
      mintPrice: 0.08,
      dropUrl: 'https://zuno.market/drop/genesis',
    },
    'mint-success-email': {
      nftName: 'Genesis #42',
      nftImage: 'https://via.placeholder.com/400x400/EC4899/ffffff?text=Minted',
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      collectionName: 'Genesis Collection',
      tokenId: '42',
      viewNftUrl: 'https://zuno.market/nft/genesis-42',
    },
    'royalty-received-email': {
      nftName: 'Art Piece #100',
      nftImage: 'https://via.placeholder.com/400x400/F59E0B/ffffff?text=Royalty',
      salePrice: 5.0,
      royaltyPercentage: 10,
      royaltyAmount: 0.5,
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      viewTransactionUrl: 'https://etherscan.io/tx/0xabcdef',
    },
    'whitelist-approved-email': {
      dropName: 'Exclusive Drop',
      dropImage: 'https://via.placeholder.com/600x300/06B6D4/ffffff?text=Whitelist',
      spots: 2,
      mintDate: new Date(Date.now() + 172800000).toISOString(),
      mintPrice: 0.05,
      dropUrl: 'https://zuno.market/drop/exclusive',
    },
  }

  let successCount = 0
  let failCount = 0

  for (const [slug, data] of Object.entries(testData)) {
    console.log(`\nTesting: ${slug}`)

    try {
      // Render the template
      const html = await templateService.renderReactTemplate(slug, data)
      console.log(`  ✓ Rendered (${html.length} chars)`)

      // Send via email channel
      const result = await emailChannel.send({
        to: `${slug.replace(/-/g, '.')}@test.com`,
        subject: `[Test] ${slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
        body: html,
      })

      if (result.success) {
        console.log(`  ✓ Sent to ${slug.replace(/-/g, '.')}@test.com`)
        successCount++
      } else {
        console.log(`  ✗ Send failed: ${result.error}`)
        failCount++
      }
    } catch (error) {
      console.log(`  ✗ Error: ${error instanceof Error ? error.message : error}`)
      failCount++
    }
  }

  // Summary
  console.log('\n=== Summary ===')
  console.log(`Templates tested: ${Object.keys(testData).length}`)
  console.log(`Success: ${successCount}`)
  console.log(`Failed: ${failCount}`)
  console.log('')
  console.log('📧 View all emails at: http://localhost:8025')
}

main()
  .catch((e) => {
    console.error('Script failed:', e)
    process.exit(1)
  })
