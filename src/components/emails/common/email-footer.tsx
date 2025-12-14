import { Column, Hr, Link, Row, Section, Text } from '@react-email/components'

interface EmailFooterProps {
  brandName?: string
  showSocialLinks?: boolean
}

export const EmailFooter = ({
  brandName = 'Zuno Marketplace',
  showSocialLinks = true,
}: EmailFooterProps) => (
  <>
    <Hr style={divider} />
    <Section style={footer}>
      <Row>
        <Column align="center">
          <Text style={footerBrand}>{brandName}</Text>
          {showSocialLinks && (
            <Row style={{ marginBottom: '16px' }}>
              <Column align="center">
                <Link href="https://twitter.com/zunomarket" style={socialLink}>
                  Twitter
                </Link>
                <Text style={socialDot}>•</Text>
                <Link href="https://discord.gg/zuno" style={socialLink}>
                  Discord
                </Link>
                <Text style={socialDot}>•</Text>
                <Link href="https://instagram.com/zunomarket" style={socialLink}>
                  Instagram
                </Link>
              </Column>
            </Row>
          )}
          <Text style={footerText}>
            © 2025 {brandName}. All rights reserved.
          </Text>
          <Text style={{ margin: '0', textAlign: 'center' as const }}>
            <Link href="https://zuno.market/privacy" style={footerLink}>
              Privacy Policy
            </Link>
            <Text style={footerDot}>•</Text>
            <Link href="https://zuno.market/terms" style={footerLink}>
              Terms of Service
            </Link>
            <Text style={footerDot}>•</Text>
            <Link
              href="https://zuno.market/settings/notifications"
              style={footerLink}
            >
              Unsubscribe
            </Link>
          </Text>
        </Column>
      </Row>
    </Section>
  </>
)

const divider = { borderColor: '#2a2a2a', margin: '0' }

const footer = { padding: '32px 40px', backgroundColor: '#141414' }

const footerBrand = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const socialLink = { color: '#a1a1aa', fontSize: '13px', textDecoration: 'none' }

const socialDot = {
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

const footerLink = { color: '#71717a', fontSize: '12px', textDecoration: 'none' }

const footerDot = {
  color: '#404040',
  fontSize: '12px',
  margin: '0 8px',
  display: 'inline',
}
