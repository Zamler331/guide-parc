import OfflineProgram from "@/components/program/OfflineProgram"
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount"
import PageHeader from "@/components/ui/PageHeader"
import { getTodayShowTimes } from "@/lib/shows"

export default async function ProgrammePage() {
  const showTimes = await getTodayShowTimes({ fast: true })

  return (
    <main className="min-h-screen bg-slate-100">
      <TrackEventOnMount eventName="show_schedule_opened" page="/programme" />

      <PageHeader
        title="Programme"
        subtitle="Les spectacles et animations prevus aujourd'hui."
        eyebrow="Aujourd'hui"
        tone="orange"
      />

      <div className="-mt-3">
        <OfflineProgram showTimes={showTimes} />
      </div>
    </main>
  )
}
