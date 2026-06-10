"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const COLORS = [
  "#f1f1f8",
  "#c69200",
  "#c4007a",
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#7c3aed",
  "#dc2626",
]

export default function OpeningScheduleEditor({
  schedules,
}: {
  schedules: any[]
}) {
  const router = useRouter()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [color, setColor] = useState("#c69200")
  const [isOpen, setIsOpen] = useState(true)
  const [opensAt, setOpensAt] = useState("10:00")
  const [closesAt, setClosesAt] = useState("18:30")
  const [description, setDescription] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  const isEditing = Boolean(selectedId)

  function resetForm() {
    setSelectedId(null)
    setName("")
    setColor("#c69200")
    setIsOpen(true)
    setOpensAt("10:00")
    setClosesAt("18:30")
    setDescription("")
    setSortOrder(0)
    setIsActive(true)
  }

  function selectSchedule(schedule: any) {
    setSelectedId(schedule.id)
    setName(schedule.name || "")
    setColor(schedule.color || "#c69200")
    setIsOpen(Boolean(schedule.is_open))
    setOpensAt(schedule.opens_at ? schedule.opens_at.slice(0, 5) : "10:00")
    setClosesAt(schedule.closes_at ? schedule.closes_at.slice(0, 5) : "18:30")
    setDescription(schedule.description || "")
    setSortOrder(schedule.sort_order || 0)
    setIsActive(Boolean(schedule.is_active))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      alert("Le nom du modèle est obligatoire")
      return
    }

    setLoading(true)

    const payload = {
      name,
      color,
      is_open: isOpen,
      opens_at: isOpen ? opensAt : null,
      closes_at: isOpen ? closesAt : null,
      description,
      sort_order: sortOrder,
      is_active: isActive,
    }

    const { error } = isEditing
      ? await supabase
          .from("opening_schedules")
          .update(payload)
          .eq("id", selectedId)
      : await supabase.from("opening_schedules").insert(payload)

    setLoading(false)

    if (error) {
      alert("Erreur lors de l’enregistrement")
      console.error(error)
      return
    }

    resetForm()
    router.refresh()
  }

  async function handleDelete() {
    if (!selectedId) return

    const confirmDelete = confirm(`Supprimer le modèle "${name}" ?`)
    if (!confirmDelete) return

    const { error } = await supabase
      .from("opening_schedules")
      .delete()
      .eq("id", selectedId)

    if (error) {
      alert("Impossible de supprimer ce modèle. Il est peut-être utilisé par des jours du calendrier.")
      console.error(error)
      return
    }

    resetForm()
    router.refresh()
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">
            {isEditing ? "Modifier le modèle" : "Nouveau modèle"}
          </h2>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600"
            >
              Nouveau
            </button>
          )}
        </div>

        <input
          className="w-full rounded-xl border p-3"
          placeholder="Nom du modèle ex: Nocturne"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="mt-4 block text-sm font-semibold text-gray-600">
          Couleur
        </label>

        <div className="mt-2 flex flex-wrap gap-2">
          {COLORS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setColor(item)}
              className={`h-9 w-9 rounded-full border-2 ${
                color === item ? "border-gray-900" : "border-white"
              }`}
              style={{ backgroundColor: item }}
            />
          ))}

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-12 rounded border"
          />
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-gray-600">
          <input
            type="checkbox"
            checked={isOpen}
            onChange={(e) => setIsOpen(e.target.checked)}
          />
          Parc ouvert avec ce modèle
        </label>

        {isOpen && (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="text-sm text-gray-600">
              Ouverture
              <input
                type="time"
                className="mt-1 w-full rounded-xl border p-3"
                value={opensAt}
                onChange={(e) => setOpensAt(e.target.value)}
              />
            </label>

            <label className="text-sm text-gray-600">
              Fermeture
              <input
                type="time"
                className="mt-1 w-full rounded-xl border p-3"
                value={closesAt}
                onChange={(e) => setClosesAt(e.target.value)}
              />
            </label>
          </div>
        )}

        <textarea
          className="mt-3 w-full rounded-xl border p-3"
          rows={3}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="number"
          className="mt-3 w-full rounded-xl border p-3"
          placeholder="Ordre d’affichage"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
        />

        <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-600">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Modèle actif
        </label>

        <button
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Enregistrement..."
            : isEditing
            ? "Enregistrer les modifications"
            : "Créer le modèle"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="mt-3 w-full rounded-xl bg-red-50 px-5 py-3 font-semibold text-red-700"
          >
            Supprimer le modèle
          </button>
        )}
      </form>

      <div className="space-y-3">
        {schedules.length === 0 ? (
          <div className="rounded-3xl bg-white p-5 text-gray-500 shadow-sm">
            Aucun modèle d’horaire.
          </div>
        ) : (
          schedules.map((schedule) => (
            <button
              key={schedule.id}
              type="button"
              onClick={() => selectSchedule(schedule)}
              className={`w-full rounded-3xl bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
                selectedId === schedule.id ? "ring-2 ring-gray-900" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className="h-12 w-12 shrink-0 rounded-2xl"
                  style={{ backgroundColor: schedule.color }}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-900">{schedule.name}</h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        schedule.is_open
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {schedule.is_open ? "Ouvert" : "Fermé"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        schedule.is_active
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {schedule.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    {schedule.is_open
                      ? `${schedule.opens_at?.slice(0, 5)} → ${schedule.closes_at?.slice(0, 5)}`
                      : "Parc fermé"}
                  </p>

                  {schedule.description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {schedule.description}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-gray-400">
                    Ordre : {schedule.sort_order}
                  </p>
                </div>

                <span className="text-gray-300">Modifier</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}