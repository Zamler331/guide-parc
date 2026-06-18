import { getMapPoints } from "@/lib/map-points"
import { getTodayOpening } from "@/lib/opening-hours"
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount"
import OfflineMap from "@/components/map/OfflineMap"

export default async function MapPage() {
  const points = await getMapPoints()
  const opening = await getTodayOpening()

  return (
    <main className="h-full overflow-hidden">
      <TrackEventOnMount eventName="map_opened" page="/carte" />
      <OfflineMap points={points} opening={opening} />
    </main>
  )
}
