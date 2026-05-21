/**
 * @jest-environment node
 *
 * Note: we render with `renderToStaticMarkup` instead of `@react-email/render`
 * because the latter performs dynamic ESM imports that require Jest to be
 * launched with `--experimental-vm-modules`. The component itself is plain
 * React, so static-markup output is sufficient to assert the template renders
 * the right props.
 */

import { renderToStaticMarkup } from 'react-dom/server'
import * as React from 'react'

import ListingSoldEmail from '@/components/emails/nft/listing-sold-email'

async function renderEmail(
  props: React.ComponentProps<typeof ListingSoldEmail>,
): Promise<string> {
  return renderToStaticMarkup(React.createElement(ListingSoldEmail, props))
}

const BASE_PROPS: React.ComponentProps<typeof ListingSoldEmail> = {
  nftName: 'Zuno Genesis #42',
  collectionName: 'Zuno Genesis',
  salePrice: 1.25,
}

describe('ListingSoldEmail', () => {
  it('renders sale price and NFT identity', async () => {
    const html = await renderEmail(BASE_PROPS)
    expect(html).toContain('Zuno Genesis #42')
    expect(html).toContain('Zuno Genesis')
    expect(html).toContain('1.25 ETH')
    expect(html).toContain('Your listing sold!')
  })

  it('renders custom currency symbols', async () => {
    const html = await renderEmail({
      ...BASE_PROPS,
      salePrice: 1000,
      currency: 'USDC',
    })
    expect(html).toContain('1000 USDC')
    expect(html).not.toContain('1000 ETH')
  })

  it('renders the optional USD equivalent line', async () => {
    const html = await renderEmail({
      ...BASE_PROPS,
      salePriceUsd: 4500.5,
    })
    expect(html).toContain('$4500.50 USD')
  })

  it('omits the USD line when not provided', async () => {
    const html = await renderEmail(BASE_PROPS)
    expect(html).not.toContain('USD')
  })

  it('renders all fee lines and net proceeds when provided', async () => {
    const html = await renderEmail({
      ...BASE_PROPS,
      marketplaceFee: 0.025,
      royaltyFee: 0.0625,
      netProceeds: 1.1625,
    })
    expect(html).toContain('Marketplace fee')
    expect(html).toContain('-0.0250 ETH')
    expect(html).toContain('Creator royalty')
    expect(html).toContain('-0.0625 ETH')
    expect(html).toContain('Net proceeds')
    expect(html).toContain('1.1625 ETH')
  })

  it('omits fee + net-proceeds rows when not provided', async () => {
    const html = await renderEmail(BASE_PROPS)
    expect(html).not.toContain('Marketplace fee')
    expect(html).not.toContain('Creator royalty')
    expect(html).not.toContain('Net proceeds')
  })

  it('formats long buyer addresses', async () => {
    const html = await renderEmail({
      ...BASE_PROPS,
      buyerAddress: '0xabcdef0123456789abcdef0123456789abcdef01',
    })
    expect(html).toContain('0xabcd...ef01')
    expect(html).not.toContain('0xabcdef0123456789abcdef0123456789abcdef01')
  })

  it('formats long transaction hashes', async () => {
    const html = await renderEmail({
      ...BASE_PROPS,
      transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef',
    })
    expect(html).toContain('0x123456...abcdef')
  })

  it('renders a marketplace CTA button when marketplaceUrl is provided', async () => {
    const html = await renderEmail({
      ...BASE_PROPS,
      marketplaceUrl: 'https://zuno.test/listings',
    })
    expect(html).toContain('View your listings')
    expect(html).toContain('https://zuno.test/listings')
  })

  it('renders explorer URL when provided', async () => {
    const html = await renderEmail({
      ...BASE_PROPS,
      explorerUrl: 'https://etherscan.io/tx/0xdeadbeef',
    })
    expect(html).toContain('https://etherscan.io/tx/0xdeadbeef')
  })

  it('renders a parseable timestamp', async () => {
    const html = await renderEmail({
      ...BASE_PROPS,
      soldAt: '2025-01-15T12:00:00.000Z',
    })
    expect(html).toContain('15 Jan 2025')
  })

  it('silently ignores an unparseable timestamp', async () => {
    const html = await renderEmail({
      ...BASE_PROPS,
      soldAt: 'not a date',
    })
    expect(html).not.toMatch(/Invalid Date/i)
  })

  it('falls back to a placeholder when no image is provided', async () => {
    const html = await renderEmail(BASE_PROPS)
    expect(html).toContain('🖼️')
  })

  it('uses the provided image url when present', async () => {
    const html = await renderEmail({
      ...BASE_PROPS,
      nftImage: 'https://cdn.example.com/nft.png',
    })
    expect(html).toContain('https://cdn.example.com/nft.png')
  })

  it('uses "Collection" as the default collection name', async () => {
    const html = await renderEmail({
      nftName: 'Some NFT',
      salePrice: 1,
    })
    expect(html).toContain('Collection')
  })
})
