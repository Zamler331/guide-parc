"use client"

import { useMemo, useState } from "react"
import Card from "@/components/ui/Card"
import SectionTitle from "@/components/ui/SectionTitle"

const MONTHS = [
  "Janvier",
  "Fevrier",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Aout",
  "Septembre",
  "Octobre",
  "Novembre",
  "Decembre",
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

export default function VisitorOpeningCalendar({
  year,
  openingDays,
}: {
  year: number
  openingDays: any[]
}) {
  const [month, setMonth] = useState(new Date().getMonth())

  const openingDaysByDate = useMemo(() => {
    const map: Record<string, any> = {}

    openingDays.forEach((day) => {
      map[day.date] = day
    })

    return map
  }, [openingDays])

  const days = getDaysInMonth(year, month)
  const offset = getMondayFirstOffset(days[0])

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => setMonth((value) => (value === 0 ? 11 : value - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-lg font-black text-slate-700 active:scale-95"
          aria-label="Mois precedent"
        >
          {"<"}
        </button>

        <h2 className="text-center text-xl font-black leading-tight text-slate-950">
          {MONTHS[month]} {year}
        </h2>

        <button
          onClick={() => setMonth((value) => (value === 11 ? 0 : value + 1))}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-lg font-black text-slate-700 active:scale-95"
          aria-label="Mois suivant"
        >
          {">"}
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-slate-400">
        {WEEK_DAYS.map((day, index) => (
          <div key={`${day}-${index}`}>{day}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {Array.from({ length: offset }).map((_, index) => (
          <div key={index} />
        ))}

        {days.map((date) => {
          const dateKey = toDateKey(date)
          const openingDay = openingDaysByDate[dateKey]
          const schedule = openingDay?.schedule

          return (
            <div
              key={dateKey}
              className="flex aspect-square items-center justify-center rounded-xl border border-slate-100 text-xs font-black text-slate-900"
              style={{
                backgroundColor: schedule?.color || "#ffffff",
              }}
              title={
                schedule
                  ? `${schedule.name}${openingDay?.note ? ` - ${openingDay.note}` : ""}`
                  : "Non configure"
              }
            >
              {date.getDate()}
            </div>
          )
        })}
      </div>

      <div className="mt-6">
        <SectionTitle title="Legende" />

        <div className="flex flex-wrap gap-3">
          {Array.from(
            new Map(
              openingDays
                .filter((day) => day.schedule)
                .map((day) => [day.schedule.id, day.schedule])
            ).values()
          ).map((schedule: any) => (
            <div
              key={schedule.id}
              className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              <span
                className="h-4 w-4 rounded-full border border-slate-200"
                style={{ backgroundColor: schedule.color }}
              />
              <span>{schedule.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
