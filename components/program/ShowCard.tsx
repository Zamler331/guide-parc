import Link from "next/link"

function formatTime(time?: string | null) {
  if (!time) return ""
  return time.slice(0, 5).replace(":", "h")
}

export default function ShowCard({ showTime }: { showTime: any }) {
  const show = showTime.show

  if (!show) return null

  return (
    <Link
      href={`/programme/${show.slug}`}
      className="group block overflow-hidden rounded-3xl bg-white shadow-sm transition active:scale-[0.98]"
    >
      <div className="relative h-44 bg-gray-100">
        {show.image_url ? (
          <img
            src={show.image_url}
            alt={show.title}
            className="h-full w-full object-cover transition group-active:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-6xl text-white"
            style={{
              backgroundColor: show.color || "#7c3aed",
            }}
          >
            🎭
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-900">
          {formatTime(showTime.start_time)}
          {showTime.end_time
            ? ` → ${formatTime(showTime.end_time)}`
            : ""}
        </div>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
          <h2 className="text-xl font-black text-white drop-shadow">
            {show.title}
          </h2>
        </div>
      </div>

      <div className="p-4">
        {show.description && (
          <p className="line-clamp-2 text-sm text-gray-600">
            {show.description}
          </p>
        )}

        {showTime.note && (
          <div className="mt-3 rounded-2xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-600">
            {showTime.note}
          </div>
        )}

        <p className="mt-3 text-sm font-black text-gray-900">
          Voir le spectacle →
        </p>
      </div>
    </Link>
  )
}