function formatTime(time?: string | null) {
  if (!time) return ""
  return time.slice(0, 5).replace(":", "h")
}

export default function TodayOpeningCard({ opening }: { opening: any }) {
  if (!opening || !opening.schedule) {
    return (
      <div className="relative z-10 shrink-0 rounded-2xl bg-white/15 px-[clamp(0.75rem,2.8vw,1rem)] py-[clamp(0.45rem,1.4dvh,0.75rem)] text-[clamp(0.75rem,1.8dvh,0.875rem)] font-black leading-tight text-white shadow-sm backdrop-blur">
        Aujourd'hui : parc ferme
      </div>
    )
  }

  const schedule = opening.schedule

  return (
    <div className="relative z-10 shrink-0 rounded-2xl bg-white/15 px-[clamp(0.75rem,2.8vw,1rem)] py-[clamp(0.45rem,1.4dvh,0.75rem)] text-[clamp(0.75rem,1.8dvh,0.875rem)] font-black leading-tight text-white shadow-sm backdrop-blur">
      {schedule.is_open ? (
        <p>
          Aujourd'hui : ouvert de {formatTime(schedule.opens_at)} a{" "}
          {formatTime(schedule.closes_at)}
        </p>
      ) : (
        <p>Aujourd'hui : parc ferme</p>
      )}

      {opening.note && (
        <p className="mt-1 text-[clamp(0.68rem,1.55dvh,0.75rem)] font-semibold leading-tight text-blue-50/85">
          {opening.note}
        </p>
      )}
    </div>
  )
}
