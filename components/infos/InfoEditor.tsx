"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const ICONS = [
  "🕒",
  "🅿️",
  "🚻",
  "♿",
  "🍔",
  "🛍️",
  "🚭",
  "🐶",
  "🧒",
  "🩺",
  "🎟️",
  "📍",
  "🚗",
  "☔",
  "📞",
  "ℹ️",
]

export default function InfoEditor({ infos }: { infos: any[] }) {
  const router = useRouter()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [icon, setIcon] = useState("ℹ️")
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  const isEditing = Boolean(selectedId)

  function resetForm() {
    setSelectedId(null)
    setTitle("")
    setContent("")
    setIcon("ℹ️")
    setSortOrder(0)
    setIsActive(true)
  }

  function selectInfo(info: any) {
    setSelectedId(info.id)
    setTitle(info.title || "")
    setContent(info.content || "")
    setIcon(info.icon || "ℹ️")
    setSortOrder(info.sort_order || 0)
    setIsActive(Boolean(info.is_active))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert("Titre et contenu obligatoires")
      return
    }

    setLoading(true)

    const payload = {
      title,
      content,
      icon,
      sort_order: sortOrder,
      is_active: isActive,
    }

    const { error } = isEditing
      ? await supabase.from("practical_infos").update(payload).eq("id", selectedId)
      : await supabase.from("practical_infos").insert(payload)

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

    const confirmDelete = confirm(`Supprimer "${title}" ?`)
    if (!confirmDelete) return

    const { error } = await supabase
      .from("practical_infos")
      .delete()
      .eq("id", selectedId)

    if (error) {
      alert("Erreur lors de la suppression")
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
            {isEditing ? "Modifier l’info" : "Nouvelle info"}
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

        <label className="text-sm font-semibold text-gray-600">
          Icône
        </label>

        <div className="mt-2 grid grid-cols-8 gap-2">
          {ICONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setIcon(item)}
              className={`flex h-10 items-center justify-center rounded-xl border text-xl ${
                icon === item
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <input
          className="mt-4 w-full rounded-xl border p-3"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="mt-3 w-full rounded-xl border p-3"
          rows={6}
          placeholder="Contenu"
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
          Afficher cette info aux visiteurs
        </label>

        <button
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Enregistrement..."
            : isEditing
            ? "Enregistrer les modifications"
            : "Créer l’info"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="mt-3 w-full rounded-xl bg-red-50 px-5 py-3 font-semibold text-red-700"
          >
            Supprimer l’info
          </button>
        )}
      </form>

      <div className="space-y-3">
        {infos.length === 0 ? (
          <div className="rounded-3xl bg-white p-5 text-gray-500 shadow-sm">
            Aucune info pratique pour le moment.
          </div>
        ) : (
          infos.map((info) => (
            <button
              key={info.id}
              type="button"
              onClick={() => selectInfo(info)}
              className={`w-full rounded-3xl bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
                selectedId === info.id ? "ring-2 ring-gray-900" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                    {info.icon || "ℹ️"}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-gray-900">{info.title}</h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          info.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {info.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
                      {info.content}
                    </p>

                    <p className="mt-3 text-xs text-gray-400">
                      Ordre : {info.sort_order}
                    </p>
                  </div>
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