"use client"

import { useMemo, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"]

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getDaysInMonth(year: number, month: number) {
  const days = []
  const date = new Date(year, month, 1)

  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }

  return days
}

function getMondayFirstOffset(date: Date) {
  const day = date.getDay()
  return day === 0 ? 6 : day - 1
}

function formatTime(time?: string | null) {
  if (!time) return ""
  return time.slice(0, 5).replace(":", "h")
}

export default function ShowTimeCalendar({ showTimes }: { showTimes: any[] }) {
  const router = useRouter()

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const showTimesByDate = useMemo(() => {
    const map: Record<string, any[]> = {}

    showTimes.forEach((time) => {
      if (!map[time.show_date]) {
        map[time.show_date] = []
      }

      map[time.show_date].push(time)
    })

    Object.keys(map).forEach((date) => {
      map[date].sort((a, b) =>
        String(a.start_time).localeCompare(String(b.start_time))
      )
    })

    return map
  }, [showTimes])

  function previousMonth() {
    if (month === 0) {
      setMonth(11)
      setYear((value) => value - 1)
    } else {
      setMonth((value) => value - 1)
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0)
      setYear((value) => value + 1)
    } else {
      setMonth((value) => value + 1)
    }
  }

  async function deleteShowTime(id: string) {
    const confirmDelete = confirm("Supprimer cette représentation ?")
    if (!confirmDelete) return

    const { error } = await supabase
      .from("show_times")
      .delete()
      .eq("id", id)

    if (error) {
      alert("Erreur lors de la suppression")
      console.error(error)
      return
    }

    router.refresh()
  }

  const days = getDaysInMonth(year, month)
  const offset = getMondayFirstOffset(days[0])

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={previousMonth}
          className="rounded-xl bg-gray-100 px-3 py-2 font-semibold"
        >
          ←
        </button>

        <h2 className="text-xl font-black">
          {MONTHS[month]} {year}
        </h2>

        <button
          type="button"
          onClick={nextMonth}
          className="rounded-xl bg-gray-100 px-3 py-2 font-semibold"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400">
        {WEEK_DAYS.map((day, index) => (
          <div key={`${day}-${index}`}>{day}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {Array.from({ length: offset }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {days.map((date) => {
          const dateKey = toDateKey(date)
          const times = showTimesByDate[dateKey] || []
          const isToday = toDateKey(new Date()) === dateKey

          return (
            <div
              key={dateKey}
              className={`min-h-28 rounded-2xl border p-2 ${
                isToday ? "border-gray-900 bg-gray-50" : "border-gray-100"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                    isToday
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {date.getDate()}
                </span>

                {times.length > 0 && (
                  <span className="text-xs font-semibold text-gray-400">
                    {times.length}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {times.map((time) => (
                  <div
                    key={time.id}
                    className="group rounded-xl px-2 py-1 text-xs"
                    style={{
                    backgroundColor: `${time.show?.color || "#7c3aed"}22`,
                    color: time.show?.color || "#7c3aed",
                    opacity: time.show?.status === "inactive" ? 0.45 : 1,
                    }}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <p className="font-bold">
                          {formatTime(time.start_time)}
                        </p>

                        <p className="truncate">
                          {time.show?.title || "Spectacle"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteShowTime(time.id)}
                        className="rounded bg-white/70 px-1 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>

                    {time.note && (
                      <p className="mt-1 truncate text-[10px] text-purple-600">
                        {time.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}