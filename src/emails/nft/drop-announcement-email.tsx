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

interface DropAnnouncementEmailProps {
  dropName: string
  description: string
  dropImage?: string
  startTime: string
  totalSupply?: number
  pricePerNFT?: number
  mintUrl?: string
  creatorName?: string
}

export const DropAnnouncementEmail = ({
  dropName,
  description,
  dropImage,
  startTime,
  totalSupply,
  pricePerNFT,
  mintUrl,
  creatorName = 'Creator',
}: DropAnnouncementEmailProps) => {
  const startDate = new Date(startTime)

  return (
    <Html>
      <Head />
      <Preview>New NFT Drop: {dropName} - Mark your calendar!</Preview>
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
              <div style={dropBadge}>
                <Text style={dropBadgeText}>UPCOMING DROP</Text>
              </div>
              <Text style={heroEmoji}>🚀</Text>
              <Heading style={heroTitle}>{dropName}</Heading>
              <Text style={heroCreator}>by {creatorName}</Text>
            </div>
          </Section>

          {/* Drop Image */}
          {dropImage && (
            <Section style={imageSection}>
              <Img
                src={dropImage}
                alt={dropName}
                style={dropImageStyle}
              />
            </Section>
          )}

          {/* Content */}
          <Section style={contentSection}>
            <Text style={descriptionText}>{description}</Text>

            {/* Drop Details */}
            <Section style={detailsCard}>
              <Row style={detailRow}>
                <Column style={detailIconColumn}>
                  <Text style={detailIcon}>📅</Text>
                </Column>
                <Column>
                  <Text style={detailLabel}>Drop Date</Text>
                  <Text style={detailValue}>{startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                </Column>
              </Row>
              <Hr style={detailDivider} />
              <Row style={detailRow}>
                <Column style={detailIconColumn}>
                  <Text style={detailIcon}>⏰</Text>
                </Column>
                <Column>
                  <Text style={detailLabel}>Time</Text>
                  <Text style={detailValue}>{startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}</Text>
                </Column>
              </Row>
              {totalSupply && (
                <>
                  <Hr style={detailDivider} />
                  <Row style={detailRow}>
                    <Column style={detailIconColumn}>
                      <Text style={detailIcon}>🎨</Text>
                    </Column>
                    <Column>
                      <Text style={detailLabel}>Total Supply</Text>
                      <Text style={detailValue}>{totalSupply.toLocaleString()} NFTs</Text>
                    </Column>
                  </Row>
                </>
              )}
              {pricePerNFT !== undefined && (
                <>
                  <Hr style={detailDivider} />
                  <Row style={detailRow}>
                    <Column style={detailIconColumn}>
                      <Text style={detailIcon}>💎</Text>
                    </Column>
                    <Column>
                      <Text style={detailLabel}>Mint Price</Text>
                      <Text style={priceValue}>{pricePerNFT} ETH</Text>
                    </Column>
                  </Row>
                </>
              )}
            </Section>

            {/* CTA */}
            {mintUrl && (
              <Section style={ctaSection}>
                <Button style={primaryButton} href={mintUrl}>
                  View Drop Details
                </Button>
                <Text style={ctaSubtext}>
                  Get notified when the drop goes live
                </Text>
              </Section>
            )}
          </Section>

          {/* Preparation Checklist */}
          <Section style={checklistSection}>
            <Heading style={checklistTitle}>✅ Preparation Checklist</Heading>
            <div style={checklistItem}>
              <Text style={checkNumber}>1</Text>
              <div style={checkContent}>
                <Text style={checkLabel}>Fund Your Wallet</Text>
                <Text style={checkDesc}>Ensure you have enough ETH + gas fees</Text>
              </div>
            </div>
            <div style={checklistItem}>
              <Text style={checkNumber}>2</Text>
              <div style={checkContent}>
                <Text style={checkLabel}>Connect Early</Text>
                <Text style={checkDesc}>Link your wallet before the drop starts</Text>
              </div>
            </div>
            <div style={checklistItem}>
              <Text style={checkNumber}>3</Text>
              <div style={checkContent}>
                <Text style={checkLabel}>Set a Reminder</Text>
                <Text style={checkDesc}>Be online 5 minutes before launch</Text>
              </div>
            </div>
            <div style={checklistItem}>
              <Text style={checkNumber}>4</Text>
              <div style={checkContent}>
                <Text style={checkLabel}>Prepare for Gas</Text>
                <Text style={checkDesc}>Use recommended gas settings for fast transactions</Text>
              </div>
            </div>
          </Section>

          {/* Reminder Note */}
          <Section style={reminderSection}>
            <Text style={reminderText}>
              🔔 We&apos;ll send you another notification when the drop is about to go live!
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
                  You&apos;re receiving this because you&apos;re watching this collection.
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

export default DropAnnouncementEmail

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
  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%)',
  borderRadius: '16px',
  padding: '40px 32px',
  textAlign: 'center' as const,
}

const dropBadge = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  padding: '6px 16px',
  display: 'inline-block',
  marginBottom: '16px',
}

const dropBadgeText = {
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

const heroCreator = {
  color: 'rgba(255, 255, 255, 0.75)',
  fontSize: '15px',
  margin: '0',
}

const imageSection = {
  padding: '24px 40px 0',
}

const dropImageStyle = {
  width: '100%',
  height: 'auto',
  borderRadius: '12px',
  border: '2px solid #333',
}

const contentSection = {
  padding: '28px 40px',
}

const descriptionText = {
  color: '#a1a1aa',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0 0 28px',
  textAlign: 'center' as const,
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

const detailIconColumn = {
  width: '44px',
}

const detailIcon = {
  fontSize: '20px',
  margin: '0',
}

const detailLabel = {
  color: '#71717a',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 2px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const detailValue = {
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0',
}

const priceValue = {
  color: '#a78bfa',
  fontSize: '18px',
  fontWeight: '700',
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
  backgroundColor: '#8b5cf6',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
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

const checklistSection = {
  backgroundColor: '#252525',
  margin: '0 24px',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #333',
}

const checklistTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 20px',
}

const checklistItem = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '16px',
}

const checkNumber = {
  backgroundColor: '#8b5cf6',
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

const checkContent = {
  flex: 1,
}

const checkLabel = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 2px',
}

const checkDesc = {
  color: '#71717a',
  fontSize: '13px',
  margin: '0',
}

const reminderSection = {
  backgroundColor: 'rgba(139, 92, 246, 0.1)',
  margin: '24px',
  borderRadius: '12px',
  padding: '16px 24px',
  textAlign: 'center' as const,
  border: '1px solid rgba(139, 92, 246, 0.2)',
}

const reminderText = {
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
