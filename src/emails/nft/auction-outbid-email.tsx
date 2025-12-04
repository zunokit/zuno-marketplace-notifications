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
      <Preview>You&apos;ve been outbid on {nftName} - Place a new bid now!</Preview>
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

          {/* Alert Hero */}
          <Section style={heroSection}>
            <div style={heroGradient}>
              <Text style={heroEmoji}>⚠️</Text>
              <Heading style={heroTitle}>You&apos;ve Been Outbid!</Heading>
              <Text style={heroSubtitle}>
                Someone placed a higher bid on your watched item
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
                  <Text style={differenceValue}>+{bidDifference.toFixed(4)} ETH</Text>
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
                    {endDate.toLocaleDateString()} at {endDate.toLocaleTimeString()}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* CTA */}
            {auctionUrl && (
              <Section style={ctaSection}>
                <Button style={primaryButton} href={auctionUrl}>
                  Place Higher Bid
                </Button>
                <Text style={ctaSubtext}>
                  Don&apos;t miss out on this NFT!
                </Text>
              </Section>
            )}
          </Section>

          {/* Tips Section */}
          <Section style={tipsSection}>
            <Heading style={tipsTitle}>💡 Bidding Tips</Heading>
            <div style={tipItem}>
              <Text style={tipBullet}>•</Text>
              <Text style={tipText}>Set a maximum bid to auto-outbid up to your limit</Text>
            </div>
            <div style={tipItem}>
              <Text style={tipBullet}>•</Text>
              <Text style={tipText}>Consider bidding in the final minutes for best results</Text>
            </div>
            <div style={tipItem}>
              <Text style={tipBullet}>•</Text>
              <Text style={tipText}>Make sure you have enough ETH + gas fees ready</Text>
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
                <Text style={footerNote}>
                  You&apos;re receiving this because you&apos;re bidding on this NFT.
                </Text>
                <Text style={footerLinks}>
                  <Link href="https://zuno.market/settings/notifications" style={footerLink}>Manage Notifications</Link>
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

export default AuctionOutbidEmail

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
  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
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
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px',
  letterSpacing: '-0.5px',
}

const heroSubtitle = {
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: '15px',
  margin: '0',
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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid #333',
}

const nftPlaceholderText = {
  fontSize: '48px',
  margin: '0',
}

const nftInfo = {
  textAlign: 'center' as const,
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

const primaryButton = {
  backgroundColor: '#f59e0b',
  borderRadius: '10px',
  color: '#000000',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 48px',
  border: 'none',
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

const tipItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '10px',
}

const tipBullet = {
  color: '#f59e0b',
  fontSize: '14px',
  margin: '0 10px 0 0',
}

const tipText = {
  color: '#a1a1aa',
  fontSize: '13px',
  lineHeight: '20px',
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

const footerNote = {
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
