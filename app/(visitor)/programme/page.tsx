import OfflineProgram from "@/components/program/OfflineProgram"
import PageHeader from "@/components/ui/PageHeader"
import { getTodayShowTimes } from "@/lib/shows"

export default async function ProgrammePage() {
  const showTimes = await getTodayShowTimes()

  return (
    <main className="min-h-screen bg-slate-100">
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
