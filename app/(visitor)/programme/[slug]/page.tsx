export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import SectionTitle from "@/components/ui/SectionTitle"
import { getShowBySlug, getTodayShowTimesForShow } from "@/lib/shows"

function formatTime(time?: string | null) {
  if (!time) return ""
  return time.slice(0, 5).replace(":", "h")
}

export default async function ShowPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const show = await getShowBySlug(decodedSlug)

  if (!show) return notFound()

  const showTimes = await getTodayShowTimesForShow(show.id)

  return (
    <main className="min-h-screen bg-slate-100 pb-6">
      <div className="relative h-64 bg-slate-300">
        {show.image_url ? (
          <img
            src={show.image_url}
            alt={show.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-sm font-black uppercase text-white"
            style={{ backgroundColor: show.color || "#7c3aed" }}
          >
            Spectacle
          </div>
        )}

        <Link
          href="/programme"
          className="absolute left-4 top-4 z-50 flex h-11 items-center rounded-full bg-white px-4 text-sm font-black text-slate-950 shadow-lg active:scale-95"
        >
          Programme
        </Link>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-5 pt-24">
          <Badge className="bg-white/95 text-slate-950">Spectacle</Badge>
          <h1 className="mt-3 text-3xl font-black leading-tight text-white drop-shadow">
            {show.title}
          </h1>
        </div>
      </div>

      <section className="-mt-5 space-y-4 px-4">
        {show.description && (
          <Card className="p-5">
            <p className="whitespace-pre-line text-sm font-medium leading-6 text-slate-600">
              {show.description}
            </p>
          </Card>
        )}

        {showTimes.length > 0 && (
          <Card className="p-5">
            <SectionTitle title="Horaires du jour" />
            <div className="space-y-2">
              {showTimes.map((time) => (
                <div
                  key={time.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3"
                >
                  <span className="font-black text-slate-950">
                    {formatTime(time.start_time)}
                    {time.end_time ? ` - ${formatTime(time.end_time)}` : ""}
                  </span>

                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: show.color || "#7c3aed" }}
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {showTimes.some((time) => time.note) && (
          <Card className="p-5">
            <SectionTitle title="Informations" />
            <div className="space-y-2">
              {showTimes
                .filter((time) => time.note)
                .map((time) => (
                  <div
                    key={`${time.id}-note`}
                    className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700"
                  >
                    {time.note}
                  </div>
                ))}
            </div>
          </Card>
        )}
      </section>
    </main>
  )
}
