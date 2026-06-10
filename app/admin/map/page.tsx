import { getAllMapPoints } from "@/lib/map-points"
import { getAttractions } from "@/lib/attractions"
import { getParkAreas } from "@/lib/park-areas"
import AdminMapEditor from "@/components/map/AdminMapEditor"

export default async function AdminMapPage() {
  const points = await getAllMapPoints()
  const attractions = await getAttractions()
  const areas = await getParkAreas()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Carte 🗺️</h1>
        <p className="mt-1 text-gray-500">
          Ajoutez, modifiez et positionnez les points visibles sur la carte.
        </p>
      </div>

      <AdminMapEditor
        points={points}
        attractions={attractions}
        areas={areas}
      />
    </div>
  )
}