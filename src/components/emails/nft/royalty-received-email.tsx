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
import { EmailButton, EmailFooter, EmailHeader, HeroSection } from '../common'

interface RoyaltyReceivedEmailProps {
  nftName: string
  nftImage?: string
  royaltyAmount: number
  salePrice: number
  royaltyPercentage: number
  buyerAddress?: string
  transactionHash?: string
  dashboardUrl?: string
  collectionName?: string
}

export const RoyaltyReceivedEmail = ({
  nftName,
  nftImage,
  royaltyAmount,
  salePrice,
  royaltyPercentage,
  buyerAddress,
  transactionHash,
  dashboardUrl,
  collectionName = 'Collection',
}: RoyaltyReceivedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        You received {royaltyAmount.toFixed(4)} ETH in royalties from {nftName}!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          <HeroSection
            emoji="💰"
            title="Royalty Received!"
            subtitle="Your creation just sold on the secondary market"
            backgroundColor="#eab308"
          />

          {/* Royalty Amount Card */}
          <Section style={amountCardSection}>
            <Section style={amountCard}>
              <Row>
                <Column align="center">
                  <Text style={amountLabel}>You Earned</Text>
                  <Text style={amountValue}>
                    {royaltyAmount.toFixed(4)} ETH
                  </Text>
                  <Text style={amountSubtext}>
                    {royaltyPercentage}% royalty from a {salePrice} ETH sale
                  </Text>
                </Column>
              </Row>
            </Section>
          </Section>

          {/* NFT Info */}
          <Section style={nftSection}>
            <Row>
              <Column style={nftImageColumn}>
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
              </Column>
              <Column style={nftInfoColumn}>
                <Text style={nftCollection}>{collectionName}</Text>
                <Text style={nftTitle}>{nftName}</Text>
                <Text style={soldLabel}>Sold for</Text>
                <Text style={soldPrice}>{salePrice} ETH</Text>
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
                  <Text style={detailLabel}>Sale Price</Text>
                </Column>
                <Column align="right">
                  <Text style={detailValue}>{salePrice} ETH</Text>
                </Column>
              </Row>
              <Hr style={detailDivider} />
              <Row style={detailRow}>
                <Column>
                  <Text style={detailLabel}>Royalty Rate</Text>
                </Column>
                <Column align="right">
                  <Text style={detailValue}>{royaltyPercentage}%</Text>
                </Column>
              </Row>
              <Hr style={detailDivider} />
              <Row style={detailRow}>
                <Column>
                  <Text style={detailLabel}>Your Earnings</Text>
                </Column>
                <Column align="right">
                  <Text style={earningsValue}>
                    {royaltyAmount.toFixed(4)} ETH
                  </Text>
                </Column>
              </Row>
              {buyerAddress && (
                <>
                  <Hr style={detailDivider} />
                  <Row style={detailRow}>
                    <Column>
                      <Text style={detailLabel}>Buyer</Text>
                    </Column>
                    <Column align="right">
                      <Text style={hashValue}>
                        {buyerAddress.slice(0, 6)}...{buyerAddress.slice(-4)}
                      </Text>
                    </Column>
                  </Row>
                </>
              )}
              {transactionHash && (
                <>
                  <Hr style={detailDivider} />
                  <Row style={detailRow}>
                    <Column>
                      <Text style={detailLabel}>Transaction</Text>
                    </Column>
                    <Column align="right">
                      <Text style={hashValue}>
                        {transactionHash.slice(0, 6)}...
                        {transactionHash.slice(-4)}
                      </Text>
                    </Column>
                  </Row>
                </>
              )}
            </Section>

            {/* CTA */}
            {dashboardUrl && (
              <Section style={ctaSection}>
                <EmailButton href={dashboardUrl}>
                  View Earnings Dashboard
                </EmailButton>
              </Section>
            )}
          </Section>

          {/* Creator Tips */}
          <Section style={tipsSection}>
            <Heading style={tipsTitle}>📊 Creator Insights</Heading>
            <Text style={tipsIntro}>
              Your art is being appreciated and resold - this is a great sign of
              collector interest!
            </Text>
            <Row style={tipRow}>
              <Column style={tipBulletColumn}>
                <Text style={tipBullet}>•</Text>
              </Column>
              <Column>
                <Text style={tipText}>
                  Track all your royalty earnings in the creator dashboard
                </Text>
              </Column>
            </Row>
            <Row style={tipRow}>
              <Column style={tipBulletColumn}>
                <Text style={tipBullet}>•</Text>
              </Column>
              <Column>
                <Text style={tipText}>
                  Analyze which pieces perform best on the secondary market
                </Text>
              </Column>
            </Row>
            <Row style={tipRow}>
              <Column style={tipBulletColumn}>
                <Text style={tipBullet}>•</Text>
              </Column>
              <Column>
                <Text style={tipText}>
                  Use these insights to inform future collections
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Celebration Note */}
          <Section style={celebrationSection}>
            <Text style={celebrationText}>
              🎨 Congratulations! Your creativity is generating ongoing income.
            </Text>
          </Section>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  )
}

export default RoyaltyReceivedEmail

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

const amountCardSection = {
  padding: '24px 40px 0',
}

const amountCard = {
  backgroundColor: '#065f46',
  borderRadius: '16px',
  padding: '32px 24px',
  textAlign: 'center' as const,
  border: '1px solid #10b981',
}

const amountLabel = {
  color: 'rgba(255, 255, 255, 0.75)',
  fontSize: '13px',
  fontWeight: '500',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
}

const amountValue = {
  color: '#ffffff',
  fontSize: '42px',
  fontWeight: '700',
  margin: '0 0 8px',
  letterSpacing: '-1px',
}

const amountSubtext = {
  color: 'rgba(255, 255, 255, 0.75)',
  fontSize: '14px',
  margin: '0',
}

const nftSection = {
  padding: '28px 40px',
}

const nftImageColumn = {
  width: '100px',
  verticalAlign: 'top',
}

const nftImageStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '12px',
  objectFit: 'cover' as const,
  border: '2px solid #333',
}

const nftPlaceholder = {
  width: '80px',
  height: '80px',
  backgroundColor: '#252525',
  borderRadius: '12px',
  border: '2px solid #333',
  textAlign: 'center' as const,
  padding: '20px 0',
}

const nftPlaceholderText = {
  fontSize: '28px',
  margin: '0',
}

const nftInfoColumn = {
  verticalAlign: 'top',
  paddingLeft: '8px',
}

const nftCollection = {
  color: '#eab308',
  fontSize: '11px',
  fontWeight: '500',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const nftTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 12px',
}

const soldLabel = {
  color: '#71717a',
  fontSize: '11px',
  fontWeight: '500',
  margin: '0 0 2px',
  textTransform: 'uppercase' as const,
}

const soldPrice = {
  color: '#10b981',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
}

const contentSection = {
  padding: '0 40px 32px',
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

const detailValue = {
  color: '#a1a1aa',
  fontSize: '14px',
  margin: '0',
}

const earningsValue = {
  color: '#10b981',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0',
}

const hashValue = {
  color: '#a1a1aa',
  fontSize: '13px',
  fontFamily: 'monospace',
  margin: '0',
}

const detailDivider = {
  borderColor: '#333',
  margin: '12px 0',
}

const ctaSection = {
  textAlign: 'center' as const,
}

const tipsSection = {
  backgroundColor: '#252525',
  margin: '0 24px',
  borderRadius: '12px',
  padding: '24px',
  border: '1px solid #333',
}

const tipsTitle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const tipsIntro = {
  color: '#a1a1aa',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 16px',
}

const tipRow = {
  marginBottom: '10px',
}

const tipBulletColumn = {
  width: '20px',
}

const tipBullet = {
  color: '#eab308',
  fontSize: '14px',
  margin: '0',
}

const tipText = {
  color: '#a1a1aa',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
}

const celebrationSection = {
  backgroundColor: 'rgba(139, 92, 246, 0.1)',
  margin: '24px',
  borderRadius: '12px',
  padding: '16px 24px',
  textAlign: 'center' as const,
  border: '1px solid rgba(139, 92, 246, 0.2)',
}

const celebrationText = {
  color: '#c4b5fd',
  fontSize: '14px',
  margin: '0',
}
