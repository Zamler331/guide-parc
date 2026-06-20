import OfflineAttractions from "@/components/attractions/OfflineAttractions"
import PageHeader from "@/components/ui/PageHeader"
import { getAttractions } from "@/lib/attractions"
import { getTodayOpening } from "@/lib/opening-hours"

export default async function AttractionsPage() {
  const attractions = await getAttractions({ fast: true })
  const opening = await getTodayOpening({ fast: true })

  return (
    <main className="min-h-screen bg-slate-100">
      <PageHeader
        title="Attractions"
        subtitle="Decouvrez les attractions du parc par zone."
        eyebrow="Aventures"
        tone="pink"
      />

      <div className="-mt-3">
        <OfflineAttractions attractions={attractions} opening={opening} />
      </div>
    </main>
  )
}
