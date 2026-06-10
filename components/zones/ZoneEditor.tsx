"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function ZoneEditor({ zones }: { zones: any[] }) {
  const router = useRouter()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [color, setColor] = useState("#2563eb")
  const [description, setDescription] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  const isEditing = Boolean(selectedId)

  function resetForm() {
    setSelectedId(null)
    setName("")
    setColor("#2563eb")
    setDescription("")
    setSortOrder(0)
    setIsActive(true)
  }

  function selectZone(zone: any) {
    setSelectedId(zone.id)
    setName(zone.name || "")
    setColor(zone.color || "#2563eb")
    setDescription(zone.description || "")
    setSortOrder(zone.sort_order || 0)
    setIsActive(Boolean(zone.is_active))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim()) {
      alert("Le nom de la zone est obligatoire")
      return
    }

    const payload = {
      name,
      color,
      description: description || null,
      sort_order: sortOrder,
      is_active: isActive,
    }

    setLoading(true)

    const { error } = isEditing
      ? await supabase.from("park_areas").update(payload).eq("id", selectedId)
      : await supabase.from("park_areas").insert(payload)

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

    const confirmDelete = confirm(`Supprimer la zone "${name}" ?`)
    if (!confirmDelete) return

    const { error } = await supabase
      .from("park_areas")
      .delete()
      .eq("id", selectedId)

    if (error) {
      alert("Impossible de supprimer cette zone. Elle est peut-être utilisée.")
      console.error(error)
      return
    }

    resetForm()
    router.refresh()
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {isEditing ? "Modifier la zone" : "Nouvelle zone"}
          </h2>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600"
            >
              Nouvelle
            </button>
          )}
        </div>

        <input
          className="w-full rounded-xl border p-3"
          placeholder="Nom de la zone"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="mt-4 block text-sm font-semibold text-gray-600">
          Couleur
        </label>

        <input
          type="color"
          className="mt-1 h-12 w-full rounded-xl border p-2"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <textarea
          className="mt-3 w-full rounded-xl border p-3"
          rows={4}
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
          Zone active
        </label>

        <button
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-gray-900 p-3 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Enregistrement..."
            : isEditing
            ? "Enregistrer les modifications"
            : "Créer la zone"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="mt-3 w-full rounded-xl bg-red-50 p-3 font-semibold text-red-700"
          >
            Supprimer la zone
          </button>
        )}
      </form>

      <div className="space-y-3">
        {zones.length === 0 ? (
          <div className="rounded-3xl bg-white p-5 text-gray-500 shadow-sm">
            Aucune zone pour le moment.
          </div>
        ) : (
          zones.map((zone) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => selectZone(zone)}
              className={`w-full rounded-3xl bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
                selectedId === zone.id ? "ring-2 ring-gray-900" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className="h-12 w-12 shrink-0 rounded-2xl"
                  style={{ backgroundColor: zone.color || "#2563eb" }}
                />

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-900">{zone.name}</h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        zone.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {zone.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {zone.description && (
                    <p className="mt-2 text-sm text-gray-500">
                      {zone.description}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-gray-400">
                    Ordre : {zone.sort_order}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}