import {
  getOpeningSchedules,
  getOpeningDays,
} from "@/lib/opening-hours"
import OpeningScheduleEditor from "@/components/opening/OpeningScheduleEditor"
import OpeningCalendarEditor from "@/components/opening/OpeningCalendarEditor"

export default async function OpeningHoursPage() {
  const schedules = await getOpeningSchedules()
  const openingDays = await getOpeningDays()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black">Horaires 🕒</h1>

        <p className="mt-1 text-gray-500">
          Gérez les modèles d’horaires et le calendrier d’ouverture.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-black">Modèles d’horaires</h2>
        <OpeningScheduleEditor schedules={schedules} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black">Calendrier annuel</h2>
        <OpeningCalendarEditor
          schedules={schedules}
          openingDays={openingDays}
        />
      </section>
    </div>
  )
}