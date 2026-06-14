import { getMapPoints } from "@/lib/map-points"
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount"
import OfflineMap from "@/components/map/OfflineMap"

export default async function MapPage() {
  const points = await getMapPoints()

  return (
    <>
      <TrackEventOnMount eventName="map_opened" page="/carte" />
      <OfflineMap points={points} />
    </>
  )
}
