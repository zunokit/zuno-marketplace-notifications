import { DropAnnouncementEmail } from '../nft/drop-announcement-email'

export default function DropAnnouncementEmailPreview() {
  return (
    <DropAnnouncementEmail
      dropName="Genesis Collection"
      description="A groundbreaking collection of 10,000 unique digital art pieces, each handcrafted with love and creativity. Join us on this exciting journey into the future of digital ownership."
      dropImage="https://picsum.photos/600/400?random=3"
      startTime={new Date(Date.now() + 86400000).toISOString()}
      totalSupply={10000}
      pricePerNFT={0.08}
      mintUrl="https://zuno.market/drops/genesis-collection"
      creatorName="ArtistDAO"
    />
  )
}
