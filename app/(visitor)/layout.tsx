import BottomNav from "@/components/layout/BottomNav"
import AlertTicker from "@/components/alerts/AlertTicker"
import { getActiveAlerts } from "@/lib/alerts"

export default async function VisitorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const alerts = await getActiveAlerts()

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-white shadow-sm">
        <AlertTicker alerts={alerts} />

        <div className="min-h-screen pb-16">
          {children}
          <BottomNav />
        </div>
      </div>
    </div>
  )
}