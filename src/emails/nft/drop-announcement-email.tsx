import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface DropAnnouncementEmailProps {
  dropName: string
  description: string
  dropImage?: string
  startTime: string
  totalSupply?: number
  pricePerNFT?: number
  mintUrl?: string
}

export const DropAnnouncementEmail = ({
  dropName,
  description,
  dropImage,
  startTime,
  totalSupply,
  pricePerNFT,
  mintUrl,
}: DropAnnouncementEmailProps) => {
  const startDate = new Date(startTime)

  return (
    <Html>
      <Head />
      <Preview>New NFT Drop: {dropName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🚀 New Drop Announced!</Heading>

          {dropImage && (
            <Img
              src={dropImage}
              alt={dropName}
              style={dropImg}
            />
          )}

          <Heading style={h2}>{dropName}</Heading>

          <Text style={descriptionStyle}>{description}</Text>

          <Section style={detailsSection}>
            <div style={detailRow}>
              <Text style={detailLabel}>📅 Drop Date:</Text>
              <Text style={detailValue}>{startDate.toLocaleDateString()}</Text>
            </div>
            <div style={detailRow}>
              <Text style={detailLabel}>⏰ Time:</Text>
              <Text style={detailValue}>{startDate.toLocaleTimeString()}</Text>
            </div>
            {totalSupply && (
              <div style={detailRow}>
                <Text style={detailLabel}>🎨 Supply:</Text>
                <Text style={detailValue}>{totalSupply} NFTs</Text>
              </div>
            )}
            {pricePerNFT && (
              <div style={detailRow}>
                <Text style={detailLabel}>💰 Price:</Text>
                <Text style={detailValue}>{pricePerNFT} ETH</Text>
              </div>
            )}
          </Section>

          <Text style={text}>
            Mark your calendar! You'll receive another notification when the drop is about to start.
          </Text>

          {mintUrl && (
            <Button style={button} href={mintUrl}>
              View Drop Details
            </Button>
          )}

          <Section style={tipsSection}>
            <Heading style={tipsHeading}>💡 Tips for Success</Heading>
            <ul style={tipsList}>
              <li style={tipsItem}>Make sure you have enough ETH + gas fees</li>
              <li style={tipsItem}>Connect your wallet ahead of time</li>
              <li style={tipsItem}>Be online 5 minutes before the drop</li>
              <li style={tipsItem}>Have the mint page open and ready</li>
            </ul>
          </Section>

          <Text style={footer}>
            You're receiving this because you're watching this collection.
            <br />
            Manage your preferences in your notification settings.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default DropAnnouncementEmail

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
  color: '#333',
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

const dropImg = {
  width: '100%',
  height: 'auto',
  borderRadius: '12px',
  margin: '0 40px 20px',
  maxWidth: '520px',
}

const descriptionStyle = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  textAlign: 'center' as const,
  marginBottom: '32px',
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
  backgroundColor: '#5469d4',
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
  marginBottom: '8px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  marginTop: '32px',
  textAlign: 'center' as const,
}
