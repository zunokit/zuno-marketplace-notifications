import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import { EmailButton, EmailFooter, EmailHeader } from '../common'

interface MintSuccessEmailProps {
  nftName: string
  nftImage?: string
  nftId?: string
  transactionHash: string
  explorerUrl?: string
  marketplaceUrl?: string
  collectionName?: string
  mintPrice?: number
}

export const MintSuccessEmail = ({
  nftName,
  nftImage,
  nftId,
  transactionHash,
  explorerUrl,
  marketplaceUrl,
  collectionName = 'Collection',
  mintPrice,
}: MintSuccessEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Successfully minted {nftName}! Welcome to the collection.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          {/* Success Hero with badge */}
          <Section style={heroSection}>
            <Section style={heroBox}>
              <Row>
                <Column align="center">
                  <Section style={successBadge}>
                    <Text style={successBadgeText}>✓ MINTED</Text>
                  </Section>
                  <Text style={heroEmoji}>🎉</Text>
                  <Heading style={heroTitle}>Mint Successful!</Heading>
                  <Text style={heroSubtitle}>
                    Your new NFT is being transferred to your wallet
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* NFT Preview */}
          <Section style={nftSection}>
            {nftImage ? (
              <Img src={nftImage} alt={nftName} style={nftImageStyle} />
            ) : (
              <Section style={nftPlaceholder}>
                <Row>
                  <Column align="center">
                    <Text style={nftPlaceholderText}>🖼️</Text>
                  </Column>
                </Row>
              </Section>
            )}
            <Row>
              <Column align="center">
                <Text style={nftCollection}>{collectionName}</Text>
                <Heading style={nftTitle}>{nftName}</Heading>
                {nftId && <Text style={nftTokenId}>Token #{nftId}</Text>}
              </Column>
            </Row>
          </Section>

          {/* Transaction Details */}
          <Section style={contentSection}>
            <Section style={detailsCard}>
              <Text style={detailsTitle}>Transaction Details</Text>
              <Hr style={detailDivider} />
              <Row style={detailRow}>
                <Column>
                  <Text style={detailLabel}>Status</Text>
                </Column>
                <Column align="right">
                  <Section style={statusBadge}>
                    <Text style={statusText}>Confirmed</Text>
                  </Section>
                </Column>
              </Row>
              <Hr style={detailDivider} />
              <Row style={detailRow}>
                <Column>
                  <Text style={detailLabel}>Transaction</Text>
                </Column>
                <Column align="right">
                  <Text style={hashValue}>
                    {transactionHash.slice(0, 8)}...{transactionHash.slice(-6)}
                  </Text>
                </Column>
              </Row>
              {mintPrice !== undefined && (
                <>
                  <Hr style={detailDivider} />
                  <Row style={detailRow}>
                    <Column>
                      <Text style={detailLabel}>Mint Price</Text>
                    </Column>
                    <Column align="right">
                      <Text style={priceValue}>{mintPrice} ETH</Text>
                    </Column>
                  </Row>
                </>
              )}
            </Section>

            {/* CTA Buttons */}
            <Section style={ctaSection}>
              {explorerUrl && (
                <EmailButton href={explorerUrl}>View on Explorer</EmailButton>
              )}
              {marketplaceUrl && (
                <EmailButton
                  href={marketplaceUrl}
                  variant="secondary"
                  style={{ marginLeft: '12px' }}
                >
                  View in Gallery
                </EmailButton>
              )}
            </Section>
          </Section>

          {/* What's Next */}
          <Section style={stepsSection}>
            <Heading style={stepsTitle}>🚀 What's Next?</Heading>
            <Row style={stepRow}>
              <Column style={stepNumberColumn}>
                <Text style={stepNumber}>1</Text>
              </Column>
              <Column>
                <Text style={stepLabel}>NFT Transfer</Text>
                <Text style={stepDesc}>
                  Your NFT will appear in your wallet within a few minutes
                </Text>
              </Column>
            </Row>
            <Row style={stepRow}>
              <Column style={stepNumberColumn}>
                <Text style={stepNumber}>2</Text>
              </Column>
              <Column>
                <Text style={stepLabel}>View in Collection</Text>
                <Text style={stepDesc}>
                  Access your NFT from your profile gallery
                </Text>
              </Column>
            </Row>
            <Row style={stepRow}>
              <Column style={stepNumberColumn}>
                <Text style={stepNumber}>3</Text>
              </Column>
              <Column>
                <Text style={stepLabel}>List or Hold</Text>
                <Text style={stepDesc}>
                  Keep it in your collection or list it for sale
                </Text>
              </Column>
            </Row>
            <Row style={stepRow}>
              <Column style={stepNumberColumn}>
                <Text style={stepNumber}>4</Text>
              </Column>
              <Column>
                <Text style={stepLabel}>Share the News</Text>
                <Text style={stepDesc}>
                  Show off your new NFT to the community!
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Social Share Prompt */}
          <Section style={shareSection}>
            <Text style={shareText}>
              🐦 Share your mint on Twitter and tag us @zunomarket!
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  )
}

export default MintSuccessEmail

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

const heroSection = {
  padding: '0 24px',
}

const heroBox = {
  backgroundColor: '#059669',
  borderRadius: '16px',
  padding: '40px 32px',
  textAlign: 'center' as const,
}

const successBadge = {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '20px',
  padding: '6px 16px',
  marginBottom: '16px',
}

const successBadgeText = {
  color: '#ffffff',
  fontSize: '11px',
  fontWeight: '700',
  margin: '0',
  letterSpacing: '1px',
}

const heroEmoji = {
  fontSize: '48px',
  margin: '0 0 12px',
}

const heroTitle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px',
  letterSpacing: '-0.5px',
}

const heroSubtitle = {
  color: 'rgba(255, 255, 255, 0.85)',
  fontSize: '15px',
  margin: '0',
}

const nftSection = {
  padding: '32px 40px 0',
  textAlign: 'center' as const,
}

const nftImageStyle = {
  width: '100%',
  maxWidth: '280px',
  height: 'auto',
  borderRadius: '16px',
  margin: '0 auto 20px',
  border: '3px solid #10b981',
}

const nftPlaceholder = {
  width: '280px',
  height: '280px',
  backgroundColor: '#252525',
  borderRadius: '16px',
  margin: '0 auto 20px',
  border: '3px solid #10b981',
  textAlign: 'center' as const,
  padding: '100px 0',
}

const nftPlaceholderText = {
  fontSize: '64px',
  margin: '0',
}

const nftCollection = {
  color: '#10b981',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const nftTitle = {
  color: '#ffffff',
  fontSize: '22px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const nftTokenId = {
  color: '#71717a',
  fontSize: '14px',
  margin: '0',
}

const contentSection = {
  padding: '32px 40px',
}

const detailsCard = {
  backgroundColor: '#252525',
  borderRadius: '12px',
  padding: '20px 24px',
  marginBottom: '28px',
  border: '1px solid #333',
}

const detailsTitle = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const detailRow = {
  padding: '8px 0',
}

const detailLabel = {
  color: '#71717a',
  fontSize: '14px',
  margin: '0',
}

const detailDivider = {
  borderColor: '#333',
  margin: '12px 0',
}

const statusBadge = {
  backgroundColor: 'rgba(16, 185, 129, 0.15)',
  borderRadius: '20px',
  padding: '4px 12px',
}

const statusText = {
  color: '#10b981',
  fontSize: '13px',
  fontWeight: '600',
  margin: '0',
}

const hashValue = {
  color: '#a1a1aa',
  fontSize: '13px',
  fontFamily: 'monospace',
  margin: '0',
}

const priceValue = {
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
}

const stepsSection = {
  backgroundColor: '#252525',
  margin: '0 24px',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #333',
}

const stepsTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 20px',
}

const stepRow = {
  marginBottom: '16px',
}

const stepNumberColumn = {
  width: '36px',
}

const stepNumber = {
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '700',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  textAlign: 'center' as const,
  lineHeight: '24px',
  margin: '0',
}

const stepLabel = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 2px',
}

const stepDesc = {
  color: '#71717a',
  fontSize: '13px',
  margin: '0',
}

const shareSection = {
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  margin: '24px',
  borderRadius: '12px',
  padding: '16px 24px',
  textAlign: 'center' as const,
  border: '1px solid rgba(59, 130, 246, 0.2)',
}

const shareText = {
  color: '#93c5fd',
  fontSize: '14px',
  margin: '0',
}
