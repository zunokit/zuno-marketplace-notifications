import { AuctionOutbidEmail } from '../nft/auction-outbid-email'

export default function AuctionOutbidEmailPreview() {
  return (
    <AuctionOutbidEmail
      nftName="Ethereal Waves #42"
      nftImage="https://picsum.photos/400/400?random=2"
      yourBid={1.5}
      newBid={1.75}
      auctionEndTime={new Date(Date.now() + 3600000).toISOString()}
      auctionUrl="https://zuno.market/auction/ethereal-waves-42"
      collectionName="Ethereal Waves"
    />
  )
}
