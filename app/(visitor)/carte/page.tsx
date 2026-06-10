import { getMapPoints } from "@/lib/map-points"
import OfflineMap from "@/components/map/OfflineMap"

export default async function MapPage() {
  const points = await getMapPoints()

  return <OfflineMap points={points} />
}