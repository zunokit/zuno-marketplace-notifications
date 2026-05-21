/**
 * @jest-environment node
 *
 * Note: we render with `renderToStaticMarkup` instead of `@react-email/render`
 * because the latter performs dynamic ESM imports that require Jest to be
 * launched with `--experimental-vm-modules`. The component itself is plain
 * React, so static-markup output is sufficient to assert the template renders
 * the right props. Matches the convention established for ListingSoldEmail.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import * as React from 'react'

import {
  BidReceivedEmail,
  type BidReceivedEmailProps,
} from '@/components/emails/nft/bid-received-email'

const baseProps: BidReceivedEmailProps = {
  recipientName: 'Tran',
  nftName: 'Zuno Genesis #42',
  collectionName: 'Zuno Genesis',
  listingPrice: 1.5,
  bidAmount: 1.65,
  bidExpiresAt: '2030-01-01T12:00:00Z',
  bidderName: 'cyber_collector',
  bidderAddress: '0x1234567890abcdef1234567890abcdef12345678',
  listingUrl: 'https://zuno.xyz/listings/abc',
}

async function renderHtml(
  props: Partial<BidReceivedEmailProps> = {},
): Promise<string> {
  return renderToStaticMarkup(
    React.createElement(BidReceivedEmail, { ...baseProps, ...props }),
  )
}

describe('BidReceivedEmail', () => {
  it('renders a non-empty html document containing the NFT name', async () => {
    const html = await renderHtml()
    expect(html.length).toBeGreaterThan(200)
    expect(html).toContain('Zuno Genesis #42')
    expect(html).toContain('Zuno Genesis')
  })

  it('formats listing price and incoming bid with the default currency', async () => {
    const html = await renderHtml({ listingPrice: 1.5, bidAmount: 1.65 })
    expect(html).toContain('1.5000 ETH')
    expect(html).toContain('1.6500 ETH')
  })

  it('renders "above your asking price" when the bid exceeds listingPrice', async () => {
    const html = await renderHtml({ listingPrice: 1.0, bidAmount: 1.5 })
    expect(html).toContain('above your asking price')
  })

  it('renders "below your asking price" when the bid is lower than listingPrice', async () => {
    const html = await renderHtml({ listingPrice: 2.0, bidAmount: 1.5 })
    expect(html).toContain('below your asking price')
  })

  it('truncates the bidder address to 0x1234…5678 form', async () => {
    const html = await renderHtml()
    expect(html).toContain('0x1234')
    expect(html).toContain('5678')
    // never the full 40-hex address inline (the template uses an ellipsis)
    expect(html).not.toContain('0x1234567890abcdef1234567890abcdef12345678')
  })

  it('omits the address span when bidderAddress is missing', async () => {
    const html = await renderHtml({ bidderAddress: undefined })
    expect(html).toContain('cyber_collector')
    expect(html).not.toContain('0x')
  })

  it('omits the timer block when bidExpiresAt is missing', async () => {
    const html = await renderHtml({ bidExpiresAt: undefined })
    expect(html).not.toContain('Bid expires')
  })

  it('omits the CTA section when listingUrl is missing', async () => {
    const html = await renderHtml({ listingUrl: undefined })
    expect(html).not.toContain('Review bid')
  })

  it('honors a custom currency symbol', async () => {
    const html = await renderHtml({ currencySymbol: 'WETH' })
    expect(html).toContain('WETH')
    expect(html).not.toMatch(/\bETH\b/)
  })

  it('renders the recipient name in the CTA subtext', async () => {
    const html = await renderHtml({ recipientName: 'Đãng' })
    expect(html).toContain('Hi Đãng')
  })
})

describe('TemplateService integration', () => {
  it('registers bid-received-email in the template service', async () => {
    const { TemplateService } = await import(
      '@/infrastructure/templates/template.service'
    )
    const service = new TemplateService()
    expect(service.getAvailableTemplates()).toContain('bid-received-email')
  })
})
