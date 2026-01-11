import { MintSuccessEmail } from '../nft/mint-success-email'

export default function MintSuccessEmailPreview() {
  return (
    <MintSuccessEmail
      nftName="Pixel Punk #7823"
      nftImage="https://picsum.photos/400/400?random=5"
      nftId="7823"
      transactionHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      explorerUrl="https://etherscan.io/tx/0x1234567890abcdef"
      marketplaceUrl="https://zuno.market/nft/pixel-punk-7823"
      collectionName="Pixel Punks"
      mintPrice={0.05}
    />
  )
}
