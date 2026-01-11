import { Column, Row, Section, Text } from '@react-email/components'

interface FeatureCardProps {
  icon: string
  label: string
  description: string
}

export const FeatureCard = ({ icon, label, description }: FeatureCardProps) => (
  <Section style={card}>
    <Row>
      <Column align="center">
        <Text style={iconStyle}>{icon}</Text>
        <Text style={labelStyle}>{label}</Text>
        <Text style={descStyle}>{description}</Text>
      </Column>
    </Row>
  </Section>
)

const card = {
  backgroundColor: '#252525',
  borderRadius: '12px',
  padding: '20px 16px',
  textAlign: 'center' as const,
  border: '1px solid #333',
}

const iconStyle = { fontSize: '24px', margin: '0 0 8px' }

const labelStyle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const descStyle = {
  color: '#71717a',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
}
