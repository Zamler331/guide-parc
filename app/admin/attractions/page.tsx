import { getAttractions } from "@/lib/attractions"
import { getParkAreas } from "@/lib/park-areas"
import AttractionEditor from "@/components/attractions/AttractionEditor"

export default async function AdminAttractionsPage() {
  const attractions = await getAttractions()
  const areas = await getParkAreas()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Attractions 🎢</h1>
        <p className="mt-1 text-gray-500">
          Créez, modifiez et organisez les attractions visibles dans le guide.
        </p>
      </div>

      <AttractionEditor attractions={attractions} areas={areas} />
    </div>
  )
}