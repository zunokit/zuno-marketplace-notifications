import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface AuctionWonEmailProps {
  userName?: string
  nftName?: string
  bidAmount?: string
}

export const AuctionWonEmail = ({
  userName = 'User',
  nftName = 'NFT',
  bidAmount = '0 ETH',
}: AuctionWonEmailProps) => (
  <Html>
    <Head />
    <Preview>Congratulations! You won the auction for {nftName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Congratulations!</Heading>
        <Text style={text}>Hi {userName},</Text>
        <Text style={text}>
          You won the auction for <strong>{nftName}</strong> with a bid of {bidAmount}!
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href="https://zuno.market/my-nfts">
            View Your NFT
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>© 2025 Zuno Marketplace. All rights reserved.</Text>
      </Container>
    </Body>
  </Html>
)

export default AuctionWonEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
}

const buttonContainer = {
  padding: '27px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#10b981',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '12px',
  margin: '0 auto',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '20px 0',
}
