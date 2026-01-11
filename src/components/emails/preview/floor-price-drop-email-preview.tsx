import { FloorPriceDropEmail } from '../nft/floor-price-drop-email'

export default function FloorPriceDropEmailPreview() {
  return (
    <FloorPriceDropEmail
      collectionName="Bored Apes Yacht Club"
      collectionImage="https://picsum.photos/200/200?random=4"
      previousFloorPrice={25.5}
      currentFloorPrice={22.0}
      dropPercentage={13.7}
      marketplaceUrl="https://zuno.market/collection/bayc"
      totalVolume="1.2M ETH"
      itemCount={10000}
    />
  )
}
