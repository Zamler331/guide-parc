import { getAttractions } from "@/lib/attractions"
import { getParkAreas } from "@/lib/park-areas"
import AttractionList from "@/components/attractions/AttractionList"
import AttractionForm from "@/components/attractions/AttractionForm"

export default async function AdminAttractionsPage() {
  const attractions = await getAttractions()
  const areas = await getParkAreas()

  return (
    <main className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Admin Attractions 🎢</h1>

      <AttractionForm areas={areas} />

      <div className="mt-6">
        <AttractionList attractions={attractions} />
      </div>
    </main>
  )
}