import { getTodayShowTimes } from "@/lib/shows"
import OfflineProgram from "@/components/program/OfflineProgram"

export default async function ProgrammePage() {
  const showTimes = await getTodayShowTimes()

  return (
    <main className="min-h-screen bg-gray-100">
      <section className="bg-gray-900 px-4 pb-6 pt-5 text-white">
        <h1 className="text-3xl font-black">Programme 🎭</h1>
        <p className="mt-2 text-sm text-gray-300">
          Les spectacles et animations prévus aujourd’hui.
        </p>
      </section>

      <div className="-mt-3">
        <OfflineProgram showTimes={showTimes} />
      </div>
    </main>
  )
}