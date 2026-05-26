import { getMapPoints } from "@/lib/map-points"
import OfflineMap from "@/components/map/OfflineMap"

export default async function MapPage() {
  const points = await getMapPoints()

  return (
    <main>
      <h1 className="p-4 text-xl font-bold">Carte du parc 🗺️</h1>
      <OfflineMap points={points} />
    </main>
  )
}