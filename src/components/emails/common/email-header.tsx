import { Column, Img, Row, Section } from '@react-email/components'

interface EmailHeaderProps {
  organizationName?: string
  logoUrl?: string
}

export const EmailHeader = ({
  organizationName = 'Zuno Marketplace',
  logoUrl = 'https://zunokit.github.io/zuno-marketplace-assets/images/zuno-logo.png',
}: EmailHeaderProps) => (
  <Section style={header}>
    <Row>
      <Column align="center">
        <Img
          src={logoUrl}
          width="140"
          height="40"
          alt={organizationName}
          style={logo}
        />
      </Column>
    </Row>
  </Section>
)

const header = {
  padding: '32px 40px 24px',
  backgroundColor: '#1a1a1a',
}

const logo = {
  margin: '0 auto',
}
