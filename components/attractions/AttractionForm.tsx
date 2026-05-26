"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function AttractionForm({ areas }: { areas: any[] }) {
  const router = useRouter()

  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")
  const [areaId, setAreaId] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const { error } = await supabase.from("attractions").insert({
  name,
  slug,
  short_description: shortDescription,
  description,
  area_id: areaId || null,
  status: "open",
})

    if (error) {
      alert("Erreur lors de l'ajout")
      console.error(error)
      return
    }

    setName("")
    setSlug("")
    setShortDescription("")
    setDescription("")

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border p-4">
      <h2 className="text-lg font-semibold">Ajouter une attraction</h2>

      <input
        className="w-full rounded-lg border p-2"
        placeholder="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="w-full rounded-lg border p-2"
        placeholder="Slug ex: le-grand-splash"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />

      <select
        className="w-full rounded-lg border p-2"
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
        className="w-full rounded-lg border p-2"
        placeholder="Description courte"
        value={shortDescription}
        onChange={(e) => setShortDescription(e.target.value)}
      />

      <textarea
        className="w-full rounded-lg border p-2"
        placeholder="Description complète"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button className="w-full rounded-xl bg-black p-3 font-semibold text-white">
        Ajouter
      </button>
    </form>
  )
}