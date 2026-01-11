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

interface AuctionOutbidEmailProps {
  nftName: string
  nftImage?: string
  yourBid: number
  newBid: number
  auctionEndTime: string
  auctionUrl?: string
  collectionName?: string
}

export const AuctionOutbidEmail = ({
  nftName,
  nftImage,
  yourBid,
  newBid,
  auctionEndTime,
  auctionUrl,
  collectionName = 'Collection',
}: AuctionOutbidEmailProps) => {
  const endDate = new Date(auctionEndTime)
  const bidDifference = newBid - yourBid

  return (
    <Html>
      <Head />
      <Preview>
        You&apos;ve been outbid on {nftName} - Place a new bid now!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          <HeroSection
            emoji="⚠️"
            title="You've Been Outbid!"
            subtitle="Someone placed a higher bid on your watched item"
            backgroundColor="#f59e0b"
          />

          {/* NFT Preview */}
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

          {/* Bid Comparison */}
          <Section style={contentSection}>
            <Section style={bidComparisonCard}>
              <Row>
                <Column style={bidColumn}>
                  <Text style={bidLabel}>Your Bid</Text>
                  <Text style={yourBidValue}>{yourBid} ETH</Text>
                </Column>
                <Column style={arrowColumn}>
                  <Text style={arrowIcon}>→</Text>
                </Column>
                <Column style={bidColumn}>
                  <Text style={bidLabel}>New High Bid</Text>
                  <Text style={newBidValue}>{newBid} ETH</Text>
                </Column>
              </Row>
              <Hr style={bidDivider} />
              <Row>
                <Column>
                  <Text style={differenceLabel}>Difference</Text>
                </Column>
                <Column align="right">
                  <Text style={differenceValue}>
                    +{bidDifference.toFixed(4)} ETH
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Urgency Timer */}
            <Section style={timerCard}>
              <Row>
                <Column style={timerIconColumn}>
                  <Text style={timerIcon}>⏰</Text>
                </Column>
                <Column>
                  <Text style={timerLabel}>Auction Ends</Text>
                  <Text style={timerValue}>
                    {endDate.toLocaleDateString()} at{' '}
                    {endDate.toLocaleTimeString()}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* CTA */}
            {auctionUrl && (
              <Section style={ctaSection}>
                <EmailButton href={auctionUrl}>Place Higher Bid</EmailButton>
                <Text style={ctaSubtext}>Don't miss out on this NFT!</Text>
              </Section>
            )}
          </Section>

          {/* Tips Section */}
          <Section style={tipsSection}>
            <Heading style={tipsTitle}>💡 Bidding Tips</Heading>
            <Row style={tipRow}>
              <Column style={tipBulletColumn}>
                <Text style={tipBullet}>•</Text>
              </Column>
              <Column>
                <Text style={tipText}>
                  Set a maximum bid to auto-outbid up to your limit
                </Text>
              </Column>
            </Row>
            <Row style={tipRow}>
              <Column style={tipBulletColumn}>
                <Text style={tipBullet}>•</Text>
              </Column>
              <Column>
                <Text style={tipText}>
                  Consider bidding in the final minutes for best results
                </Text>
              </Column>
            </Row>
            <Row style={tipRow}>
              <Column style={tipBulletColumn}>
                <Text style={tipBullet}>•</Text>
              </Column>
              <Column>
                <Text style={tipText}>
                  Make sure you have enough ETH + gas fees ready
                </Text>
              </Column>
            </Row>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  )
}

export default AuctionOutbidEmail

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

const nftSection = {
  padding: '32px 40px 0',
  textAlign: 'center' as const,
}

const nftImageStyle = {
  width: '100%',
  maxWidth: '200px',
  height: 'auto',
  borderRadius: '12px',
  margin: '0 auto 16px',
  border: '2px solid #333',
}

const nftPlaceholder = {
  width: '200px',
  height: '200px',
  backgroundColor: '#252525',
  borderRadius: '12px',
  margin: '0 auto 16px',
  border: '2px solid #333',
  textAlign: 'center' as const,
  padding: '70px 0',
}

const nftPlaceholderText = {
  fontSize: '48px',
  margin: '0',
}

const nftCollection = {
  color: '#f59e0b',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const nftTitle = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
}

const contentSection = {
  padding: '28px 40px',
}

const bidComparisonCard = {
  backgroundColor: '#252525',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '16px',
  border: '1px solid #333',
}

const bidColumn = {
  width: '45%',
  textAlign: 'center' as const,
}

const arrowColumn = {
  width: '10%',
  textAlign: 'center' as const,
}

const bidLabel = {
  color: '#71717a',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const yourBidValue = {
  color: '#71717a',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
  textDecoration: 'line-through',
}

const newBidValue = {
  color: '#f59e0b',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
}

const arrowIcon = {
  color: '#52525b',
  fontSize: '20px',
  margin: '24px 0 0',
}

const bidDivider = {
  borderColor: '#333',
  margin: '20px 0 16px',
}

const differenceLabel = {
  color: '#71717a',
  fontSize: '13px',
  margin: '0',
}

const differenceValue = {
  color: '#ef4444',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0',
}

const timerCard = {
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  borderRadius: '12px',
  padding: '16px 20px',
  marginBottom: '28px',
  border: '1px solid rgba(239, 68, 68, 0.2)',
}

const timerIconColumn = {
  width: '48px',
}

const timerIcon = {
  fontSize: '24px',
  margin: '0',
}

const timerLabel = {
  color: '#fca5a5',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 2px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const timerValue = {
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
}

const ctaSubtext = {
  color: '#71717a',
  fontSize: '13px',
  margin: '16px 0 0',
}

const tipsSection = {
  backgroundColor: '#252525',
  margin: '0 24px 24px',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #333',
}

const tipsTitle = {
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const tipRow = {
  marginBottom: '10px',
}

const tipBulletColumn = {
  width: '20px',
}

const tipBullet = {
  color: '#f59e0b',
  fontSize: '14px',
  margin: '0',
}

const tipText = {
  color: '#a1a1aa',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
}
