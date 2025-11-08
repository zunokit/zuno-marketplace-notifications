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

interface FloorPriceDropEmailProps {
  collectionName: string
  collectionImage?: string
  previousFloorPrice: number
  currentFloorPrice: number
  dropPercentage: number
  marketplaceUrl?: string
}

export const FloorPriceDropEmail = ({
  collectionName,
  collectionImage,
  previousFloorPrice,
  currentFloorPrice,
  dropPercentage,
  marketplaceUrl,
}: FloorPriceDropEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Floor price dropped {dropPercentage.toFixed(1)}% for {collectionName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📉 Floor Price Alert!</Heading>

          {collectionImage && (
            <Img
              src={collectionImage}
              alt={collectionName}
              style={collectionImg}
            />
          )}

          <Text style={text}>
            The floor price for <strong>{collectionName}</strong> has dropped significantly:
          </Text>

          <Section style={priceSection}>
            <div style={priceRow}>
              <Text style={priceLabel}>Previous Floor:</Text>
              <Text style={oldPrice}>{previousFloorPrice} ETH</Text>
            </div>
            <div style={priceRow}>
              <Text style={priceLabel}>Current Floor:</Text>
              <Text style={newPrice}>{currentFloorPrice} ETH</Text>
            </div>
            <div style={priceRow}>
              <Text style={priceLabel}>Drop:</Text>
              <Text style={dropAmount}>-{dropPercentage.toFixed(1)}%</Text>
            </div>
          </Section>

          <Text style={text}>
            This could be a great buying opportunity! Check out the collection now.
          </Text>

          {marketplaceUrl && (
            <Button style={button} href={marketplaceUrl}>
              View Collection
            </Button>
          )}

          <Text style={footer}>
            You're receiving this because you're watching {collectionName}.
            <br />
            Manage your alerts in your notification preferences.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default FloorPriceDropEmail

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
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
}

const collectionImg = {
  width: '100%',
  height: 'auto',
  borderRadius: '12px',
  margin: '0 40px',
  maxWidth: '520px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
}

const priceSection = {
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  margin: '24px 40px',
  padding: '20px',
}

const priceRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
}

const priceLabel = {
  color: '#666',
  fontSize: '14px',
  margin: 0,
}

const oldPrice = {
  color: '#999',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'line-through',
  margin: 0,
}

const newPrice = {
  color: '#10b981',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: 0,
}

const dropAmount = {
  color: '#ef4444',
  fontSize: '20px',
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
  width: '200px',
  padding: '14px 7px',
  margin: '24px auto',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  marginTop: '32px',
}
