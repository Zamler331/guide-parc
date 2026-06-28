import BottomNav from "@/components/layout/BottomNav"
import AnalyticsTracker from "@/components/analytics/AnalyticsTracker"
import OfflineAlertTicker from "@/components/alerts/OfflineAlertTicker"
import OfflineSync from "@/components/offline/OfflineSync"
import { getActiveAlerts } from "@/lib/alerts"

export default async function VisitorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const alerts = await getActiveAlerts({ fast: true })

  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-gray-100">
      <div className="flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-sm">
        <OfflineAlertTicker alerts={alerts} />

        <div className="min-h-0 flex-1 overflow-y-auto pb-[calc(3.75rem+env(safe-area-inset-bottom))]">
          <AnalyticsTracker />
          {children}
        </div>

        <OfflineSync />
        <BottomNav />
      </div>
    </div>
  )
}
