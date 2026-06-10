"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const WEEK_DAY_OPTIONS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mer" },
  { value: 4, label: "Jeu" },
  { value: 5, label: "Ven" },
  { value: 6, label: "Sam" },
  { value: 0, label: "Dim" },
]

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function parseLocalDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export default function ShowTimeGenerator({ shows }: { shows: any[] }) {
  const router = useRouter()

  const [showId, setShowId] = useState(shows[0]?.id || "")
  const [rangeStart, setRangeStart] = useState("")
  const [rangeEnd, setRangeEnd] = useState("")
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([
    1, 2, 3, 4, 5,
  ])
  const [startTime, setStartTime] = useState("14:00")
  const [endTime, setEndTime] = useState("14:30")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)

  function toggleWeekDay(day: number) {
    setSelectedWeekDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day]
    )
  }

  function selectWeekDays() {
    setSelectedWeekDays([1, 2, 3, 4, 5])
  }

  function selectWeekend() {
    setSelectedWeekDays([6, 0])
  }

  function selectAllDays() {
    setSelectedWeekDays([1, 2, 3, 4, 5, 6, 0])
  }

  async function generateShowTimes(e: React.FormEvent) {
    e.preventDefault()

    if (!showId || !rangeStart || !rangeEnd || !startTime) {
      alert("Spectacle, période et heure de début sont obligatoires.")
      return
    }

    if (selectedWeekDays.length === 0) {
      alert("Choisis au moins un jour de semaine.")
      return
    }

    const start = parseLocalDate(rangeStart)
    const end = parseLocalDate(rangeEnd)

    if (start > end) {
      alert("La date de début doit être avant la date de fin.")
      return
    }

    const rows = []
    const current = new Date(start)

    while (current <= end) {
      if (selectedWeekDays.includes(current.getDay())) {
        rows.push({
          show_id: showId,
          show_date: toDateKey(current),
          start_time: startTime,
          end_time: endTime || null,
          note: note || null,
          is_active: true,
        })
      }

      current.setDate(current.getDate() + 1)
    }

    if (rows.length === 0) {
      alert("Aucune représentation à créer avec ces critères.")
      return
    }

    const confirmCreate = confirm(
      `Créer ${rows.length} représentation(s) ?`
    )

    if (!confirmCreate) return

    setLoading(true)

    const { error } = await supabase.from("show_times").insert(rows)

    setLoading(false)

    if (error) {
      alert("Erreur lors de la génération des représentations.")
      console.error(error)
      return
    }

    setNote("")
    router.refresh()
  }

  return (
    <form onSubmit={generateShowTimes} className="rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Générer des représentations</h2>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-sm font-semibold text-gray-600">
          Spectacle
          <select
            className="mt-1 w-full rounded-xl border p-3"
            value={showId}
            onChange={(e) => setShowId(e.target.value)}
          >
            {shows.map((show) => (
              <option key={show.id} value={show.id}>
                {show.title}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold text-gray-600">
          Note optionnelle
          <input
            className="mt-1 w-full rounded-xl border p-3"
            placeholder="Ex : version spéciale Halloween"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-sm font-semibold text-gray-600">
          Date début
          <input
            type="date"
            className="mt-1 w-full rounded-xl border p-3"
            value={rangeStart}
            onChange={(e) => setRangeStart(e.target.value)}
          />
        </label>

        <label className="text-sm font-semibold text-gray-600">
          Date fin
          <input
            type="date"
            className="mt-1 w-full rounded-xl border p-3"
            value={rangeEnd}
            onChange={(e) => setRangeEnd(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-gray-600">
          Jours concernés
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {WEEK_DAY_OPTIONS.map((day) => {
            const active = selectedWeekDays.includes(day.value)

            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleWeekDay(day.value)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                  active
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600"
                }`}
              >
                {day.label}
              </button>
            )
          })}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectWeekDays}
            className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700"
          >
            Lun-Ven
          </button>

          <button
            type="button"
            onClick={selectWeekend}
            className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700"
          >
            Week-end
          </button>

          <button
            type="button"
            onClick={selectAllDays}
            className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700"
          >
            Tous les jours
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-sm font-semibold text-gray-600">
          Heure début
          <input
            type="time"
            className="mt-1 w-full rounded-xl border p-3"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>

        <label className="text-sm font-semibold text-gray-600">
          Heure fin
          <input
            type="time"
            className="mt-1 w-full rounded-xl border p-3"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </label>
      </div>

      <button
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Génération..." : "Générer les représentations"}
      </button>
    </form>
  )
}