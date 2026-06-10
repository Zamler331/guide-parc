"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function AlertForm() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState("info")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      alert("Titre et message obligatoires")
      return
    }

    setLoading(true)

    const { error } = await supabase.from("alerts").insert({
      title,
      message,
      type,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      is_active: true,
    })

    setLoading(false)

    if (error) {
      alert("Erreur lors de la création")
      console.error(error)
      return
    }

    setTitle("")
    setMessage("")
    setType("info")
    setStartsAt("")
    setEndsAt("")

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold">Nouvelle alerte</h2>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="rounded-xl border p-3"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="rounded-xl border p-3"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="info">Info</option>
          <option value="warning">Attention</option>
          <option value="danger">Urgent</option>
          <option value="success">Succès</option>
        </select>
      </div>

      <textarea
        className="mt-3 w-full rounded-xl border p-3"
        rows={4}
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-sm text-gray-600">
          Début d’affichage
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-xl border p-3"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </label>

        <label className="text-sm text-gray-600">
          Fin d’affichage
          <input
            type="datetime-local"
            className="mt-1 w-full rounded-xl border p-3"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </label>
      </div>

      <button
        disabled={loading}
        className="mt-4 rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Création..." : "Créer l’alerte"}
      </button>
    </form>
  )
}