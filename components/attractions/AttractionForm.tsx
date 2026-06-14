"use client"

import { useState } from "react"
import { createSupabaseAuthClient } from "@/lib/supabase-auth-client"
import { uploadImage } from "@/lib/storage"
import { useRouter } from "next/navigation"

export default function AttractionForm({ areas }: { areas: any[] }) {
  const router = useRouter()
  const supabase = createSupabaseAuthClient()

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")
  const [areaId, setAreaId] = useState("")
  const [loading, setLoading] = useState(false)

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

    if (!name.trim() || !slug.trim()) {
      alert("Nom et slug obligatoires")
      return
    }

    setLoading(true)

    const { error } = await supabase.from("attractions").insert({
      name,
      slug,
      image_url: imageUrl || null,
      short_description: shortDescription,
      description,
      area_id: areaId || null,
      status: "open",
    })

    setLoading(false)

    if (error) {
      alert("Erreur lors de l'ajout")
      console.error(error)
      return
    }

    setName("")
    setSlug("")
    setImageUrl("")
    setShortDescription("")
    setDescription("")
    setAreaId("")

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Ajouter une attraction</h2>

      <input
        className="w-full rounded-xl border p-3"
        placeholder="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="w-full rounded-xl border p-3"
        placeholder="Slug ex: le-grand-splash"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />

      <select
        className="w-full rounded-xl border p-3"
        value={areaId}
        onChange={(e) => setAreaId(e.target.value)}
      >
        <option value="">Choisir une zone</option>
        {areas.map((area) => (
          <option key={area.id} value={area.id}>
            {area.name}
          </option>
        ))}
      </select>

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

      {imageUrl && (
        <div className="overflow-hidden rounded-2xl border">
          <img src={imageUrl} alt="" className="h-40 w-full object-cover" />
        </div>
      )}

      <input
        className="w-full rounded-xl border p-3"
        placeholder="Description courte"
        value={shortDescription}
        onChange={(e) => setShortDescription(e.target.value)}
      />

      <textarea
        className="w-full rounded-xl border p-3"
        rows={5}
        placeholder="Description complète"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        disabled={loading}
        className="w-full rounded-xl bg-gray-900 p-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Enregistrement..." : "Ajouter"}
      </button>
    </form>
  )
}
