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

interface RoyaltyReceivedEmailProps {
  nftName: string
  nftImage?: string
  royaltyAmount: number
  salePrice: number
  royaltyPercentage: number
  buyerAddress?: string
  transactionHash?: string
  dashboardUrl?: string
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
}: RoyaltyReceivedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You received {royaltyAmount.toFixed(4)} ETH in royalties from {nftName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>💰 Royalty Payment Received!</Heading>

          {nftImage && (
            <Img
              src={nftImage}
              alt={nftName}
              style={nftImg}
            />
          )}

          <Heading style={h2}>{nftName}</Heading>

          <Section style={amountSection}>
            <Text style={amountLabel}>You Received</Text>
            <Text style={amountValue}>{royaltyAmount} ETH</Text>
            <Text style={amountSubtext}>
              {royaltyPercentage}% royalty from a {salePrice} ETH sale
            </Text>
          </Section>

          <Section style={detailsSection}>
            <div style={detailRow}>
              <Text style={detailLabel}>Sale Price:</Text>
              <Text style={detailValue}>{salePrice} ETH</Text>
            </div>
            <div style={detailRow}>
              <Text style={detailLabel}>Royalty Rate:</Text>
              <Text style={detailValue}>{royaltyPercentage}%</Text>
            </div>
            {buyerAddress && (
              <div style={detailRow}>
                <Text style={detailLabel}>Buyer:</Text>
                <Text style={detailValueSmall}>
                  {buyerAddress.slice(0, 6)}...{buyerAddress.slice(-4)}
                </Text>
              </div>
            )}
            {transactionHash && (
              <div style={detailRow}>
                <Text style={detailLabel}>Transaction:</Text>
                <Text style={detailValueSmall}>
                  {transactionHash.slice(0, 6)}...{transactionHash.slice(-4)}
                </Text>
              </div>
            )}
          </Section>

          <Text style={text}>
            Congratulations! Your NFT has been resold and you've received your creator royalty.
            The payment has been sent to your wallet.
          </Text>

          {dashboardUrl && (
            <Button style={button} href={dashboardUrl}>
              View Earnings Dashboard
            </Button>
          )}

          <Section style={tipsSection}>
            <Heading style={tipsHeading}>📊 Track Your Royalties</Heading>
            <Text style={tipsText}>
              View all your royalty earnings, track sales history, and analyze your NFT performance
              in your creator dashboard.
            </Text>
          </Section>

          <Text style={footer}>
            You're receiving this because you're the creator of this NFT.
            <br />
            Manage your preferences in your notification settings.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default RoyaltyReceivedEmail

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

const amountSection = {
  backgroundColor: '#d1fae5',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const amountLabel = {
  color: '#065f46',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const amountValue = {
  color: '#059669',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const amountSubtext = {
  color: '#047857',
  fontSize: '14px',
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

const button = {
  backgroundColor: '#059669',
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
  backgroundColor: '#ede9fe',
  borderRadius: '8px',
  margin: '32px 40px',
  padding: '24px',
}

const tipsHeading = {
  color: '#5b21b6',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
}

const tipsText = {
  color: '#6b21a8',
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
