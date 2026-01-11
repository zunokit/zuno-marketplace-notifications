import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import {
  EmailButton,
  EmailFooter,
  EmailHeader,
  FeatureCard,
  HeroSection,
} from './common'

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
    <Preview>
      Welcome to {organizationName} - Your journey into NFTs starts here!
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader organizationName={organizationName} />

        <HeroSection
          emoji="🎉"
          title={`Welcome to ${organizationName}!`}
          subtitle="Your gateway to discover, collect, and trade unique digital assets"
          backgroundColor="#6366f1"
        />

        <Section style={contentSection}>
          <Text style={greeting}>Hi {userName},</Text>
          <Text style={paragraph}>
            We're thrilled to have you join our community of collectors,
            creators, and NFT enthusiasts. You've just taken the first step into
            the exciting world of digital ownership.
          </Text>

          {/* Features Grid */}
          <Section style={featuresSection}>
            <Heading style={featuresTitle}>What you can do</Heading>
            <Row style={featureRow}>
              <Column style={featureColumn}>
                <FeatureCard
                  icon="🖼️"
                  label="Discover"
                  description="Browse thousands of unique NFTs"
                />
              </Column>
              <Column style={featureColumn}>
                <FeatureCard
                  icon="💎"
                  label="Collect"
                  description="Build your digital collection"
                />
              </Column>
            </Row>
            <Row style={featureRow}>
              <Column style={featureColumn}>
                <FeatureCard
                  icon="🔨"
                  label="Auction"
                  description="Bid on exclusive drops"
                />
              </Column>
              <Column style={featureColumn}>
                <FeatureCard
                  icon="🚀"
                  label="Create"
                  description="Mint and sell your art"
                />
              </Column>
            </Row>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <EmailButton href="https://zuno.market/explore">
              Start Exploring
            </EmailButton>
            <Text style={ctaSubtext}>
              or{' '}
              <Link href="https://zuno.market/create" style={ctaLink}>
                create your first NFT
              </Link>
            </Text>
          </Section>
        </Section>

        {/* Help Section */}
        <Section style={helpSection}>
          <Heading style={helpTitle}>Need help getting started?</Heading>
          <Text style={helpText}>
            Check out our{' '}
            <Link href="https://zuno.market/guides" style={helpLink}>
              beginner's guide
            </Link>{' '}
            or reach out to our{' '}
            <Link href="https://zuno.market/support" style={helpLink}>
              support team
            </Link>
            .
          </Text>
        </Section>

        <EmailFooter brandName={organizationName} />
      </Container>
    </Body>
  </Html>
)

export default WelcomeEmail

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

const ctaSection = {
  textAlign: 'center' as const,
  padding: '8px 0',
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
