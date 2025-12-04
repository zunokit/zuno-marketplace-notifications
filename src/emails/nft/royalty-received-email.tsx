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

interface RoyaltyReceivedEmailProps {
  nftName: string
  nftImage?: string
  royaltyAmount: number
  salePrice: number
  royaltyPercentage: number
  buyerAddress?: string
  transactionHash?: string
  dashboardUrl?: string
  collectionName?: string
}

export const RoyaltyReceivedEmail = ({
  nftName,
  nftImage,
  royaltyAmount,
  salePrice,
  royaltyPercentage,
  buyerAddress,
  transactionHash,
  dashboardUrl,
  collectionName = 'Collection',
}: RoyaltyReceivedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You received {royaltyAmount.toFixed(4)} ETH in royalties from {nftName}!</Preview>
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

          {/* Success Hero */}
          <Section style={heroSection}>
            <div style={heroGradient}>
              <Text style={heroEmoji}>💰</Text>
              <Heading style={heroTitle}>Royalty Received!</Heading>
              <Text style={heroSubtitle}>
                Your creation just sold on the secondary market
              </Text>
            </div>
          </Section>

          {/* Royalty Amount Card */}
          <Section style={amountCardSection}>
            <div style={amountCard}>
              <Text style={amountLabel}>You Earned</Text>
              <Text style={amountValue}>{royaltyAmount.toFixed(4)} ETH</Text>
              <Text style={amountSubtext}>
                {royaltyPercentage}% royalty from a {salePrice} ETH sale
              </Text>
            </div>
          </Section>

          {/* NFT Info */}
          <Section style={nftSection}>
            <Row>
              <Column style={nftImageColumn}>
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
              </Column>
              <Column style={nftInfoColumn}>
                <Text style={nftCollection}>{collectionName}</Text>
                <Text style={nftTitle}>{nftName}</Text>
                <Text style={soldLabel}>Sold for</Text>
                <Text style={soldPrice}>{salePrice} ETH</Text>
              </Column>
            </Row>
          </Section>

          {/* Transaction Details */}
          <Section style={contentSection}>
            <Section style={detailsCard}>
              <Text style={detailsTitle}>Transaction Details</Text>
              <Hr style={detailDivider} />
              <Row style={detailRow}>
                <Column>
                  <Text style={detailLabel}>Sale Price</Text>
                </Column>
                <Column align="right">
                  <Text style={detailValue}>{salePrice} ETH</Text>
                </Column>
              </Row>
              <Hr style={detailDivider} />
              <Row style={detailRow}>
                <Column>
                  <Text style={detailLabel}>Royalty Rate</Text>
                </Column>
                <Column align="right">
                  <Text style={detailValue}>{royaltyPercentage}%</Text>
                </Column>
              </Row>
              <Hr style={detailDivider} />
              <Row style={detailRow}>
                <Column>
                  <Text style={detailLabel}>Your Earnings</Text>
                </Column>
                <Column align="right">
                  <Text style={earningsValue}>{royaltyAmount.toFixed(4)} ETH</Text>
                </Column>
              </Row>
              {buyerAddress && (
                <>
                  <Hr style={detailDivider} />
                  <Row style={detailRow}>
                    <Column>
                      <Text style={detailLabel}>Buyer</Text>
                    </Column>
                    <Column align="right">
                      <Text style={hashValue}>
                        {buyerAddress.slice(0, 6)}...{buyerAddress.slice(-4)}
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
                      <Text style={hashValue}>
                        {transactionHash.slice(0, 6)}...{transactionHash.slice(-4)}
                      </Text>
                    </Column>
                  </Row>
                </>
              )}
            </Section>

            {/* CTA */}
            {dashboardUrl && (
              <Section style={ctaSection}>
                <Button style={primaryButton} href={dashboardUrl}>
                  View Earnings Dashboard
                </Button>
              </Section>
            )}
          </Section>

          {/* Creator Tips */}
          <Section style={tipsSection}>
            <Heading style={tipsTitle}>📊 Creator Insights</Heading>
            <Text style={tipsIntro}>
              Your art is being appreciated and resold - this is a great sign of collector interest!
            </Text>
            <div style={tipItem}>
              <Text style={tipBullet}>•</Text>
              <Text style={tipText}>Track all your royalty earnings in the creator dashboard</Text>
            </div>
            <div style={tipItem}>
              <Text style={tipBullet}>•</Text>
              <Text style={tipText}>Analyze which pieces perform best on the secondary market</Text>
            </div>
            <div style={tipItem}>
              <Text style={tipBullet}>•</Text>
              <Text style={tipText}>Use these insights to inform future collections</Text>
            </div>
          </Section>

          {/* Celebration Note */}
          <Section style={celebrationSection}>
            <Text style={celebrationText}>
              🎨 Congratulations! Your creativity is generating ongoing income.
            </Text>
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
                  You&apos;re receiving this because you&apos;re the creator of this NFT.
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

export default RoyaltyReceivedEmail

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

const amountCardSection = {
  padding: '24px 40px 0',
}

const amountCard = {
  background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid #333',
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
  color: '#f59e0b',
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
  margin: '0 0 12px',
}

const soldLabel = {
  color: '#71717a',
  fontSize: '11px',
  fontWeight: '500',
  margin: '0 0 2px',
  textTransform: 'uppercase' as const,
}

const soldPrice = {
  color: '#10b981',
  fontSize: '18px',
  fontWeight: '700',
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

const tipsSection = {
  backgroundColor: '#252525',
  margin: '0 24px',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #333',
}

const tipsTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const tipsIntro = {
  color: '#a1a1aa',
  fontSize: '14px',
  lineHeight: '22px',
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

const celebrationSection = {
  backgroundColor: 'rgba(139, 92, 246, 0.1)',
  margin: '24px',
  borderRadius: '12px',
  padding: '16px 24px',
  textAlign: 'center' as const,
  border: '1px solid rgba(139, 92, 246, 0.2)',
}

const celebrationText = {
  color: '#c4b5fd',
  fontSize: '14px',
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
