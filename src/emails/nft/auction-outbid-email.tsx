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

interface AuctionOutbidEmailProps {
  nftName: string
  nftImage?: string
  yourBid: number
  newBid: number
  auctionEndTime: string
  auctionUrl?: string
}

export const AuctionOutbidEmail = ({
  nftName,
  nftImage,
  yourBid,
  newBid,
  auctionEndTime,
  auctionUrl,
}: AuctionOutbidEmailProps) => {
  const endDate = new Date(auctionEndTime)

  return (
    <Html>
      <Head />
      <Preview>You've been outbid on {nftName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ You've Been Outbid!</Heading>

          {nftImage && (
            <Img
              src={nftImage}
              alt={nftName}
              style={nftImg}
            />
          )}

          <Heading style={h2}>{nftName}</Heading>

          <Section style={bidSection}>
            <div style={bidRow}>
              <Text style={bidLabel}>Your Bid:</Text>
              <Text style={oldBid}>{yourBid} ETH</Text>
            </div>
            <div style={bidRow}>
              <Text style={bidLabel}>New Highest Bid:</Text>
              <Text style={newBidText}>{newBid} ETH</Text>
            </div>
          </Section>

          <Text style={text}>
            Someone has placed a higher bid on this NFT. The auction ends on{' '}
            <strong>{endDate.toLocaleDateString()}</strong> at{' '}
            <strong>{endDate.toLocaleTimeString()}</strong>.
          </Text>

          {auctionUrl && (
            <Button style={button} href={auctionUrl}>
              Place a New Bid
            </Button>
          )}

          <Section style={tipsSection}>
            <Text style={tipsText}>
              💡 <strong>Tip:</strong> Consider increasing your bid before the auction ends to secure this NFT.
            </Text>
          </Section>

          <Text style={footer}>
            You're receiving this because you're bidding on this NFT.
            <br />
            Manage your preferences in your notification settings.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default AuctionOutbidEmail

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
  color: '#dc2626',
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

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const bidSection = {
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '24px',
}

const bidRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
}

const bidLabel = {
  color: '#666',
  fontSize: '15px',
  fontWeight: '600',
  margin: 0,
}

const oldBid = {
  color: '#666',
  fontSize: '15px',
  fontWeight: 'bold',
  margin: 0,
  textDecoration: 'line-through',
}

const newBidText = {
  color: '#dc2626',
  fontSize: '18px',
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
  padding: '16px 24px',
}

const tipsText = {
  color: '#78350f',
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
