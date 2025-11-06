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

interface MintSuccessEmailProps {
  nftName: string
  nftImage?: string
  nftId?: string
  transactionHash: string
  explorerUrl?: string
  marketplaceUrl?: string
}

export const MintSuccessEmail = ({
  nftName,
  nftImage,
  nftId,
  transactionHash,
  explorerUrl,
  marketplaceUrl,
}: MintSuccessEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Successfully minted {nftName}!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Mint Successful!</Heading>

          {nftImage && (
            <Img
              src={nftImage}
              alt={nftName}
              style={nftImg}
            />
          )}

          <Heading style={h2}>{nftName}</Heading>

          <Section style={successSection}>
            <Text style={successText}>
              ✅ Your NFT has been successfully minted!
            </Text>
          </Section>

          <Section style={detailsSection}>
            {nftId && (
              <div style={detailRow}>
                <Text style={detailLabel}>Token ID:</Text>
                <Text style={detailValue}>#{nftId}</Text>
              </div>
            )}
            <div style={detailRow}>
              <Text style={detailLabel}>Transaction:</Text>
              <Text style={detailValueSmall}>
                {transactionHash.slice(0, 8)}...{transactionHash.slice(-6)}
              </Text>
            </div>
          </Section>

          <Text style={text}>
            Congratulations! Your NFT is now in your wallet and will appear in your collection shortly.
          </Text>

          <div style={buttonContainer}>
            {explorerUrl && (
              <Button style={button} href={explorerUrl}>
                View on Explorer
              </Button>
            )}
            {marketplaceUrl && (
              <Button style={buttonSecondary} href={marketplaceUrl}>
                View in Gallery
              </Button>
            )}
          </div>

          <Section style={tipsSection}>
            <Heading style={tipsHeading}>🚀 What's Next?</Heading>
            <ul style={tipsList}>
              <li style={tipsItem}>Your NFT will appear in your wallet within a few minutes</li>
              <li style={tipsItem}>You can view, transfer, or list it for sale</li>
              <li style={tipsItem}>Check out the collection to see other mints</li>
              <li style={tipsItem}>Share your new NFT with the community!</li>
            </ul>
          </Section>

          <Text style={footer}>
            You're receiving this because you minted an NFT.
            <br />
            Manage your preferences in your notification settings.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default MintSuccessEmail

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
  color: '#059669',
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

const nftImg = {
  width: '100%',
  height: 'auto',
  borderRadius: '12px',
  margin: '0 40px 20px',
  maxWidth: '520px',
}

const successSection = {
  backgroundColor: '#d1fae5',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
  textAlign: 'center' as const,
}

const successText = {
  color: '#047857',
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

const detailValueSmall = {
  color: '#333',
  fontSize: '13px',
  fontWeight: 'bold',
  margin: 0,
  fontFamily: 'monospace',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px auto',
}

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 24px',
  margin: '8px',
}

const buttonSecondary = {
  backgroundColor: '#6b7280',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 24px',
  margin: '8px',
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
