export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"

import {
  getShowBySlug,
  getTodayShowTimesForShow,
} from "@/lib/shows"

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
  const showTimes = await getTodayShowTimesForShow(show.id)

  return (
    <main className="min-h-screen bg-gray-100 pb-6">
      <div className="relative h-56 bg-gray-300">
        {show.image_url ? (
          <img
            src={show.image_url}
            alt={show.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-7xl text-white"
            style={{
              backgroundColor: show.color || "#7c3aed",
            }}
          >
            🎭
          </div>
        )}

        <Link
          href="/programme"
          className="absolute left-4 top-4 z-50 flex h-11 items-center rounded-full bg-white px-4 font-bold text-gray-900 shadow-lg"
        >
          ◀ Programme
        </Link>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-20">
          <h1 className="text-3xl font-black text-white drop-shadow">
            {show.title}
          </h1>
        </div>
      </div>

      <section className="-mt-6 rounded-t-[2rem] bg-white p-5 shadow-lg">
        {show.description && (
          <p className="whitespace-pre-line text-gray-700">
            {show.description}
          </p>
        )}

        {showTimes.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-black text-gray-900">
              Horaires du jour
            </h2>

            <div className="space-y-2">
              {showTimes.map((time) => (
                <div
                  key={time.id}
                  className="flex items-center justify-between rounded-2xl bg-gray-100 px-4 py-3"
                >
                  <span className="font-bold text-gray-900">
                    {formatTime(time.start_time)}
                    {time.end_time
                      ? ` → ${formatTime(time.end_time)}`
                      : ""}
                  </span>

                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        show.color || "#7c3aed",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {showTimes.some((time) => time.note) && (
          <div className="mt-6">
            <h2 className="mb-3 text-lg font-black text-gray-900">
              Informations
            </h2>

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
          </div>
        )}
      </section>
    </main>
  )
}