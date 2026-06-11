function formatTime(time?: string | null) {
  if (!time) return ""
  return time.slice(0, 5).replace(":", "h")
}

export default function TodayOpeningCard({ opening }: { opening: any }) {
  if (!opening || !opening.schedule) {
    return (
      <div className="relative z-10 mt-3 rounded-2xl bg-white/15 px-4 py-3 text-sm font-black text-white shadow-sm backdrop-blur">
        Aujourd'hui : parc ferme
      </div>
    )
  }

  const schedule = opening.schedule

  return (
    <div className="relative z-10 mt-3 rounded-2xl bg-white/15 px-4 py-3 text-sm font-black text-white shadow-sm backdrop-blur">
      {schedule.is_open ? (
        <p>
          Aujourd'hui : ouvert de {formatTime(schedule.opens_at)} a{" "}
          {formatTime(schedule.closes_at)}
        </p>
      ) : (
        <p>Aujourd'hui : parc ferme</p>
      )}

      {opening.note && (
        <p className="mt-1 text-xs font-semibold text-blue-50/85">
          {opening.note}
        </p>
      )}
    </div>
  )
}
