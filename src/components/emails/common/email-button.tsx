import { Button } from '@react-email/components'

interface EmailButtonProps {
  href: string
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
  style?: React.CSSProperties
}

export const EmailButton = ({
  href,
  variant = 'primary',
  children,
  style,
}: EmailButtonProps) => (
  <Button style={{ ...buttonStyles[variant], ...style }} href={href}>
    {children}
  </Button>
)

const buttonStyles = {
  primary: {
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
  },
  secondary: {
    backgroundColor: 'transparent',
    borderRadius: '10px',
    color: '#a1a1aa',
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '14px 32px',
    border: '1px solid #404040',
  },
}
