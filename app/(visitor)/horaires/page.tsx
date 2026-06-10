import { getOpeningDaysForYear } from "@/lib/opening-hours"
import VisitorOpeningCalendar from "@/components/opening/VisitorOpeningCalendar"

export default async function HorairesPage() {
  const year = new Date().getFullYear()

  const openingDays = await getOpeningDaysForYear(year)

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-black">
            Horaires d'ouverture 🕒
          </h1>

          <p className="mt-2 text-gray-500">
            Consultez le calendrier d'ouverture du parc.
          </p>
        </div>

        <VisitorOpeningCalendar
          year={year}
          openingDays={openingDays}
        />
      </div>
    </main>
  )
}