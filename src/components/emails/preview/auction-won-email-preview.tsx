import { AuctionWonEmail } from '../auction-won-email'

export default function AuctionWonEmailPreview() {
  return (
    <AuctionWonEmail
      userName="Alex"
      nftName="Cosmic Dreamer #1234"
      nftImage="https://picsum.photos/400/400?random=1"
      bidAmount="2.5 ETH"
      collectionName="Cosmic Dreamers"
      auctionEndTime={new Date().toISOString()}
    />
  )
}
