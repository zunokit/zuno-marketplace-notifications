import { Column, Heading, Row, Section, Text } from '@react-email/components'

interface HeroSectionProps {
  emoji?: string
  title: string
  subtitle?: string
  backgroundColor?: string
}

export const HeroSection = ({
  emoji,
  title,
  subtitle,
  backgroundColor = '#6366f1',
}: HeroSectionProps) => (
  <Section style={{ padding: '0 24px' }}>
    <Section style={{ ...heroBox, backgroundColor }}>
      <Row>
        <Column align="center">
          {emoji && <Text style={emojiStyle}>{emoji}</Text>}
          <Heading style={titleStyle}>{title}</Heading>
          {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
        </Column>
      </Row>
    </Section>
  </Section>
)

const heroBox = {
  borderRadius: '16px',
  padding: '40px 32px',
  textAlign: 'center' as const,
}

const emojiStyle = {
  fontSize: '48px',
  margin: '0 0 12px',
}

const titleStyle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px',
  letterSpacing: '-0.5px',
}

const subtitleStyle = {
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: '16px',
  margin: '0',
}
