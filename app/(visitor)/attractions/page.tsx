import { getAttractions } from "@/lib/attractions"
import { getTodayOpening } from "@/lib/opening-hours"
import OfflineAttractions from "@/components/attractions/OfflineAttractions"

export default async function AttractionsPage() {
  const attractions = await getAttractions()
  const opening = await getTodayOpening()

  return (
    <main className="min-h-screen bg-gray-100">
      <section className="bg-gray-900 px-4 pb-6 pt-5 text-white">
        <h1 className="text-3xl font-black">Attractions 🎢</h1>
        <p className="mt-2 text-sm text-gray-300">
          Découvrez les attractions du parc par zone.
        </p>
      </section>

      <div className="-mt-3">
        <OfflineAttractions attractions={attractions} opening={opening} />
      </div>
    </main>
  )
}