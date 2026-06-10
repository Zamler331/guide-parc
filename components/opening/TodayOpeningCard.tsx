function formatTime(time?: string | null) {
  if (!time) return ""
  return time.slice(0, 5).replace(":", "h")
}

export default function TodayOpeningCard({ opening }: { opening: any }) {
  if (!opening || !opening.schedule) {
  return (
    <div className="relative z-10 mt-3 rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold backdrop-blur">
      🕒 Aujourd'hui : parc fermé
    </div>
  )
}

  const schedule = opening.schedule

  return (
    <div className="relative z-10 mt-3 rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold backdrop-blur">
      {schedule.is_open ? (
        <p>
          🕒 Aujourd’hui : ouvert de {formatTime(schedule.opens_at)} à{" "}
          {formatTime(schedule.closes_at)}
        </p>
      ) : (
        <p>🕒 Aujourd’hui : parc fermé</p>
      )}

      {opening.note && (
        <p className="mt-1 text-xs font-medium text-blue-50/80">
          {opening.note}
        </p>
      )}
    </div>
  )
}