import { getActiveAlerts } from "@/lib/alerts"
import AlertBanner from "@/components/alerts/AlertBanner"
import OfflineSync from "@/components/offline/OfflineSync"

export default async function HomePage() {
  const alerts = await getActiveAlerts()

  return (
    <main>
      <h1 className="p-4 text-2xl font-bold">Bienvenue au parc 🎢</h1>
      <OfflineSync />
      
      <AlertBanner alerts={alerts} />

      <div className="p-4 space-y-3">
        <p className="text-gray-600">
          Consultez les attractions, la carte et le programme du jour.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <a href="/carte" className="rounded-xl bg-gray-100 p-4 text-center">
            🗺️ Carte
          </a>
          <a href="/attractions" className="rounded-xl bg-gray-100 p-4 text-center">
            🎢 Attractions
          </a>
          <a href="/programme" className="rounded-xl bg-gray-100 p-4 text-center">
            🎭 Programme
          </a>
          <a href="/infos" className="rounded-xl bg-gray-100 p-4 text-center">
            ℹ️ Infos
          </a>
        </div>
      </div>
    </main>
  )
}