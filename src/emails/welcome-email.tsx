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

interface WelcomeEmailProps {
  userName?: string
  organizationName?: string
}

export const WelcomeEmail = ({
  userName = 'User',
  organizationName = 'Zuno Marketplace',
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to {organizationName} - Your journey into NFTs starts here!</Preview>
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
                alt={organizationName}
                style={logo}
              />
            </Column>
          </Row>
        </Section>

        {/* Hero Section */}
        <Section style={heroSection}>
          <div style={heroGradient}>
            <Text style={heroEmoji}>🎉</Text>
            <Heading style={heroTitle}>Welcome to {organizationName}!</Heading>
            <Text style={heroSubtitle}>
              Your gateway to discover, collect, and trade unique digital assets
            </Text>
          </div>
        </Section>

        {/* Content */}
        <Section style={contentSection}>
          <Text style={greeting}>Hi {userName},</Text>
          <Text style={paragraph}>
            We're thrilled to have you join our community of collectors, creators, and NFT enthusiasts. 
            You've just taken the first step into the exciting world of digital ownership.
          </Text>

          {/* Features Grid */}
          <Section style={featuresSection}>
            <Heading style={featuresTitle}>What you can do</Heading>
            <Row style={featureRow}>
              <Column style={featureColumn}>
                <div style={featureCard}>
                  <Text style={featureIcon}>🖼️</Text>
                  <Text style={featureLabel}>Discover</Text>
                  <Text style={featureDesc}>Browse thousands of unique NFTs</Text>
                </div>
              </Column>
              <Column style={featureColumn}>
                <div style={featureCard}>
                  <Text style={featureIcon}>💎</Text>
                  <Text style={featureLabel}>Collect</Text>
                  <Text style={featureDesc}>Build your digital collection</Text>
                </div>
              </Column>
            </Row>
            <Row style={featureRow}>
              <Column style={featureColumn}>
                <div style={featureCard}>
                  <Text style={featureIcon}>🔨</Text>
                  <Text style={featureLabel}>Auction</Text>
                  <Text style={featureDesc}>Bid on exclusive drops</Text>
                </div>
              </Column>
              <Column style={featureColumn}>
                <div style={featureCard}>
                  <Text style={featureIcon}>🚀</Text>
                  <Text style={featureLabel}>Create</Text>
                  <Text style={featureDesc}>Mint and sell your art</Text>
                </div>
              </Column>
            </Row>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button style={primaryButton} href="https://zuno.market/explore">
              Start Exploring
            </Button>
            <Text style={ctaSubtext}>
              or <Link href="https://zuno.market/create" style={ctaLink}>create your first NFT</Link>
            </Text>
          </Section>
        </Section>

        {/* Help Section */}
        <Section style={helpSection}>
          <Heading style={helpTitle}>Need help getting started?</Heading>
          <Text style={helpText}>
            Check out our <Link href="https://zuno.market/guides" style={helpLink}>beginner's guide</Link> or 
            reach out to our <Link href="https://zuno.market/support" style={helpLink}>support team</Link>.
          </Text>
        </Section>

        <Hr style={divider} />

        {/* Footer */}
        <Section style={footer}>
          <Row>
            <Column align="center">
              <Text style={footerBrand}>{organizationName}</Text>
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
                © 2025 {organizationName}. All rights reserved.
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

export default WelcomeEmail

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
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
  borderRadius: '16px',
  padding: '48px 32px',
  textAlign: 'center' as const,
}

const heroEmoji = {
  fontSize: '48px',
  margin: '0 0 16px',
}

const heroTitle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 12px',
  letterSpacing: '-0.5px',
}

const heroSubtitle = {
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const contentSection = {
  padding: '40px',
}

const greeting = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const paragraph = {
  color: '#a1a1aa',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0 0 32px',
}

const featuresSection = {
  marginBottom: '32px',
}

const featuresTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const featureRow = {
  marginBottom: '12px',
}

const featureColumn = {
  width: '50%',
  padding: '0 6px',
}

const featureCard = {
  backgroundColor: '#252525',
  borderRadius: '12px',
  padding: '20px 16px',
  textAlign: 'center' as const,
  border: '1px solid #333',
}

const featureIcon = {
  fontSize: '24px',
  margin: '0 0 8px',
}

const featureLabel = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const featureDesc = {
  color: '#71717a',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  padding: '8px 0',
}

const primaryButton = {
  backgroundColor: '#6366f1',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
  border: 'none',
}

const ctaSubtext = {
  color: '#71717a',
  fontSize: '14px',
  margin: '16px 0 0',
}

const ctaLink = {
  color: '#a78bfa',
  textDecoration: 'underline',
}

const helpSection = {
  backgroundColor: '#252525',
  margin: '0 24px 24px',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  border: '1px solid #333',
}

const helpTitle = {
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const helpText = {
  color: '#a1a1aa',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
}

const helpLink = {
  color: '#a78bfa',
  textDecoration: 'underline',
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
