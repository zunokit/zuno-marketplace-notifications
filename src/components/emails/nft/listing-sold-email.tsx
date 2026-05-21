import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import { EmailButton, EmailFooter, EmailHeader, HeroSection } from '../common'

export interface ListingSoldEmailProps {
  nftName: string
  nftImage?: string
  collectionName?: string
  salePrice: number
  /** Currency symbol shown next to the price. Defaults to `ETH`. */
  currency?: string
  /** USD-equivalent at the time of sale; rendered as a small subtitle when set. */
  salePriceUsd?: number
  buyerAddress?: string
  marketplaceFee?: number
  royaltyFee?: number
  /** Net amount paid out to the seller. When omitted, only the gross sale price is shown. */
  netProceeds?: number
  transactionHash?: string
  explorerUrl?: string
  marketplaceUrl?: string
  /** ISO timestamp; rendered with `toLocaleString()`. */
  soldAt?: string
}

function formatAddress(address: string): string {
  if (address.length <= 14) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatTx(hash: string): string {
  if (hash.length <= 14) return hash
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`
}

function formatTimestamp(value?: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toUTCString()
}

export const ListingSoldEmail = ({
  nftName,
  nftImage,
  collectionName = 'Collection',
  salePrice,
  currency = 'ETH',
  salePriceUsd,
  buyerAddress,
  marketplaceFee,
  royaltyFee,
  netProceeds,
  transactionHash,
  explorerUrl,
  marketplaceUrl,
  soldAt,
}: ListingSoldEmailProps) => {
  const formattedTimestamp = formatTimestamp(soldAt)

  return (
    <Html>
      <Head />
      <Preview>
        Sold! {nftName} just sold for {salePrice} {currency}.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          <HeroSection
            emoji="💸"
            title="Your listing sold!"
            subtitle={`${nftName} found a new home`}
            backgroundColor="#10b981"
          />

          {/* Sale amount card */}
          <Section style={amountCardSection}>
            <Section style={amountCard}>
              <Row>
                <Column align="center">
                  <Text style={amountLabel}>Sale price</Text>
                  <Text style={amountValue}>
                    {salePrice} {currency}
                  </Text>
                  {typeof salePriceUsd === 'number' && (
                    <Text style={amountSubtext}>
                      ≈ ${salePriceUsd.toFixed(2)} USD
                    </Text>
                  )}
                </Column>
              </Row>
            </Section>
          </Section>

          {/* NFT info */}
          <Section style={nftSection}>
            <Row>
              <Column style={nftImageColumn}>
                {nftImage ? (
                  <Img src={nftImage} alt={nftName} style={nftImageStyle} />
                ) : (
                  <Section style={nftPlaceholder}>
                    <Row>
                      <Column align="center">
                        <Text style={nftPlaceholderText}>🖼️</Text>
                      </Column>
                    </Row>
                  </Section>
                )}
              </Column>
              <Column style={nftInfoColumn}>
                <Text style={nftCollection}>{collectionName}</Text>
                <Text style={nftTitle}>{nftName}</Text>
                {formattedTimestamp && (
                  <Text style={nftMeta}>{formattedTimestamp}</Text>
                )}
              </Column>
            </Row>
          </Section>

          {/* Transaction details */}
          <Section style={contentSection}>
            <Section style={detailsCard}>
              <Text style={detailsTitle}>Transaction details</Text>
              <Hr style={detailDivider} />
              <Row style={detailRow}>
                <Column>
                  <Text style={detailLabel}>Sale price</Text>
                </Column>
                <Column align="right">
                  <Text style={detailValue}>
                    {salePrice} {currency}
                  </Text>
                </Column>
              </Row>

              {typeof marketplaceFee === 'number' && (
                <>
                  <Hr style={detailDivider} />
                  <Row style={detailRow}>
                    <Column>
                      <Text style={detailLabel}>Marketplace fee</Text>
                    </Column>
                    <Column align="right">
                      <Text style={detailValue}>
                        -{marketplaceFee.toFixed(4)} {currency}
                      </Text>
                    </Column>
                  </Row>
                </>
              )}

              {typeof royaltyFee === 'number' && (
                <>
                  <Hr style={detailDivider} />
                  <Row style={detailRow}>
                    <Column>
                      <Text style={detailLabel}>Creator royalty</Text>
                    </Column>
                    <Column align="right">
                      <Text style={detailValue}>
                        -{royaltyFee.toFixed(4)} {currency}
                      </Text>
                    </Column>
                  </Row>
                </>
              )}

              {typeof netProceeds === 'number' && (
                <>
                  <Hr style={detailDivider} />
                  <Row style={detailRow}>
                    <Column>
                      <Text style={detailLabel}>Net proceeds</Text>
                    </Column>
                    <Column align="right">
                      <Text style={earningsValue}>
                        {netProceeds.toFixed(4)} {currency}
                      </Text>
                    </Column>
                  </Row>
                </>
              )}

              {buyerAddress && (
                <>
                  <Hr style={detailDivider} />
                  <Row style={detailRow}>
                    <Column>
                      <Text style={detailLabel}>Buyer</Text>
                    </Column>
                    <Column align="right">
                      <Text style={hashValue}>
                        {formatAddress(buyerAddress)}
                      </Text>
                    </Column>
                  </Row>
                </>
              )}

              {transactionHash && (
                <>
                  <Hr style={detailDivider} />
                  <Row style={detailRow}>
                    <Column>
                      <Text style={detailLabel}>Transaction</Text>
                    </Column>
                    <Column align="right">
                      <Text style={hashValue}>{formatTx(transactionHash)}</Text>
                    </Column>
                  </Row>
                </>
              )}
            </Section>

            {(marketplaceUrl || explorerUrl) && (
              <Section style={ctaSection}>
                {marketplaceUrl && (
                  <EmailButton href={marketplaceUrl}>
                    View your listings
                  </EmailButton>
                )}
                {explorerUrl && (
                  <Text style={explorerLink}>
                    Verify on chain: {explorerUrl}
                  </Text>
                )}
              </Section>
            )}
          </Section>

          {/* Tip footer */}
          <Section style={tipsSection}>
            <Heading style={tipsTitle}>What's next?</Heading>
            <Text style={tipText}>
              Funds are released on settlement. Re-list any remaining items from
              your dashboard whenever you are ready.
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  )
}

export default ListingSoldEmail

const main = {
  backgroundColor: '#0f0f0f',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#1a1a1a',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '16px',
  overflow: 'hidden',
  marginTop: '40px',
  marginBottom: '40px',
  border: '1px solid #2a2a2a',
}

const amountCardSection = {
  padding: '24px 40px 0',
}

const amountCard = {
  backgroundColor: '#065f46',
  borderRadius: '16px',
  padding: '32px 24px',
  textAlign: 'center' as const,
  border: '1px solid #10b981',
}

const amountLabel = {
  color: 'rgba(255, 255, 255, 0.75)',
  fontSize: '13px',
  fontWeight: '500',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

const amountValue = {
  color: '#ffffff',
  fontSize: '42px',
  fontWeight: '700',
  margin: '0 0 8px',
  letterSpacing: '-1px',
}

const amountSubtext = {
  color: 'rgba(255, 255, 255, 0.75)',
  fontSize: '14px',
  margin: '0',
}

const nftSection = {
  padding: '28px 40px',
}

const nftImageColumn = {
  width: '100px',
  verticalAlign: 'top',
}

const nftImageStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '12px',
  objectFit: 'cover' as const,
  border: '2px solid #333',
}

const nftPlaceholder = {
  width: '80px',
  height: '80px',
  backgroundColor: '#252525',
  borderRadius: '12px',
  border: '2px solid #333',
  textAlign: 'center' as const,
  padding: '20px 0',
}

const nftPlaceholderText = {
  fontSize: '28px',
  margin: '0',
}

const nftInfoColumn = {
  verticalAlign: 'top',
  paddingLeft: '8px',
}

const nftCollection = {
  color: '#10b981',
  fontSize: '11px',
  fontWeight: '500',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const nftTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const nftMeta = {
  color: '#71717a',
  fontSize: '12px',
  margin: '0',
}

const contentSection = {
  padding: '0 40px 32px',
}

const detailsCard = {
  backgroundColor: '#252525',
  borderRadius: '12px',
  padding: '20px 24px',
  marginBottom: '28px',
  border: '1px solid #333',
}

const detailsTitle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const detailRow = {
  padding: '8px 0',
}

const detailLabel = {
  color: '#71717a',
  fontSize: '14px',
  margin: '0',
}

const detailValue = {
  color: '#a1a1aa',
  fontSize: '14px',
  margin: '0',
}

const earningsValue = {
  color: '#10b981',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0',
}

const hashValue = {
  color: '#a1a1aa',
  fontSize: '13px',
  fontFamily: 'monospace',
  margin: '0',
}

const detailDivider = {
  borderColor: '#333',
  margin: '12px 0',
}

const ctaSection = {
  textAlign: 'center' as const,
  marginTop: '8px',
}

const explorerLink = {
  color: '#71717a',
  fontSize: '12px',
  margin: '12px 0 0',
  wordBreak: 'break-all' as const,
}

const tipsSection = {
  padding: '0 40px 32px',
}

const tipsTitle = {
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const tipText = {
  color: '#a1a1aa',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}
