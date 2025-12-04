import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

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
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column align="center">
                <Img
                  src="https://zuno.market/logo.png"
                  width="140"
                  height="40"
                  alt="Zuno Marketplace"
                  style={logo}
                />
              </Column>
            </Row>
          </Section>

          {/* Hero Section */}
          <Section style={heroSection}>
            <div style={heroGradient}>
              <Text style={heroEmoji}>🏆</Text>
              <Heading style={heroTitle}>You Won!</Heading>
              <Text style={heroSubtitle}>
                Congratulations on your winning bid
              </Text>
            </div>
          </Section>

          {/* NFT Preview */}
          <Section style={nftSection}>
            {nftImage ? (
              <Img
                src={nftImage}
                alt={nftName}
                style={nftImageStyle}
              />
            ) : (
              <div style={nftPlaceholder}>
                <Text style={nftPlaceholderText}>🖼️</Text>
              </div>
            )}
            <div style={nftInfo}>
              <Text style={nftCollection}>{collectionName}</Text>
              <Heading style={nftTitle}>{nftName}</Heading>
            </div>
          </Section>

          {/* Content */}
          <Section style={contentSection}>
            <Text style={greeting}>Hi {userName},</Text>
            <Text style={paragraph}>
              Amazing news! Your bid has won the auction. The NFT is now being transferred to your wallet.
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
                  <div style={statusBadge}>
                    <Text style={statusText}>Transferring</Text>
                  </div>
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
                        {endDate.toLocaleDateString()} at {endDate.toLocaleTimeString()}
                      </Text>
                    </Column>
                  </Row>
                </>
              )}
            </Section>

            {/* CTA */}
            <Section style={ctaSection}>
              <Button style={primaryButton} href="https://zuno.market/my-nfts">
                View Your NFT
              </Button>
              <Button style={secondaryButton} href="https://zuno.market/explore">
                Explore More
              </Button>
            </Section>
          </Section>

          {/* Next Steps */}
          <Section style={stepsSection}>
            <Heading style={stepsTitle}>What happens next?</Heading>
            <div style={stepItem}>
              <Text style={stepNumber}>1</Text>
              <div style={stepContent}>
                <Text style={stepLabel}>NFT Transfer</Text>
                <Text style={stepDesc}>Your NFT will appear in your wallet within a few minutes</Text>
              </div>
            </div>
            <div style={stepItem}>
              <Text style={stepNumber}>2</Text>
              <div style={stepContent}>
                <Text style={stepLabel}>View in Collection</Text>
                <Text style={stepDesc}>Access your NFT from your profile gallery</Text>
              </div>
            </div>
            <div style={stepItem}>
              <Text style={stepNumber}>3</Text>
              <div style={stepContent}>
                <Text style={stepLabel}>Share & Enjoy</Text>
                <Text style={stepDesc}>Show off your new digital collectible!</Text>
              </div>
            </div>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Row>
              <Column align="center">
                <Text style={footerBrand}>Zuno Marketplace</Text>
                <Row style={socialRow}>
                  <Column align="center">
                    <Link href="https://twitter.com/zunomarket" style={socialLink}>Twitter</Link>
                    <Text style={socialDivider}>•</Text>
                    <Link href="https://discord.gg/zuno" style={socialLink}>Discord</Link>
                    <Text style={socialDivider}>•</Text>
                    <Link href="https://instagram.com/zunomarket" style={socialLink}>Instagram</Link>
                  </Column>
                </Row>
                <Text style={footerText}>
                  © 2025 Zuno Marketplace. All rights reserved.
                </Text>
                <Text style={footerLinks}>
                  <Link href="https://zuno.market/privacy" style={footerLink}>Privacy Policy</Link>
                  <Text style={footerDot}>•</Text>
                  <Link href="https://zuno.market/terms" style={footerLink}>Terms of Service</Link>
                  <Text style={footerDot}>•</Text>
                  <Link href="https://zuno.market/settings/notifications" style={footerLink}>Unsubscribe</Link>
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default AuctionWonEmail

const main = {
  backgroundColor: '#0f0f0f',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
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

const header = {
  padding: '32px 40px 24px',
  backgroundColor: '#1a1a1a',
}

const logo = {
  margin: '0 auto',
}

const heroSection = {
  padding: '0 24px',
}

const heroGradient = {
  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
  borderRadius: '16px',
  padding: '40px 32px',
  textAlign: 'center' as const,
}

const heroEmoji = {
  fontSize: '48px',
  margin: '0 0 12px',
}

const heroTitle = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 8px',
  letterSpacing: '-0.5px',
}

const heroSubtitle = {
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: '16px',
  margin: '0',
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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid #333',
}

const nftPlaceholderText = {
  fontSize: '64px',
  margin: '0',
}

const nftInfo = {
  textAlign: 'center' as const,
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
  display: 'inline-block',
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

const primaryButton = {
  backgroundColor: '#10b981',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  border: 'none',
  marginRight: '12px',
}

const secondaryButton = {
  backgroundColor: 'transparent',
  borderRadius: '10px',
  color: '#a1a1aa',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  border: '1px solid #404040',
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

const stepItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '16px',
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
  margin: '0 12px 0 0',
  flexShrink: 0,
}

const stepContent = {
  flex: 1,
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

const divider = {
  borderColor: '#2a2a2a',
  margin: '0',
}

const footer = {
  padding: '32px 40px',
  backgroundColor: '#141414',
}

const footerBrand = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const socialRow = {
  marginBottom: '16px',
}

const socialLink = {
  color: '#a1a1aa',
  fontSize: '13px',
  textDecoration: 'none',
}

const socialDivider = {
  color: '#404040',
  fontSize: '13px',
  margin: '0 12px',
  display: 'inline',
}

const footerText = {
  color: '#52525b',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0 0 12px',
  textAlign: 'center' as const,
}

const footerLinks = {
  margin: '0',
  textAlign: 'center' as const,
}

const footerLink = {
  color: '#71717a',
  fontSize: '12px',
  textDecoration: 'none',
}

const footerDot = {
  color: '#404040',
  fontSize: '12px',
  margin: '0 8px',
  display: 'inline',
}
