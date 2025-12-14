import { Body, Container, Html } from '@react-email/components'
import {
  EmailButton,
  EmailFooter,
  EmailHeader,
  FeatureCard,
  HeroSection,
} from './common'

// Test email to verify all shared components work
export default function TestComponentsEmail() {
  return (
    <Html>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          <HeroSection
            emoji="🎉"
            title="Components Test"
            subtitle="Testing all shared email components"
          />

          <FeatureCard
            icon="✨"
            label="Feature Test"
            description="This card tests the FeatureCard component"
          />

          <EmailButton href="https://zuno.market">Primary Button</EmailButton>

          <EmailButton href="https://zuno.market" variant="secondary">
            Secondary Button
          </EmailButton>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  maxWidth: '600px',
}
