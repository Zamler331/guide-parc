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

function formatDateFr(dateKey: string) {
  return parseLocalDate(dateKey).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
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

export default function OpeningCalendarEditor({
  schedules,
  openingDays,
}: {
  schedules: any[]
  openingDays: any[]
}) {
  const router = useRouter()
  const currentYear = new Date().getFullYear()

  const [year, setYear] = useState(currentYear)
  const [editorMode, setEditorMode] = useState<"selection" | "edit">(
    "selection"
  )

  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [rangeStart, setRangeStart] = useState("")
  const [rangeEnd, setRangeEnd] = useState("")
  const [selectedWeekDays, setSelectedWeekDays] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 0,
  ])

  const [scheduleId, setScheduleId] = useState(schedules[0]?.id || "")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)

  const [editingDate, setEditingDate] = useState("")
  const [editingScheduleId, setEditingScheduleId] = useState(
    schedules[0]?.id || ""
  )
  const [editingNote, setEditingNote] = useState("")
  const [editingLoading, setEditingLoading] = useState(false)

  const openingDaysByDate = useMemo(() => {
    const map: Record<string, any> = {}

    openingDays.forEach((day) => {
      map[day.date] = day
    })

    return map
  }, [openingDays])

  function handleDayClick(dateKey: string) {
    if (editorMode === "selection") {
      toggleDate(dateKey)
      return
    }

    const openingDay = openingDaysByDate[dateKey]

    setEditingDate(dateKey)
    setEditingScheduleId(openingDay?.schedule_id || schedules[0]?.id || "")
    setEditingNote(openingDay?.note || "")
  }

  function toggleDate(dateKey: string) {
    setSelectedDates((current) =>
      current.includes(dateKey)
        ? current.filter((date) => date !== dateKey)
        : [...current, dateKey]
    )
  }

  function clearSelection() {
    setSelectedDates([])
    setNote("")
  }

  function toggleWeekDay(day: number) {
    setSelectedWeekDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day]
    )
  }

  function selectAllWeekDays() {
    setSelectedWeekDays([1, 2, 3, 4, 5, 6, 0])
  }

  function clearWeekDays() {
    setSelectedWeekDays([])
  }

  function addRangeToSelection() {
    if (!rangeStart || !rangeEnd) {
      alert("Choisis une date de début et une date de fin.")
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

    const datesToAdd: string[] = []
    const current = new Date(start)

    while (current <= end) {
      if (selectedWeekDays.includes(current.getDay())) {
        datesToAdd.push(toDateKey(current))
      }

      current.setDate(current.getDate() + 1)
    }

    setSelectedDates((currentSelection) =>
      Array.from(new Set([...currentSelection, ...datesToAdd]))
    )
  }

  async function applySchedule() {
    if (!scheduleId) {
      alert("Choisis un modèle d’horaire.")
      return
    }

    if (selectedDates.length === 0) {
      alert("Sélectionne au moins une date.")
      return
    }

    setLoading(true)

    const rows = selectedDates.map((date) => ({
      date,
      schedule_id: scheduleId,
      note: note || null,
    }))

    const { error } = await supabase
      .from("opening_days")
      .upsert(rows, { onConflict: "date" })

    setLoading(false)

    if (error) {
      alert("Erreur lors de l’application des horaires.")
      console.error(error)
      return
    }

    clearSelection()
    router.refresh()
  }

  async function saveEditingDay() {
    if (!editingDate) return

    if (!editingScheduleId) {
      alert("Choisis un modèle d’horaire.")
      return
    }

    setEditingLoading(true)

    const { error } = await supabase.from("opening_days").upsert(
      {
        date: editingDate,
        schedule_id: editingScheduleId,
        note: editingNote || null,
      },
      { onConflict: "date" }
    )

    setEditingLoading(false)

    if (error) {
      alert("Erreur lors de l’enregistrement du jour.")
      console.error(error)
      return
    }

    setEditingDate("")
    setEditingNote("")
    router.refresh()
  }

  async function deleteEditingDay() {
    if (!editingDate) return

    const confirmDelete = confirm(
      `Supprimer la configuration du ${formatDateFr(editingDate)} ?`
    )

    if (!confirmDelete) return

    setEditingLoading(true)

    const { error } = await supabase
      .from("opening_days")
      .delete()
      .eq("date", editingDate)

    setEditingLoading(false)

    if (error) {
      alert("Erreur lors de la suppression du jour.")
      console.error(error)
      return
    }

    setEditingDate("")
    setEditingNote("")
    router.refresh()
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <aside className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Calendrier</h2>

        <label className="mt-4 block text-sm font-semibold text-gray-600">
          Année
        </label>

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setYear((value) => value - 1)}
            className="rounded-xl bg-gray-100 px-3 py-2 font-semibold"
          >
            -
          </button>

          <div className="flex-1 rounded-xl border p-2 text-center font-bold">
            {year}
          </div>

          <button
            type="button"
            onClick={() => setYear((value) => value + 1)}
            className="rounded-xl bg-gray-100 px-3 py-2 font-semibold"
          >
            +
          </button>
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-gray-600">Mode</p>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setEditorMode("selection")}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                editorMode === "selection"
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              Sélection
            </button>

            <button
              type="button"
              onClick={() => setEditorMode("edit")}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                editorMode === "edit"
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              Édition
            </button>
          </div>
        </div>

        {editorMode === "selection" ? (
          <>
            <label className="mt-4 block text-sm font-semibold text-gray-600">
              Modèle à appliquer
            </label>

            <select
              className="mt-2 w-full rounded-xl border p-3"
              value={scheduleId}
              onChange={(e) => setScheduleId(e.target.value)}
            >
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.name}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-sm font-semibold text-gray-600">
              Note optionnelle
            </label>

            <textarea
              className="mt-2 w-full rounded-xl border p-3"
              rows={3}
              placeholder="Ex : nocturne spéciale, événement..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
              <p>
                <strong>{selectedDates.length}</strong> jour(s) sélectionné(s)
              </p>
            </div>

            <button
              type="button"
              onClick={applySchedule}
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading
                ? "Application..."
                : `Appliquer aux ${selectedDates.length} jour(s)`}
            </button>

            <button
              type="button"
              onClick={clearSelection}
              className="mt-3 w-full rounded-xl bg-gray-100 px-4 py-3 font-semibold text-gray-700"
            >
              Effacer la sélection
            </button>

            <div className="mt-6 rounded-2xl border p-4">
              <h3 className="font-bold">Sélection par période</h3>

              <label className="mt-3 block text-sm font-semibold text-gray-600">
                Date début
              </label>

              <input
                type="date"
                className="mt-1 w-full rounded-xl border p-3"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
              />

              <label className="mt-3 block text-sm font-semibold text-gray-600">
                Date fin
              </label>

              <input
                type="date"
                className="mt-1 w-full rounded-xl border p-3"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
              />

              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-600">
                  Jours concernés
                </p>

                <div className="mt-2 grid grid-cols-4 gap-2">
                  {WEEK_DAY_OPTIONS.map((day) => {
                    const active = selectedWeekDays.includes(day.value)

                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleWeekDay(day.value)}
                        className={`rounded-xl border px-2 py-2 text-sm font-semibold ${
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

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllWeekDays}
                    className="flex-1 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700"
                  >
                    Tous
                  </button>

                  <button
                    type="button"
                    onClick={clearWeekDays}
                    className="flex-1 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700"
                  >
                    Aucun
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={addRangeToSelection}
                className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
              >
                Ajouter la période à la sélection
              </button>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border p-4">
            <h3 className="font-bold">Édition rapide</h3>

            {!editingDate ? (
              <p className="mt-2 text-sm text-gray-500">
                Cliquez sur un jour du calendrier pour le modifier.
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm font-semibold text-gray-700">
                  {formatDateFr(editingDate)}
                </p>

                <label className="mt-4 block text-sm font-semibold text-gray-600">
                  Modèle
                </label>

                <select
                  className="mt-2 w-full rounded-xl border p-3"
                  value={editingScheduleId}
                  onChange={(e) => setEditingScheduleId(e.target.value)}
                >
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.name}
                    </option>
                  ))}
                </select>

                <label className="mt-4 block text-sm font-semibold text-gray-600">
                  Note
                </label>

                <textarea
                  className="mt-2 w-full rounded-xl border p-3"
                  rows={3}
                  placeholder="Note optionnelle"
                  value={editingNote}
                  onChange={(e) => setEditingNote(e.target.value)}
                />

                <button
                  type="button"
                  onClick={saveEditingDay}
                  disabled={editingLoading}
                  className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {editingLoading ? "Enregistrement..." : "Enregistrer"}
                </button>

                <button
                  type="button"
                  onClick={deleteEditingDay}
                  disabled={editingLoading}
                  className="mt-3 w-full rounded-xl bg-red-50 px-4 py-3 font-semibold text-red-700 disabled:opacity-50"
                >
                  Supprimer la configuration
                </button>
              </>
            )}
          </div>
        )}

        <div className="mt-6">
          <h3 className="font-bold">Légende</h3>

          <div className="mt-3 space-y-2">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center gap-2 text-sm">
                <span
                  className="h-4 w-4 rounded-full border"
                  style={{ backgroundColor: schedule.color }}
                />
                <span>{schedule.name}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {MONTHS.map((monthName, monthIndex) => {
          const days = getDaysInMonth(year, monthIndex)
          const offset = getMondayFirstOffset(days[0])

          return (
            <div key={monthName} className="rounded-3xl bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-center font-black uppercase tracking-wide">
                {monthName}
              </h3>

              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400">
                {WEEK_DAYS.map((day, index) => (
                  <div key={`${day}-${index}`}>{day}</div>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-1">
                {Array.from({ length: offset }).map((_, index) => (
                  <div key={`empty-${index}`} />
                ))}

                {days.map((date) => {
                  const dateKey = toDateKey(date)
                  const openingDay = openingDaysByDate[dateKey]
                  const schedule = openingDay?.schedule
                  const selected = selectedDates.includes(dateKey)
                  const editing = editingDate === dateKey

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      onClick={() => handleDayClick(dateKey)}
                      className={`relative flex aspect-square items-center justify-center rounded-lg border text-xs font-bold transition ${
                        selected
                          ? "border-gray-900 ring-2 ring-gray-900"
                          : editing
                          ? "border-blue-700 ring-2 ring-blue-700"
                          : "border-gray-100"
                      }`}
                      style={{
                        backgroundColor: schedule?.color || "#ffffff",
                        color: schedule?.color ? "#111827" : "#6b7280",
                      }}
                      title={
                        schedule
                          ? `${dateKey} - ${schedule.name}`
                          : `${dateKey} - non configuré`
                      }
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}