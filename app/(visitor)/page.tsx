import HomeScreen from "@/components/home/HomeScreen"
import { getTodayOpening } from "@/lib/opening-hours"

export default async function HomePage() {
  const opening = await getTodayOpening({ fast: true })

  return <HomeScreen opening={opening} />
}
