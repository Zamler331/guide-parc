import { getShows, getShowTimes } from "@/lib/shows"
import ShowEditor from "@/components/program/ShowEditor"
import ShowTimeGenerator from "@/components/program/ShowTimeGenerator"
import ShowTimeCalendar from "@/components/program/ShowTimeCalendar"

export default async function AdminProgrammePage() {
  const shows = await getShows()
  const showTimes = await getShowTimes()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black">Programme 🎭</h1>
        <p className="mt-1 text-gray-500">
          Gérez les spectacles et leurs représentations.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-black">Spectacles</h2>
        <ShowEditor shows={shows} />
      </section>

      <section className="space-y-4">
  <h2 className="text-xl font-black">Représentations</h2>

  <ShowTimeGenerator shows={shows.filter((show: any) => show.status === "active")} />

  <ShowTimeCalendar showTimes={showTimes} />
</section>
    </div>
  )
}