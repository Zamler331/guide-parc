import { getAttractions } from "@/lib/attractions"
import OfflineAttractions from "@/components/attractions/OfflineAttractions"

export default async function AttractionsPage() {
  const attractions = await getAttractions()

  return (
    <main>
      <h1 className="p-4 text-xl font-bold">Attractions 🎢</h1>
      <OfflineAttractions attractions={attractions} />
    </main>
  )
}