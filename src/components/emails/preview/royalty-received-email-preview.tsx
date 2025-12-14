import { RoyaltyReceivedEmail } from '../nft/royalty-received-email'

export default function RoyaltyReceivedEmailPreview() {
  return (
    <RoyaltyReceivedEmail
      nftName="Abstract Dreams #156"
      nftImage="https://picsum.photos/200/200?random=6"
      royaltyAmount={0.125}
      salePrice={2.5}
      royaltyPercentage={5}
      buyerAddress="0xAbCdEf1234567890AbCdEf1234567890AbCdEf12"
      transactionHash="0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321"
      dashboardUrl="https://zuno.market/creator/dashboard"
      collectionName="Abstract Dreams"
    />
  )
}
