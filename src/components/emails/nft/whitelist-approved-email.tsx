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

interface WhitelistApprovedEmailProps {
  dropName: string
  spots: number
  startTime: string
  mintUrl?: string
  dropImage?: string
  pricePerNFT?: number
}

export const WhitelistApprovedEmail = ({
  dropName,
  spots,
  startTime,
  mintUrl,
  dropImage,
  pricePerNFT,
}: WhitelistApprovedEmailProps) => {
  const startDate = new Date(startTime)

  return (
    <Html>
      <Head />
      <Preview>
        You're approved for the {dropName} whitelist - {String(spots)}{' '}
        {spots === 1 ? 'spot' : 'spots'} secured!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          {/* Success Hero with badge */}
          <Section style={heroSection}>
            <Section style={heroBox}>
              <Row>
                <Column align="center">
                  <Section style={approvedBadge}>
                    <Text style={approvedBadgeText}>✓ APPROVED</Text>
                  </Section>
                  <Text style={heroEmoji}>🎊</Text>
                  <Heading style={heroTitle}>Whitelist Approved!</Heading>
                  <Text style={heroSubtitle}>
                    You've secured your spot for an exclusive drop
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* Drop Preview */}
          {dropImage && (
            <Section style={imageSection}>
              <Img src={dropImage} alt={dropName} style={dropImageStyle} />
            </Section>
          )}

          {/* Drop Info */}
          <Section style={dropInfoSection}>
            <Heading style={dropTitle}>{dropName}</Heading>
            <Section style={spotsBadge}>
              <Text style={spotsBadgeText}>
                {spots} {spots === 1 ? 'Spot' : 'Spots'} Secured
              </Text>
            </Section>
          </Section>

          {/* Drop Details */}
          <Section style={contentSection}>
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
              <Hr style={detailDivider} />
              <Row style={detailRow}>
                <Column style={detailIconColumn}>
                  <Text style={detailIcon}>🎫</Text>
                </Column>
                <Column>
                  <Text style={detailLabel}>Your Allocation</Text>
                  <Text style={detailValue}>
                    {spots} {spots === 1 ? 'NFT' : 'NFTs'}
                  </Text>
                </Column>
              </Row>
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
                <EmailButton href={mintUrl}>Go to Mint Page</EmailButton>
                <Text style={ctaSubtext}>
                  Bookmark this page for quick access
                </Text>
              </Section>
            )}
          </Section>

          {/* Preparation Checklist */}
          <Section style={checklistSection}>
            <Heading style={checklistTitle}>⚡ Preparation Checklist</Heading>
            <Row style={checkRow}>
              <Column style={checkBoxColumn}>
                <Text style={checkMark}>□</Text>
              </Column>
              <Column>
                <Text style={checkLabel}>Connect your wallet</Text>
                <Text style={checkDesc}>
                  Use the same wallet you applied with
                </Text>
              </Column>
            </Row>
            <Row style={checkRow}>
              <Column style={checkBoxColumn}>
                <Text style={checkMark}>□</Text>
              </Column>
              <Column>
                <Text style={checkLabel}>Fund your wallet</Text>
                <Text style={checkDesc}>
                  Ensure you have enough ETH + gas fees (~0.01 ETH)
                </Text>
              </Column>
            </Row>
            <Row style={checkRow}>
              <Column style={checkBoxColumn}>
                <Text style={checkMark}>□</Text>
              </Column>
              <Column>
                <Text style={checkLabel}>Set a reminder</Text>
                <Text style={checkDesc}>
                  Be online 5 minutes before the drop starts
                </Text>
              </Column>
            </Row>
            <Row style={checkRow}>
              <Column style={checkBoxColumn}>
                <Text style={checkMark}>□</Text>
              </Column>
              <Column>
                <Text style={checkLabel}>Have the mint page open</Text>
                <Text style={checkDesc}>Don't wait until the last second</Text>
              </Column>
            </Row>
            <Row style={checkRow}>
              <Column style={checkBoxColumn}>
                <Text style={checkMark}>□</Text>
              </Column>
              <Column>
                <Text style={checkLabel}>Check gas settings</Text>
                <Text style={checkDesc}>
                  Use recommended gas for fast transactions
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Important Warning */}
          <Section style={warningSection}>
            <Text style={warningIcon}>⚠️</Text>
            <Text style={warningTitle}>Important</Text>
            <Text style={warningText}>
              Whitelist spots are guaranteed but don't reserve indefinitely.
              Mint promptly when the drop goes live! We'll send you a reminder
              notification before it starts.
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  )
}

export default WhitelistApprovedEmail

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
  backgroundColor: '#8b5cf6',
  borderRadius: '16px',
  padding: '40px 32px',
  textAlign: 'center' as const,
}

const approvedBadge = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  padding: '6px 16px',
  marginBottom: '16px',
}

const approvedBadgeText = {
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

const imageSection = {
  padding: '24px 40px 0',
}

const dropImageStyle = {
  width: '100%',
  height: 'auto',
  borderRadius: '12px',
  border: '2px solid #333',
}

const dropInfoSection = {
  padding: '24px 40px 0',
  textAlign: 'center' as const,
}

const dropTitle = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 16px',
}

const spotsBadge = {
  backgroundColor: 'rgba(139, 92, 246, 0.15)',
  borderRadius: '24px',
  padding: '10px 24px',
  border: '1px solid rgba(139, 92, 246, 0.3)',
}

const spotsBadgeText = {
  color: '#a78bfa',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0',
}

const contentSection = {
  padding: '28px 40px',
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

const checkBoxColumn = {
  width: '36px',
}

const checkMark = {
  color: '#8b5cf6',
  fontSize: '18px',
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

const warningSection = {
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  margin: '24px',
  borderRadius: '12px',
  padding: '20px 24px',
  textAlign: 'center' as const,
  border: '1px solid rgba(239, 68, 68, 0.2)',
}

const warningIcon = {
  fontSize: '24px',
  margin: '0 0 8px',
}

const warningTitle = {
  color: '#fca5a5',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const warningText = {
  color: '#fca5a5',
  fontSize: '13px',
  lineHeight: '22px',
  margin: '0',
}
