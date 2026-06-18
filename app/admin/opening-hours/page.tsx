import {
  getOpeningDays,
  getOpeningSchedules,
} from "@/lib/opening-hours"
import OpeningCalendarEditor from "@/components/opening/OpeningCalendarEditor"
import OpeningScheduleEditor from "@/components/opening/OpeningScheduleEditor"

export default async function OpeningHoursPage() {
  const schedules = await getOpeningSchedules()
  const openingDays = await getOpeningDays()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black">Horaires du parc</h1>

        <p className="mt-1 text-gray-500">
          Gerez les modeles d'horaires et le calendrier d'ouverture general du
          parc.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-black">Modeles d'horaires du parc</h2>
        <OpeningScheduleEditor schedules={schedules} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-black">Calendrier annuel du parc</h2>
        <OpeningCalendarEditor
          schedules={schedules}
          openingDays={openingDays}
        />
      </section>
    </div>
  )
}
