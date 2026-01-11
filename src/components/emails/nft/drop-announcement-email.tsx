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
import { EmailButton, EmailFooter, EmailHeader } from '../common'

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
          <EmailHeader />

          {/* Hero with badge */}
          <Section style={heroSection}>
            <Section style={heroBox}>
              <Row>
                <Column align="center">
                  <Section style={dropBadge}>
                    <Text style={dropBadgeText}>UPCOMING DROP</Text>
                  </Section>
                  <Text style={heroEmoji}>🚀</Text>
                  <Heading style={heroTitle}>{dropName}</Heading>
                  <Text style={heroCreator}>by {creatorName}</Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* Drop Image */}
          {dropImage && (
            <Section style={imageSection}>
              <Img src={dropImage} alt={dropName} style={dropImageStyle} />
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
                  <Text style={detailValue}>
                    {startDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </Column>
              </Row>
              <Hr style={detailDivider} />
              <Row style={detailRow}>
                <Column style={detailIconColumn}>
                  <Text style={detailIcon}>⏰</Text>
                </Column>
                <Column>
                  <Text style={detailLabel}>Time</Text>
                  <Text style={detailValue}>
                    {startDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short',
                    })}
                  </Text>
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
                      <Text style={detailValue}>
                        {totalSupply.toLocaleString()} NFTs
                      </Text>
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
                <EmailButton href={mintUrl}>View Drop Details</EmailButton>
                <Text style={ctaSubtext}>
                  Get notified when the drop goes live
                </Text>
              </Section>
            )}
          </Section>

          {/* Preparation Checklist */}
          <Section style={checklistSection}>
            <Heading style={checklistTitle}>✅ Preparation Checklist</Heading>
            <Row style={checkRow}>
              <Column style={checkNumberColumn}>
                <Text style={checkNumber}>1</Text>
              </Column>
              <Column>
                <Text style={checkLabel}>Fund Your Wallet</Text>
                <Text style={checkDesc}>
                  Ensure you have enough ETH + gas fees
                </Text>
              </Column>
            </Row>
            <Row style={checkRow}>
              <Column style={checkNumberColumn}>
                <Text style={checkNumber}>2</Text>
              </Column>
              <Column>
                <Text style={checkLabel}>Connect Early</Text>
                <Text style={checkDesc}>
                  Link your wallet before the drop starts
                </Text>
              </Column>
            </Row>
            <Row style={checkRow}>
              <Column style={checkNumberColumn}>
                <Text style={checkNumber}>3</Text>
              </Column>
              <Column>
                <Text style={checkLabel}>Set a Reminder</Text>
                <Text style={checkDesc}>
                  Be online 5 minutes before launch
                </Text>
              </Column>
            </Row>
            <Row style={checkRow}>
              <Column style={checkNumberColumn}>
                <Text style={checkNumber}>4</Text>
              </Column>
              <Column>
                <Text style={checkLabel}>Prepare for Gas</Text>
                <Text style={checkDesc}>
                  Use recommended gas settings for fast transactions
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Reminder Note */}
          <Section style={reminderSection}>
            <Text style={reminderText}>
              🔔 We'll send you another notification when the drop is about to
              go live!
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  )
}

export default DropAnnouncementEmail

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

const heroSection = {
  padding: '0 24px',
}

const heroBox = {
  backgroundColor: '#3b82f6',
  borderRadius: '16px',
  padding: '40px 32px',
  textAlign: 'center' as const,
}

const dropBadge = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  padding: '6px 16px',
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

const checkRow = {
  marginBottom: '16px',
}

const checkNumberColumn = {
  width: '36px',
}

const checkNumber = {
  backgroundColor: '#3b82f6',
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
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  margin: '24px',
  borderRadius: '12px',
  padding: '16px 24px',
  textAlign: 'center' as const,
  border: '1px solid rgba(59, 130, 246, 0.2)',
}

const reminderText = {
  color: '#93c5fd',
  fontSize: '14px',
  margin: '0',
}
