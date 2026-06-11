import OfflineOpeningCalendar from "@/components/opening/OfflineOpeningCalendar"
import PageHeader from "@/components/ui/PageHeader"
import { getOpeningDaysForYear } from "@/lib/opening-hours"

export default async function HorairesPage() {
  const year = new Date().getFullYear()
  const openingDays = await getOpeningDaysForYear(year)

  return (
    <main className="min-h-screen bg-slate-100">
      <PageHeader
        title="Horaires"
        subtitle="Consultez le calendrier d'ouverture du parc."
        eyebrow="Ouverture"
        tone="blue"
      />

      <div className="-mt-3 px-4 pb-6">
        <OfflineOpeningCalendar year={year} openingDays={openingDays} />
      </div>
    </main>
  )
}
