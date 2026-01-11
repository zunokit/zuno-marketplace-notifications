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
import { EmailButton, EmailFooter, EmailHeader, HeroSection } from './common'

interface AuctionWonEmailProps {
  userName?: string
  nftName?: string
  nftImage?: string
  bidAmount?: string
  collectionName?: string
  auctionEndTime?: string
}

export const AuctionWonEmail = ({
  userName = 'User',
  nftName = 'Amazing NFT',
  nftImage,
  bidAmount = '0.5 ETH',
  collectionName = 'Genesis Collection',
  auctionEndTime,
}: AuctionWonEmailProps) => {
  const endDate = auctionEndTime ? new Date(auctionEndTime) : null

  return (
    <Html>
      <Head />
      <Preview>Congratulations! You won the auction for {nftName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          <HeroSection
            emoji="🏆"
            title="You Won!"
            subtitle="Congratulations on your winning bid"
            backgroundColor="#10b981"
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

          {/* Content */}
          <Section style={contentSection}>
            <Text style={greeting}>Hi {userName},</Text>
            <Text style={paragraph}>
              Amazing news! Your bid has won the auction. The NFT is now being
              transferred to your wallet.
            </Text>

            {/* Winning Details */}
            <Section style={detailsCard}>
              <Row style={detailRow}>
                <Column>
                  <Text style={detailLabel}>Winning Bid</Text>
                </Column>
                <Column align="right">
                  <Text style={detailValue}>{bidAmount}</Text>
                </Column>
              </Row>
              <Hr style={detailDivider} />
              <Row style={detailRow}>
                <Column>
                  <Text style={detailLabel}>Status</Text>
                </Column>
                <Column align="right">
                  <Section style={statusBadge}>
                    <Text style={statusText}>Transferring</Text>
                  </Section>
                </Column>
              </Row>
              {endDate && (
                <>
                  <Hr style={detailDivider} />
                  <Row style={detailRow}>
                    <Column>
                      <Text style={detailLabel}>Auction Ended</Text>
                    </Column>
                    <Column align="right">
                      <Text style={detailValueSmall}>
                        {endDate.toLocaleDateString()} at{' '}
                        {endDate.toLocaleTimeString()}
                      </Text>
                    </Column>
                  </Row>
                </>
              )}
            </Section>

            {/* CTA */}
            <Section style={ctaSection}>
              <EmailButton href="https://zuno.market/my-nfts">
                View Your NFT
              </EmailButton>
              <EmailButton
                href="https://zuno.market/explore"
                variant="secondary"
                style={{ marginLeft: '12px' }}
              >
                Explore More
              </EmailButton>
            </Section>
          </Section>

          {/* Next Steps */}
          <Section style={stepsSection}>
            <Heading style={stepsTitle}>What happens next?</Heading>
            <Row style={stepRow}>
              <Column style={stepNumberColumn}>
                <Text style={stepNumber}>1</Text>
              </Column>
              <Column>
                <Text style={stepLabel}>NFT Transfer</Text>
                <Text style={stepDesc}>
                  Your NFT will appear in your wallet within a few minutes
                </Text>
              </Column>
            </Row>
            <Row style={stepRow}>
              <Column style={stepNumberColumn}>
                <Text style={stepNumber}>2</Text>
              </Column>
              <Column>
                <Text style={stepLabel}>View in Collection</Text>
                <Text style={stepDesc}>
                  Access your NFT from your profile gallery
                </Text>
              </Column>
            </Row>
            <Row style={stepRow}>
              <Column style={stepNumberColumn}>
                <Text style={stepNumber}>3</Text>
              </Column>
              <Column>
                <Text style={stepLabel}>Share & Enjoy</Text>
                <Text style={stepDesc}>
                  Show off your new digital collectible!
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

export default AuctionWonEmail

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
  maxWidth: '280px',
  height: 'auto',
  borderRadius: '16px',
  margin: '0 auto 20px',
  border: '2px solid #333',
}

const nftPlaceholder = {
  width: '280px',
  height: '280px',
  backgroundColor: '#252525',
  borderRadius: '16px',
  margin: '0 auto 20px',
  border: '2px solid #333',
  textAlign: 'center' as const,
  padding: '100px 0',
}

const nftPlaceholderText = {
  fontSize: '64px',
  margin: '0',
}

const nftCollection = {
  color: '#a78bfa',
  fontSize: '13px',
  fontWeight: '500',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const nftTitle = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0',
}

const contentSection = {
  padding: '32px 40px',
}

const greeting = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const paragraph = {
  color: '#a1a1aa',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0 0 28px',
}

const detailsCard = {
  backgroundColor: '#252525',
  borderRadius: '12px',
  padding: '20px 24px',
  marginBottom: '28px',
  border: '1px solid #333',
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
  color: '#10b981',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
}

const detailValueSmall = {
  color: '#a1a1aa',
  fontSize: '14px',
  margin: '0',
}

const detailDivider = {
  borderColor: '#333',
  margin: '12px 0',
}

const statusBadge = {
  backgroundColor: 'rgba(16, 185, 129, 0.15)',
  borderRadius: '20px',
  padding: '4px 12px',
}

const statusText = {
  color: '#10b981',
  fontSize: '13px',
  fontWeight: '600',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
}

const stepsSection = {
  backgroundColor: '#252525',
  margin: '0 24px 24px',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #333',
}

const stepsTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 20px',
}

const stepRow = {
  marginBottom: '16px',
}

const stepNumberColumn = {
  width: '36px',
}

const stepNumber = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '700',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  textAlign: 'center' as const,
  lineHeight: '24px',
  margin: '0',
}

const stepLabel = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 2px',
}

const stepDesc = {
  color: '#71717a',
  fontSize: '13px',
  margin: '0',
}
