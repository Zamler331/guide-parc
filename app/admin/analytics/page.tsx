import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard"

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Statistiques</h1>
        <p className="mt-1 text-gray-500">
          Mesure anonyme de l'utilisation pendant les tests terrain.
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  )
}
