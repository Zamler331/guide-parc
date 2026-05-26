import { getTodayShows } from "@/lib/shows"
import OfflineProgram from "@/components/program/OfflineProgram"

export default async function ProgrammePage() {
  const shows = await getTodayShows()

  return (
    <main>
      <h1 className="p-4 text-xl font-bold">Programme 🎭</h1>
      <OfflineProgram shows={shows} />
    </main>
  )
}