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

interface FloorPriceDropEmailProps {
  collectionName: string
  collectionImage?: string
  previousFloorPrice: number
  currentFloorPrice: number
  dropPercentage: number
  marketplaceUrl?: string
  totalVolume?: string
  itemCount?: number
}

export const FloorPriceDropEmail = ({
  collectionName,
  collectionImage,
  previousFloorPrice,
  currentFloorPrice,
  dropPercentage,
  marketplaceUrl,
  totalVolume,
  itemCount,
}: FloorPriceDropEmailProps) => {
  const savings = previousFloorPrice - currentFloorPrice

  return (
    <Html>
      <Head />
      <Preview>Floor price dropped {dropPercentage.toFixed(1)}% for {collectionName} - Great buying opportunity!</Preview>
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
              <Text style={heroEmoji}>📉</Text>
              <Heading style={heroTitle}>Floor Price Alert</Heading>
              <Text style={heroSubtitle}>
                Price dropped for a collection you&apos;re watching
              </Text>
            </div>
          </Section>

          {/* Collection Info */}
          <Section style={collectionSection}>
            {collectionImage ? (
              <Img
                src={collectionImage}
                alt={collectionName}
                style={collectionImageStyle}
              />
            ) : (
              <div style={collectionPlaceholder}>
                <Text style={collectionPlaceholderText}>🖼️</Text>
              </div>
            )}
            <Heading style={collectionTitle}>{collectionName}</Heading>
            {(totalVolume || itemCount) && (
              <Row style={statsRow}>
                {totalVolume && (
                  <Column style={statColumn}>
                    <Text style={statLabel}>Volume</Text>
                    <Text style={statValue}>{totalVolume}</Text>
                  </Column>
                )}
                {itemCount && (
                  <Column style={statColumn}>
                    <Text style={statLabel}>Items</Text>
                    <Text style={statValue}>{itemCount.toLocaleString()}</Text>
                  </Column>
                )}
              </Row>
            )}
          </Section>

          {/* Price Comparison */}
          <Section style={contentSection}>
            <Section style={priceCard}>
              <Row>
                <Column style={priceColumn}>
                  <Text style={priceLabel}>Previous Floor</Text>
                  <Text style={previousPrice}>{previousFloorPrice} ETH</Text>
                </Column>
                <Column style={arrowColumn}>
                  <Text style={arrowDown}>↓</Text>
                </Column>
                <Column style={priceColumn}>
                  <Text style={priceLabel}>Current Floor</Text>
                  <Text style={currentPrice}>{currentFloorPrice} ETH</Text>
                </Column>
              </Row>
            </Section>

            {/* Drop Stats */}
            <Section style={dropStatsCard}>
              <Row>
                <Column style={dropStatColumn}>
                  <div style={dropBadge}>
                    <Text style={dropBadgeText}>-{dropPercentage.toFixed(1)}%</Text>
                  </div>
                  <Text style={dropStatLabel}>Price Drop</Text>
                </Column>
                <Column style={dropStatColumn}>
                  <Text style={savingsValue}>{savings.toFixed(4)} ETH</Text>
                  <Text style={dropStatLabel}>You Save</Text>
                </Column>
              </Row>
            </Section>

            {/* Opportunity Section */}
            <Section style={opportunitySection}>
              <Text style={opportunityIcon}>💡</Text>
              <Text style={opportunityText}>
                This could be a great buying opportunity! Floor prices at this level may not last long.
              </Text>
            </Section>

            {/* CTA */}
            {marketplaceUrl && (
              <Section style={ctaSection}>
                <Button style={primaryButton} href={marketplaceUrl}>
                  View Collection
                </Button>
                <Text style={ctaSubtext}>
                  Browse available NFTs at the new floor price
                </Text>
              </Section>
            )}
          </Section>

          {/* Market Tips */}
          <Section style={tipsSection}>
            <Heading style={tipsTitle}>📊 Market Insights</Heading>
            <div style={tipItem}>
              <Text style={tipBullet}>•</Text>
              <Text style={tipText}>Floor price changes can indicate market sentiment shifts</Text>
            </div>
            <div style={tipItem}>
              <Text style={tipBullet}>•</Text>
              <Text style={tipText}>Compare with historical lows before making a decision</Text>
            </div>
            <div style={tipItem}>
              <Text style={tipBullet}>•</Text>
              <Text style={tipText}>Check the collection&apos;s recent activity and roadmap</Text>
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
                  You&apos;re receiving this because you&apos;re watching {collectionName}.
                </Text>
                <Text style={footerLinks}>
                  <Link href="https://zuno.market/settings/notifications" style={footerLink}>Manage Alerts</Link>
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

export default FloorPriceDropEmail

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
  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
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

const collectionSection = {
  padding: '32px 40px 0',
  textAlign: 'center' as const,
}

const collectionImageStyle = {
  width: '100px',
  height: '100px',
  borderRadius: '16px',
  margin: '0 auto 16px',
  border: '3px solid #333',
  objectFit: 'cover' as const,
}

const collectionPlaceholder = {
  width: '100px',
  height: '100px',
  backgroundColor: '#252525',
  borderRadius: '16px',
  margin: '0 auto 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '3px solid #333',
}

const collectionPlaceholderText = {
  fontSize: '36px',
  margin: '0',
}

const collectionTitle = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 16px',
}

const statsRow = {
  marginBottom: '8px',
}

const statColumn = {
  width: '50%',
  textAlign: 'center' as const,
}

const statLabel = {
  color: '#71717a',
  fontSize: '11px',
  fontWeight: '500',
  margin: '0 0 2px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const statValue = {
  color: '#a1a1aa',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const contentSection = {
  padding: '28px 40px',
}

const priceCard = {
  backgroundColor: '#252525',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '16px',
  border: '1px solid #333',
}

const priceColumn = {
  width: '42%',
  textAlign: 'center' as const,
}

const arrowColumn = {
  width: '16%',
  textAlign: 'center' as const,
}

const priceLabel = {
  color: '#71717a',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const previousPrice = {
  color: '#71717a',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
  textDecoration: 'line-through',
}

const currentPrice = {
  color: '#22c55e',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
}

const arrowDown = {
  color: '#22c55e',
  fontSize: '28px',
  margin: '16px 0 0',
}

const dropStatsCard = {
  backgroundColor: 'rgba(34, 197, 94, 0.1)',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '24px',
  border: '1px solid rgba(34, 197, 94, 0.2)',
}

const dropStatColumn = {
  width: '50%',
  textAlign: 'center' as const,
}

const dropBadge = {
  backgroundColor: '#22c55e',
  borderRadius: '8px',
  padding: '8px 16px',
  display: 'inline-block',
  marginBottom: '8px',
}

const dropBadgeText = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
}

const savingsValue = {
  color: '#22c55e',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const dropStatLabel = {
  color: '#86efac',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const opportunitySection = {
  backgroundColor: '#252525',
  borderRadius: '12px',
  padding: '20px 24px',
  marginBottom: '28px',
  textAlign: 'center' as const,
  border: '1px solid #333',
}

const opportunityIcon = {
  fontSize: '24px',
  margin: '0 0 8px',
}

const opportunityText = {
  color: '#a1a1aa',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
}

const primaryButton = {
  backgroundColor: '#22c55e',
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
  color: '#22c55e',
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
