"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { uploadImage } from "@/lib/storage"
import { useRouter } from "next/navigation"

export default function AttractionEditor({
  attractions,
  areas,
}: {
  attractions: any[]
  areas: any[]
}) {
  const router = useRouter()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [description, setDescription] = useState("")
  const [areaId, setAreaId] = useState("")
  const [status, setStatus] = useState("open")
  const [loading, setLoading] = useState(false)
  const [minHeight, setMinHeight] = useState("")
  const [isFamily, setIsFamily] = useState(false)
  const [isThrill, setIsThrill] = useState(false)
  const [isKids, setIsKids] = useState(false)
  const [isAccessiblePmr, setIsAccessiblePmr] = useState(false)
  const [openingYear, setOpeningYear] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [rideDuration, setRideDuration] = useState("")
  const [thrillLevel, setThrillLevel] = useState("3")
  const [rideType, setRideType] = useState("")
  const [accompaniedHeight, setAccompaniedHeight] = useState("")
  const [locationHint, setLocationHint] = useState("")

  const isEditing = Boolean(selectedId)

  function resetForm() {
    setSelectedId(null)
    setName("")
    setSlug("")
    setImageUrl("")
    setShortDescription("")
    setDescription("")
    setAreaId("")
    setStatus("open")
    setMinHeight("")
    setIsFamily(false)
    setIsThrill(false)
    setIsKids(false)
    setIsAccessiblePmr(false)
    setOpeningYear("")
    setManufacturer("")
    setRideDuration("")
    setThrillLevel("3")
    setRideType("")
    setAccompaniedHeight("")
    setLocationHint("")
  }

  function selectAttraction(attraction: any) {
    setSelectedId(attraction.id)
    setName(attraction.name || "")
    setSlug(attraction.slug || "")
    setImageUrl(attraction.image_url || "")
    setShortDescription(attraction.short_description || "")
    setDescription(attraction.description || "")
    setAreaId(attraction.area_id || "")
    setStatus(attraction.status || "open")
    setMinHeight(attraction.min_height || "")
    setIsFamily(Boolean(attraction.is_family))
    setIsThrill(Boolean(attraction.is_thrill))
    setIsKids(Boolean(attraction.is_kids))
    setIsAccessiblePmr(Boolean(attraction.is_accessible_pmr))
    setOpeningYear(attraction.opening_year || "")
    setManufacturer(attraction.manufacturer || "")
    setRideDuration(attraction.ride_duration || "")
    setThrillLevel(String(attraction.thrill_level || 3))
    setRideType(attraction.ride_type || "")
    setAccompaniedHeight(attraction.accompanied_height || "")
    setLocationHint(attraction.location_hint || "")
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

    if (!name.trim() || !slug.trim()) {
      alert("Nom et slug obligatoires")
      return
    }

    const payload = {
      name,
      slug,
      image_url: imageUrl || null,
      short_description: shortDescription || null,
      description: description || null,
      area_id: areaId || null,
      status,
      min_height: minHeight ? Number(minHeight) : null,
      is_family: isFamily,
      is_thrill: isThrill,
      is_kids: isKids,
      is_accessible_pmr: isAccessiblePmr,
      opening_year: openingYear ? Number(openingYear) : null,
      manufacturer: manufacturer || null,
      ride_duration: rideDuration || null,
      thrill_level: Number(thrillLevel),
      ride_type: rideType || null,
      accompanied_height: accompaniedHeight
      ? Number(accompaniedHeight)
      : null,
      location_hint: locationHint || null,
    }

    setLoading(true)

    const { error } = isEditing
      ? await supabase.from("attractions").update(payload).eq("id", selectedId)
      : await supabase.from("attractions").insert(payload)

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

    const confirmDelete = confirm(`Supprimer l’attraction "${name}" ?`)
    if (!confirmDelete) return

    const { error } = await supabase
      .from("attractions")
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
          <div>
            <h2 className="text-lg font-bold">
              {isEditing ? "Modifier l’attraction" : "Nouvelle attraction"}
            </h2>
            <p className="text-sm text-gray-500">
              {isEditing ? "Modifiez les informations existantes." : "Ajoutez une attraction au guide."}
            </p>
          </div>

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
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="mt-3 w-full rounded-xl border p-3"
          placeholder="Slug ex: le-grand-splash"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />

        <select
          className="mt-3 w-full rounded-xl border p-3"
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

        <select
          className="mt-3 w-full rounded-xl border p-3"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="open">Ouverte</option>
          <option value="closed">Fermée</option>
          <option value="maintenance">Maintenance</option>
          <option value="hidden">Masquée</option>
        </select>

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

        <input
          className="mt-3 w-full rounded-xl border p-3"
          placeholder="Description courte"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />

        <textarea
          className="mt-3 w-full rounded-xl border p-3"
          rows={5}
          placeholder="Description complète"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="mt-4 rounded-2xl border p-4">
  <h3 className="font-bold text-gray-900">
    Caractéristiques & accès
  </h3>

  <input
    type="number"
    className="mt-3 w-full rounded-xl border p-3"
    placeholder="Taille minimum accompagné"
    value={minHeight}
    onChange={(e) => setMinHeight(e.target.value)}
  />

  <input
    type="number"
    className="mt-3 w-full rounded-xl border p-3"
    placeholder="Taille minimum seul"
    value={accompaniedHeight}
    onChange={(e) => setAccompaniedHeight(e.target.value)}
  />

  <div className="mt-3 grid gap-2 text-sm font-semibold text-gray-600">
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={isFamily}
        onChange={(e) => setIsFamily(e.target.checked)}
      />
      Attraction familiale
    </label>

    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={isThrill}
        onChange={(e) => setIsThrill(e.target.checked)}
      />
      Sensations fortes
    </label>

    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={isKids}
        onChange={(e) => setIsKids(e.target.checked)}
      />
      Adaptée aux enfants
    </label>

    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={isAccessiblePmr}
        onChange={(e) => setIsAccessiblePmr(e.target.checked)}
      />
      Accessible PMR
    </label>
  </div>
</div>

<div className="mt-4 rounded-2xl border p-4">
  <h3 className="font-bold text-gray-900">
    Informations attraction
  </h3>

  <input
    className="mt-3 w-full rounded-xl border p-3"
    placeholder="Type d'attraction"
    value={rideType}
    onChange={(e) => setRideType(e.target.value)}
  />

  <input
    className="mt-3 w-full rounded-xl border p-3"
    placeholder="Constructeur"
    value={manufacturer}
    onChange={(e) => setManufacturer(e.target.value)}
  />

  <input
    type="number"
    className="mt-3 w-full rounded-xl border p-3"
    placeholder="Année d'ouverture"
    value={openingYear}
    onChange={(e) => setOpeningYear(e.target.value)}
  />

  <input
    className="mt-3 w-full rounded-xl border p-3"
    placeholder="Durée du parcours (ex: 2 min 30)"
    value={rideDuration}
    onChange={(e) => setRideDuration(e.target.value)}
  />

  <div className="mt-3">
  <p className="text-sm font-semibold text-gray-600">
    Niveau de sensations
  </p>

  <div className="mt-2 grid gap-2">
    {[1, 2, 3, 4, 5].map((level) => (
      <button
        key={level}
        type="button"
        onClick={() => setThrillLevel(String(level))}
        className={`rounded-xl border p-3 text-left text-sm font-semibold ${
          Number(thrillLevel) === level
            ? "border-gray-900 bg-gray-900 text-white"
            : "border-gray-200 bg-white text-gray-600"
        }`}
      >
        {"★".repeat(level)}
        {"☆".repeat(5 - level)}
        <span className="ml-2">
          {level === 1 && "Très doux"}
          {level === 2 && "Doux"}
          {level === 3 && "Modéré"}
          {level === 4 && "Sensations fortes"}
          {level === 5 && "Extrême"}
        </span>
      </button>
    ))}
  </div>
</div>

  <input
    className="mt-3 w-full rounded-xl border p-3"
    placeholder="Emplacement (ex: près du lac)"
    value={locationHint}
    onChange={(e) => setLocationHint(e.target.value)}
  />
</div>

        <button
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-gray-900 p-3 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Enregistrement..."
            : isEditing
            ? "Enregistrer les modifications"
            : "Créer l’attraction"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="mt-3 w-full rounded-xl bg-red-50 p-3 font-semibold text-red-700"
          >
            Supprimer l’attraction
          </button>
        )}
      </form>

      <div className="space-y-3">
        {attractions.length === 0 ? (
          <div className="rounded-3xl bg-white p-5 text-gray-500 shadow-sm">
            Aucune attraction pour le moment.
          </div>
        ) : (
          attractions.map((attraction) => (
            <button
              key={attraction.id}
              type="button"
              onClick={() => selectAttraction(attraction)}
              className={`w-full overflow-hidden rounded-3xl bg-white text-left shadow-sm transition hover:shadow-md ${
                selectedId === attraction.id ? "ring-2 ring-gray-900" : ""
              }`}
            >
              <div className="flex gap-4 p-4">
                <div className="h-24 w-32 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                  {attraction.image_url ? (
                    <img
                      src={attraction.image_url}
                      alt={attraction.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl">
                      🎢
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-gray-900">
                      {attraction.name}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        attraction.status === "open"
                          ? "bg-green-100 text-green-700"
                          : attraction.status === "maintenance"
                          ? "bg-orange-100 text-orange-700"
                          : attraction.status === "hidden"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {attraction.status || "open"}
                    </span>
                  </div>

                  {attraction.park_areas?.name && (
                    <p className="mt-1 text-sm font-semibold text-gray-500">
                      📍 {attraction.park_areas.name}
                    </p>
                  )}

                  {attraction.short_description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {attraction.short_description}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-gray-400">
                    Slug : {attraction.slug || "manquant"}
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