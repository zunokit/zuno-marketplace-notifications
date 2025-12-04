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

interface MintSuccessEmailProps {
  nftName: string
  nftImage?: string
  nftId?: string
  transactionHash: string
  explorerUrl?: string
  marketplaceUrl?: string
  collectionName?: string
  mintPrice?: number
}

export const MintSuccessEmail = ({
  nftName,
  nftImage,
  nftId,
  transactionHash,
  explorerUrl,
  marketplaceUrl,
  collectionName = 'Collection',
  mintPrice,
}: MintSuccessEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Successfully minted {nftName}! Welcome to the collection.</Preview>
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
              <div style={successBadge}>
                <Text style={successBadgeText}>✓ MINTED</Text>
              </div>
              <Text style={heroEmoji}>🎉</Text>
              <Heading style={heroTitle}>Mint Successful!</Heading>
              <Text style={heroSubtitle}>
                Your new NFT is being transferred to your wallet
              </Text>
            </div>
          </Section>

          {/* NFT Preview */}
          <Section style={nftSection}>
            {nftImage ? (
              <div style={nftImageContainer}>
                <Img
                  src={nftImage}
                  alt={nftName}
                  style={nftImageStyle}
                />
                <div style={confettiLeft}>🎊</div>
                <div style={confettiRight}>🎊</div>
              </div>
            ) : (
              <div style={nftPlaceholder}>
                <Text style={nftPlaceholderText}>🖼️</Text>
              </div>
            )}
            <div style={nftInfo}>
              <Text style={nftCollection}>{collectionName}</Text>
              <Heading style={nftTitle}>{nftName}</Heading>
              {nftId && <Text style={nftTokenId}>Token #{nftId}</Text>}
            </div>
          </Section>

          {/* Transaction Details */}
          <Section style={contentSection}>
            <Section style={detailsCard}>
              <Text style={detailsTitle}>Transaction Details</Text>
              <Hr style={detailDivider} />
              <Row style={detailRow}>
                <Column>
                  <Text style={detailLabel}>Status</Text>
                </Column>
                <Column align="right">
                  <div style={statusBadge}>
                    <Text style={statusText}>Confirmed</Text>
                  </div>
                </Column>
              </Row>
              <Hr style={detailDivider} />
              <Row style={detailRow}>
                <Column>
                  <Text style={detailLabel}>Transaction</Text>
                </Column>
                <Column align="right">
                  <Text style={hashValue}>
                    {transactionHash.slice(0, 8)}...{transactionHash.slice(-6)}
                  </Text>
                </Column>
              </Row>
              {mintPrice !== undefined && (
                <>
                  <Hr style={detailDivider} />
                  <Row style={detailRow}>
                    <Column>
                      <Text style={detailLabel}>Mint Price</Text>
                    </Column>
                    <Column align="right">
                      <Text style={priceValue}>{mintPrice} ETH</Text>
                    </Column>
                  </Row>
                </>
              )}
            </Section>

            {/* CTA Buttons */}
            <Section style={ctaSection}>
              {explorerUrl && (
                <Button style={primaryButton} href={explorerUrl}>
                  View on Explorer
                </Button>
              )}
              {marketplaceUrl && (
                <Button style={secondaryButton} href={marketplaceUrl}>
                  View in Gallery
                </Button>
              )}
            </Section>
          </Section>

          {/* What's Next */}
          <Section style={stepsSection}>
            <Heading style={stepsTitle}>🚀 What&apos;s Next?</Heading>
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
                <Text style={stepLabel}>List or Hold</Text>
                <Text style={stepDesc}>Keep it in your collection or list it for sale</Text>
              </div>
            </div>
            <div style={stepItem}>
              <Text style={stepNumber}>4</Text>
              <div style={stepContent}>
                <Text style={stepLabel}>Share the News</Text>
                <Text style={stepDesc}>Show off your new NFT to the community!</Text>
              </div>
            </div>
          </Section>

          {/* Social Share Prompt */}
          <Section style={shareSection}>
            <Text style={shareText}>
              🐦 Share your mint on Twitter and tag us @zunomarket!
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
                  You&apos;re receiving this because you minted an NFT.
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

export default MintSuccessEmail

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

const successBadge = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  padding: '6px 16px',
  display: 'inline-block',
  marginBottom: '16px',
}

const successBadgeText = {
  color: '#ffffff',
  fontSize: '11px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '1px',
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

const nftImageContainer = {
  position: 'relative' as const,
  display: 'inline-block',
}

const nftImageStyle = {
  width: '100%',
  maxWidth: '280px',
  height: 'auto',
  borderRadius: '16px',
  margin: '0 auto 20px',
  border: '3px solid #10b981',
  boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)',
}

const confettiLeft = {
  position: 'absolute' as const,
  left: '-20px',
  top: '20px',
  fontSize: '32px',
}

const confettiRight = {
  position: 'absolute' as const,
  right: '-20px',
  top: '20px',
  fontSize: '32px',
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
  border: '3px solid #10b981',
}

const nftPlaceholderText = {
  fontSize: '64px',
  margin: '0',
}

const nftInfo = {
  textAlign: 'center' as const,
}

const nftCollection = {
  color: '#10b981',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const nftTitle = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const nftTokenId = {
  color: '#71717a',
  fontSize: '14px',
  margin: '0',
}

const contentSection = {
  padding: '32px 40px',
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

const hashValue = {
  color: '#a1a1aa',
  fontSize: '13px',
  fontFamily: 'monospace',
  margin: '0',
}

const priceValue = {
  color: '#ffffff',
  fontSize: '15px',
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
  margin: '0 24px',
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

const shareSection = {
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  margin: '24px',
  borderRadius: '12px',
  padding: '16px 24px',
  textAlign: 'center' as const,
  border: '1px solid rgba(59, 130, 246, 0.2)',
}

const shareText = {
  color: '#93c5fd',
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
