import { getAttractions } from "@/lib/attractions"
import { getRestaurants, getShops } from "@/lib/commercial-entities"
import { getAllMapPoints } from "@/lib/map-points"
import {
  getEntityOpeningRules,
  getEntityOpeningSchedules,
} from "@/lib/opening-hours"
import { getParkAreas } from "@/lib/park-areas"
import SpecificOpeningHoursEditor from "@/components/opening/SpecificOpeningHoursEditor"

export default async function SpecificOpeningHoursPage() {
  const schedules = await getEntityOpeningSchedules()
  const rules = await getEntityOpeningRules()
  const attractions = await getAttractions()
  const areas = await getParkAreas()
  const mapPoints = await getAllMapPoints()
  const restaurants = await getRestaurants()
  const shops = await getShops()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Horaires specifiques</h1>
        <p className="mt-1 text-gray-500">
          Gere les horaires propres aux entites, separes du calendrier
          d'ouverture du parc.
        </p>
      </div>

      <SpecificOpeningHoursEditor
        schedules={schedules}
        rules={rules}
        attractions={attractions}
        areas={areas}
        mapPoints={mapPoints}
        restaurants={restaurants}
        shops={shops}
      />
    </div>
  )
}
