import Link from "next/link"
import Badge from "@/components/ui/Badge"

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
      className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition active:scale-[0.98]"
    >
      <div className="relative h-44 bg-slate-200">
        {show.image_url ? (
          <img
            src={show.image_url}
            alt={show.title}
            className="h-full w-full object-cover transition group-active:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-sm font-black uppercase text-white"
            style={{ backgroundColor: show.color || "#7c3aed" }}
          >
            Spectacle
          </div>
        )}

        <Badge className="absolute left-3 top-3 bg-white/95 text-slate-950 shadow-sm">
          {formatTime(showTime.start_time)}
          {showTime.end_time ? ` - ${formatTime(showTime.end_time)}` : ""}
        </Badge>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-4 pt-12">
          <h2 className="text-xl font-black leading-tight text-white drop-shadow">
            {show.title}
          </h2>
        </div>
      </div>

      <div className="p-4">
        {show.description && (
          <p className="line-clamp-2 text-sm font-medium leading-5 text-slate-600">
            {show.description}
          </p>
        )}

        {showTime.note && (
          <div className="mt-3 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
            {showTime.note}
          </div>
        )}

        <p className="mt-3 text-sm font-black text-slate-950">
          Voir le spectacle
        </p>
      </div>
    </Link>
  )
}
