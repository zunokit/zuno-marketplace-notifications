import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface WhitelistApprovedEmailProps {
  dropName: string
  spots: number
  startTime: string
  mintUrl?: string
}

export const WhitelistApprovedEmail = ({
  dropName,
  spots,
  startTime,
  mintUrl,
}: WhitelistApprovedEmailProps) => {
  const startDate = new Date(startTime)

  return (
    <Html>
      <Head />
      <Preview>You're approved for the {dropName} whitelist!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎊 Whitelist Approved!</Heading>

          <Section style={approvedSection}>
            <Text style={approvedText}>
              ✅ Congratulations! You've been approved for the whitelist.
            </Text>
          </Section>

          <Heading style={h2}>{dropName}</Heading>

          <Section style={detailsSection}>
            <div style={detailRow}>
              <Text style={detailLabel}>Your Spots:</Text>
              <Text style={detailValue}>{spots}</Text>
            </div>
            <div style={detailRow}>
              <Text style={detailLabel}>📅 Drop Date:</Text>
              <Text style={detailValue}>{startDate.toLocaleDateString()}</Text>
            </div>
            <div style={detailRow}>
              <Text style={detailLabel}>⏰ Time:</Text>
              <Text style={detailValue}>{startDate.toLocaleTimeString()}</Text>
            </div>
          </Section>

          <Text style={text}>
            You've secured {spots} {spots === 1 ? 'spot' : 'spots'} on the whitelist for this exclusive drop.
            Make sure you're ready to mint when the drop goes live!
          </Text>

          {mintUrl && (
            <Button style={button} href={mintUrl}>
              Go to Mint Page
            </Button>
          )}

          <Section style={tipsSection}>
            <Heading style={tipsHeading}>⚡ Preparation Checklist</Heading>
            <ul style={tipsList}>
              <li style={tipsItem}>
                <strong>Connect your wallet</strong> - Make sure it's the same wallet you used to apply
              </li>
              <li style={tipsItem}>
                <strong>Fund your wallet</strong> - Ensure you have enough ETH + gas fees
              </li>
              <li style={tipsItem}>
                <strong>Set a reminder</strong> - Be online 5 minutes before the drop starts
              </li>
              <li style={tipsItem}>
                <strong>Have the mint page open</strong> - Don't wait until the last second
              </li>
              <li style={tipsItem}>
                <strong>Check gas settings</strong> - Use recommended gas to ensure transaction goes through
              </li>
            </ul>
          </Section>

          <Section style={urgentSection}>
            <Text style={urgentText}>
              ⚠️ <strong>Important:</strong> You'll receive another notification when the drop is about to start.
              Whitelist spots are guaranteed, but they don't reserve indefinitely - mint promptly when the drop goes live!
            </Text>
          </Section>

          <Text style={footer}>
            You're receiving this because you applied for this drop's whitelist.
            <br />
            Manage your preferences in your notification settings.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WhitelistApprovedEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const h1 = {
  color: '#7c3aed',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#333',
  fontSize: '22px',
  fontWeight: 'bold',
  margin: '20px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const approvedSection = {
  backgroundColor: '#ede9fe',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
  textAlign: 'center' as const,
}

const approvedText = {
  color: '#5b21b6',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: 0,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const detailsSection = {
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '24px',
}

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
}

const detailLabel = {
  color: '#666',
  fontSize: '15px',
  fontWeight: '600',
  margin: 0,
}

const detailValue = {
  color: '#333',
  fontSize: '15px',
  fontWeight: 'bold',
  margin: 0,
}

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '250px',
  padding: '14px 7px',
  margin: '32px auto',
}

const tipsSection = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  margin: '32px 40px',
  padding: '24px',
}

const tipsHeading = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
}

const tipsList = {
  margin: 0,
  padding: '0 0 0 20px',
}

const tipsItem = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '24px',
  marginBottom: '12px',
}

const urgentSection = {
  backgroundColor: '#fee2e2',
  borderRadius: '8px',
  margin: '32px 40px',
  padding: '16px 24px',
}

const urgentText = {
  color: '#991b1b',
  fontSize: '14px',
  lineHeight: '24px',
  margin: 0,
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  marginTop: '32px',
  textAlign: 'center' as const,
}
