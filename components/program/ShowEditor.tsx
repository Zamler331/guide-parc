"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { uploadImage } from "@/lib/storage"

export default function ShowEditor({ shows }: { shows: any[] }) {
  const router = useRouter()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [status, setStatus] = useState("active")
  const [loading, setLoading] = useState(false)
  const [color, setColor] = useState("#7c3aed")
  const [slug, setSlug] = useState("")

  const isEditing = Boolean(selectedId)

  function resetForm() {
    setSelectedId(null)
    setTitle("")
    setDescription("")
    setImageUrl("")
    setStatus("active")
    setColor("#7c3aed")
    setSlug("")
  }

  function selectShow(show: any) {
    setSelectedId(show.id)
    setTitle(show.title || "")
    setDescription(show.description || "")
    setImageUrl(show.image_url || "")
    setStatus(show.status || "active")
    setColor(show.color || "#7c3aed")
    setSlug(show.slug || "")
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0]
  if (!file) return

  try {
    setLoading(true)
    const url = await uploadImage(file)
    setImageUrl(url)
  } catch (error) {
    console.error(error)
    alert("Erreur lors de l’upload de l’image")
  } finally {
    setLoading(false)
  }
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) {
      alert("Le titre est obligatoire")
      return
    }

    setLoading(true)

    const payload = {
      title,
      description,
      image_url: imageUrl || null,
      status,
      is_recurring: true,
      color,
      slug,
    }

    const { error } = isEditing
      ? await supabase.from("shows").update(payload).eq("id", selectedId)
      : await supabase.from("shows").insert(payload)

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

    const { error } = await supabase.from("shows").delete().eq("id", selectedId)

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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {isEditing ? "Modifier le spectacle" : "Nouveau spectacle"}
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
          placeholder="Titre du spectacle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
        className="mt-3 w-full rounded-xl border p-3"
        placeholder="Slug ex: le-secret-des-pirates"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        />

        <textarea
          className="mt-3 w-full rounded-xl border p-3"
          rows={5}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="mt-3 space-y-2">
  <input
    type="file"
    accept="image/*"
    onChange={handleImageUpload}
    className="w-full rounded-xl border p-3"
  />

  <input
    className="w-full rounded-xl border p-3"
    placeholder="URL image"
    value={imageUrl}
    onChange={(e) => setImageUrl(e.target.value)}
  />
</div>

{imageUrl && (
  <div className="mt-3 overflow-hidden rounded-2xl border">
    <img src={imageUrl} alt="" className="h-40 w-full object-cover" />
  </div>
)}

        <label className="mt-3 block text-sm font-semibold text-gray-600">
        Couleur du spectacle
        </label>

        <input
        type="color"
        className="mt-1 h-12 w-full rounded-xl border p-2"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        />

        <select
          className="mt-3 w-full rounded-xl border p-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>

        <button
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Enregistrement..."
            : isEditing
            ? "Enregistrer les modifications"
            : "Créer le spectacle"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="mt-3 w-full rounded-xl bg-red-50 px-5 py-3 font-semibold text-red-700"
          >
            Supprimer le spectacle
          </button>
        )}
      </form>

      <div className="space-y-3">
        {shows.length === 0 ? (
          <div className="rounded-3xl bg-white p-5 text-gray-500 shadow-sm">
            Aucun spectacle pour le moment.
          </div>
        ) : (
          shows.map((show) => (
            <button
              key={show.id}
              type="button"
              onClick={() => selectShow(show)}
              className={`w-full rounded-3xl bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
                selectedId === show.id ? "ring-2 ring-gray-900" : ""
              }`}
            >
              <h3 className="font-bold text-gray-900">{show.title}</h3>

              <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                {show.description}
              </p>

              <span
                className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  show.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {show.status === "active" ? "Actif" : "Inactif"}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}