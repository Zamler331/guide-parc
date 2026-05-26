import { getMapPoints } from "@/lib/map-points"
import { getAttractions } from "@/lib/attractions"
import AdminMapEditor from "@/components/map/AdminMapEditor"

export default async function AdminMapPage() {
  const points = await getMapPoints()
  const attractions = await getAttractions()

  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Admin Carte 🗺️</h1>
      <AdminMapEditor points={points} attractions={attractions} />
    </main>
  )
}