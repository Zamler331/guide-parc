"use client"

import { useMemo, useState } from "react"

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
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() =>
            setMonth((value) => (value === 0 ? 11 : value - 1))
          }
          className="rounded-xl bg-gray-100 px-3 py-2"
        >
          ←
        </button>

        <h2 className="text-xl font-black">
          {MONTHS[month]} {year}
        </h2>

        <button
          onClick={() =>
            setMonth((value) => (value === 11 ? 0 : value + 1))
          }
          className="rounded-xl bg-gray-100 px-3 py-2"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400">
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
              className="flex aspect-square items-center justify-center rounded-lg text-xs font-bold"
              style={{
                backgroundColor: schedule?.color || "#ffffff",
              }}
              title={
                schedule
                  ? `${schedule.name}${openingDay?.note ? ` - ${openingDay.note}` : ""}`
                  : "Non configuré"
              }
            >
              {date.getDate()}
            </div>
          )
        })}
      </div>

      <div className="mt-6">
        <h3 className="font-bold">Légende</h3>

        <div className="mt-3 flex flex-wrap gap-3">
          {Array.from(
            new Map(
              openingDays
                .filter((day) => day.schedule)
                .map((day) => [day.schedule.id, day.schedule])
            ).values()
          ).map((schedule: any) => (
            <div
              key={schedule.id}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: schedule.color }}
              />

              <span>{schedule.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}