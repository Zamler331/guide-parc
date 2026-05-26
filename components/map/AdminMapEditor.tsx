"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const TYPES = [
  { value: "attraction", label: "Attraction" },
  { value: "restaurant", label: "Restaurant" },
  { value: "shop", label: "Boutique" },
  { value: "toilet", label: "Toilettes" },
  { value: "first_aid", label: "Secours" },
  { value: "parking", label: "Parking" },
  { value: "show", label: "Spectacle" },
]

export default function AdminMapEditor({
  points,
  attractions,
}: {
  points: any[]
  attractions: any[]
}) {
  const router = useRouter()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [x, setX] = useState<number | null>(null)
  const [y, setY] = useState<number | null>(null)
  const [name, setName] = useState("")
  const [type, setType] = useState("attraction")
  const [targetUrl, setTargetUrl] = useState("")
  const [attractionSlug, setAttractionSlug] = useState("")

  const selectedPoint = points.find((p) => p.id === selectedId)

  function resetForm() {
    setSelectedId(null)
    setX(null)
    setY(null)
    setName("")
    setType("attraction")
    setTargetUrl("")
    setAttractionSlug("")
  }

  function selectPoint(point: any) {
    setSelectedId(point.id)
    setX(point.x)
    setY(point.y)
    setName(point.name || "")
    setType(point.type || "attraction")
    setTargetUrl(point.target_url || "")

    if (point.type === "attraction" && point.target_url) {
      setAttractionSlug(point.target_url.replace("/attractions/", ""))
    } else {
      setAttractionSlug("")
    }
  }

  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()

    const clickX = ((e.clientX - rect.left) / rect.width) * 100
    const clickY = ((e.clientY - rect.top) / rect.height) * 100

    setX(Number(clickX.toFixed(2)))
    setY(Number(clickY.toFixed(2)))
  }

  function handleTypeChange(value: string) {
    setType(value)

    if (value !== "attraction") {
      setAttractionSlug("")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (x === null || y === null) {
      alert("Clique d’abord sur la carte pour placer le point.")
      return
    }

    if (!name.trim()) {
      alert("Ajoute un nom au point.")
      return
    }

    const finalTargetUrl =
      type === "attraction" && attractionSlug
        ? `/attractions/${attractionSlug}`
        : targetUrl || null

    const payload = {
      name,
      type,
      x,
      y,
      target_url: finalTargetUrl,
      is_active: true,
    }

    const { error } = selectedId
      ? await supabase.from("map_points").update(payload).eq("id", selectedId)
      : await supabase.from("map_points").insert(payload)

    if (error) {
      alert("Erreur lors de l’enregistrement du point")
      console.error(error)
      return
    }

    resetForm()
    router.refresh()
  }

  async function handleDelete() {
    if (!selectedId) return

    const confirmDelete = confirm(`Supprimer le point "${name}" ?`)
    if (!confirmDelete) return

    const { error } = await supabase
      .from("map_points")
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
    <div className="space-y-4">
      <div
        onClick={handleMapClick}
        className="relative overflow-hidden rounded-2xl border bg-gray-100"
      >
        <img
          src="/map.png"
          alt="Plan du parc"
          className="block w-full select-none"
          draggable={false}
        />

        {points.map((point) => {
          const isSelected = selectedId === point.id

          return (
            <button
              key={point.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                selectPoint(point)
              }}
              className={`absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow ${
                isSelected ? "bg-black ring-4 ring-white" : "bg-red-500"
              }`}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
              }}
              title={point.name}
            />
          )
        })}

        {x !== null && y !== null && !selectedPoint && (
          <span
            className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black shadow"
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
          />
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            {selectedId ? "Modifier le point" : "Ajouter un point"}
          </h2>

          {selectedId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
            >
              Nouveau
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500">
          Position : {x ?? "-"} / {y ?? "-"}
        </p>

        <input
          className="w-full rounded-lg border p-2"
          placeholder="Nom du point"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="w-full rounded-lg border p-2"
          value={type}
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          {TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        {type === "attraction" ? (
          <select
            className="w-full rounded-lg border p-2"
            value={attractionSlug}
            onChange={(e) => {
              const slug = e.target.value
              setAttractionSlug(slug)
              setTargetUrl(slug ? `/attractions/${slug}` : "")
            }}
          >
            <option value="">Choisir une attraction</option>

            {attractions.map((attr) => (
              <option key={attr.id} value={attr.slug}>
                {attr.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            className="w-full rounded-lg border p-2"
            placeholder="Lien cible ex: /programme"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
          />
        )}

        <button className="w-full rounded-xl bg-black p-3 font-semibold text-white">
          {selectedId ? "Enregistrer les modifications" : "Enregistrer le point"}
        </button>

        {selectedId && (
          <button
            type="button"
            onClick={handleDelete}
            className="w-full rounded-xl bg-red-50 p-3 font-semibold text-red-700"
          >
            Supprimer le point
          </button>
        )}
      </form>
    </div>
  )
}