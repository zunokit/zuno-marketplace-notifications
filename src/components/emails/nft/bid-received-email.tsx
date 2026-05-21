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

export interface BidReceivedEmailProps {
  /** The seller's display name or wallet shortform. */
  recipientName?: string
  /** NFT being bid on. */
  nftName: string
  nftImage?: string
  collectionName?: string
  /** Listing price (the seller's asking price). */
  listingPrice: number
  /** Incoming bid amount. */
  bidAmount: number
  /** ISO timestamp of when the bid expires. */
  bidExpiresAt?: string
  /** Bidder identifier (truncated wallet or username). */
  bidderName: string
  /** Bidder address — used to compute the verified badge inline. */
  bidderAddress?: string
  /** Deep link to the listing in the marketplace. */
  listingUrl?: string
  /** Token symbol; defaults to ETH. */
  currencySymbol?: string
}

const formatNumber = (n: number, digits: number = 4): string =>
  Number.isFinite(n) ? n.toFixed(digits) : '0'

export const BidReceivedEmail = ({
  recipientName = 'collector',
  nftName,
  nftImage,
  collectionName = 'Collection',
  listingPrice,
  bidAmount,
  bidExpiresAt,
  bidderName,
  bidderAddress,
  listingUrl,
  currencySymbol = 'ETH',
}: BidReceivedEmailProps) => {
  const delta = bidAmount - listingPrice
  const deltaSign = delta >= 0 ? '+' : '−'
  const aboveOrBelow = delta >= 0 ? 'above' : 'below'
  const expiry = bidExpiresAt ? new Date(bidExpiresAt) : null
  const truncatedAddress =
    bidderAddress && bidderAddress.length > 10
      ? `${bidderAddress.slice(0, 6)}…${bidderAddress.slice(-4)}`
      : bidderAddress

  return (
    <Html>
      <Head />
      <Preview>
        New bid on {nftName}: {formatNumber(bidAmount)} {currencySymbol}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          <HeroSection
            emoji="💸"
            title="You received a new bid!"
            subtitle={`Someone wants ${nftName}`}
            backgroundColor="#10b981"
          />

          <Section style={nftSection}>
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
            <Row>
              <Column align="center">
                <Text style={nftCollection}>{collectionName}</Text>
                <Heading style={nftTitle}>{nftName}</Heading>
              </Column>
            </Row>
          </Section>

          <Section style={contentSection}>
            <Section style={bidCard}>
              <Row>
                <Column style={bidColumn}>
                  <Text style={bidLabel}>Your asking price</Text>
                  <Text style={listingValue}>
                    {formatNumber(listingPrice)} {currencySymbol}
                  </Text>
                </Column>
                <Column style={bidColumn}>
                  <Text style={bidLabel}>Incoming bid</Text>
                  <Text style={bidValue}>
                    {formatNumber(bidAmount)} {currencySymbol}
                  </Text>
                </Column>
              </Row>

              <Hr style={bidDivider} />

              <Row>
                <Column>
                  <Text style={deltaLabel}>{`${deltaSign} ${formatNumber(Math.abs(delta))} ${currencySymbol}`}</Text>
                  <Text style={deltaContext}>{`(${aboveOrBelow} your asking price)`}</Text>
                </Column>
              </Row>
            </Section>

            <Section style={bidderCard}>
              <Row>
                <Column>
                  <Text style={bidderLabel}>Bidder</Text>
                  <Text style={bidderValue}>
                    {bidderName}
                    {truncatedAddress && (
                      <Text style={addressMonospace}>{` (${truncatedAddress})`}</Text>
                    )}
                  </Text>
                </Column>
              </Row>
            </Section>

            {expiry && (
              <Section style={timerCard}>
                <Row>
                  <Column style={timerIconColumn}>
                    <Text style={timerIcon}>⏰</Text>
                  </Column>
                  <Column>
                    <Text style={timerLabel}>Bid expires</Text>
                    <Text style={timerValue}>
                      {expiry.toLocaleDateString()} at {expiry.toLocaleTimeString()}
                    </Text>
                  </Column>
                </Row>
              </Section>
            )}

            {listingUrl && (
              <Section style={ctaSection}>
                <EmailButton href={listingUrl}>Review bid</EmailButton>
                <Text style={ctaSubtext}>
                  Hi {recipientName} — accept, counter, or reject the offer.
                </Text>
              </Section>
            )}
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  )
}

export default BidReceivedEmail

// ----------------------------------------------------------------------
// styles
// ----------------------------------------------------------------------

const main = {
  backgroundColor: '#0a0a0a',
  margin: 0,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#1a1a1a',
  margin: '0 auto',
  maxWidth: '600px',
  borderRadius: '12px',
  overflow: 'hidden' as const,
}

const nftSection = {
  padding: '24px 24px 0',
  textAlign: 'center' as const,
}

const nftImageStyle = {
  borderRadius: '12px',
  maxWidth: '240px',
  margin: '0 auto 16px',
}

const nftPlaceholder = {
  backgroundColor: '#252525',
  borderRadius: '12px',
  padding: '48px',
  margin: '0 auto 16px',
  maxWidth: '240px',
}

const nftPlaceholderText = { fontSize: '48px', margin: 0 }

const nftCollection = {
  color: '#a1a1aa',
  fontSize: '13px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  margin: 0,
}

const nftTitle = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: 700,
  margin: '4px 0 0',
}

const contentSection = { padding: '24px' }

const bidCard = {
  backgroundColor: '#252525',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid #333',
}

const bidColumn = { width: '50%' as const }

const bidLabel = {
  color: '#a1a1aa',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  margin: '0 0 4px',
}

const listingValue = {
  color: '#e5e7eb',
  fontSize: '20px',
  fontWeight: 600,
  margin: 0,
}

const bidValue = {
  color: '#10b981',
  fontSize: '20px',
  fontWeight: 700,
  margin: 0,
}

const bidDivider = {
  borderColor: '#333',
  margin: '16px 0',
}

const deltaLabel = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 700,
  margin: 0,
}

const deltaContext = {
  color: '#a1a1aa',
  fontSize: '13px',
  margin: 0,
}

const bidderCard = {
  backgroundColor: '#1f1f1f',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '16px',
  border: '1px solid #2a2a2a',
}

const bidderLabel = {
  color: '#a1a1aa',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  margin: '0 0 4px',
}

const bidderValue = {
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 500,
  margin: 0,
}

const addressMonospace = {
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  color: '#a1a1aa',
  fontWeight: 400,
}

const timerCard = {
  backgroundColor: '#252525',
  borderRadius: '8px',
  padding: '12px 16px',
  marginTop: '16px',
}

const timerIconColumn = { width: '40px' }

const timerIcon = { fontSize: '20px', margin: 0 }

const timerLabel = {
  color: '#a1a1aa',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  margin: 0,
}

const timerValue = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 600,
  margin: 0,
}

const ctaSection = {
  textAlign: 'center' as const,
  marginTop: '24px',
}

const ctaSubtext = {
  color: '#a1a1aa',
  fontSize: '13px',
  margin: '12px 0 0',
}
