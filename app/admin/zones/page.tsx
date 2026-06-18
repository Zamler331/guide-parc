import { getParkAreas } from "@/lib/park-areas"
import {
  getEntityOpeningRules,
  getEntityOpeningSchedules,
} from "@/lib/opening-hours"
import ZoneEditor from "@/components/zones/ZoneEditor"

export default async function AdminZonesPage() {
  const zones = await getParkAreas()
  const schedules = await getEntityOpeningSchedules()
  const openingRules = await getEntityOpeningRules()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Zones 🧭</h1>
        <p className="mt-1 text-gray-500">
          Créez et organisez les zones utilisées pour la carte et les attractions.
        </p>
      </div>

      <ZoneEditor
        zones={zones}
        schedules={schedules}
        openingRules={openingRules}
      />
    </div>
  )
}
