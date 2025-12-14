import { WhitelistApprovedEmail } from '../nft/whitelist-approved-email'

export default function WhitelistApprovedEmailPreview() {
  return (
    <WhitelistApprovedEmail
      dropName="Legendary Legends"
      spots={3}
      startTime={new Date(Date.now() + 172800000).toISOString()}
      mintUrl="https://zuno.market/drops/legendary-legends/mint"
      dropImage="https://picsum.photos/600/400?random=7"
      pricePerNFT={0.15}
    />
  )
}
