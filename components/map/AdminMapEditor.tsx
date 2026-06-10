"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { uploadImage } from "@/lib/storage"

const TYPES = [
  { value: "attraction", label: "Attraction", color: "bg-red-500" },
  { value: "restaurant", label: "Restaurant", color: "bg-orange-500" },
  { value: "shop", label: "Boutique", color: "bg-purple-500" },
  { value: "toilet", label: "Toilettes", color: "bg-blue-500" },
  { value: "first_aid", label: "Secours", color: "bg-green-500" },
  { value: "parking", label: "Parking", color: "bg-gray-700" },
  { value: "show", label: "Spectacle", color: "bg-pink-500" },
]

function getTypeColor(type: string) {
  return TYPES.find((item) => item.value === type)?.color || "bg-gray-500"
}

export default function AdminMapEditor({
  points,
  attractions,
  areas,
}: {
  points: any[]
  attractions: any[]
  areas: any[]
}) {
  const router = useRouter()
  const [areaId, setAreaId] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [x, setX] = useState<number | null>(null)
  const [y, setY] = useState<number | null>(null)
  const [name, setName] = useState("")
  const [type, setType] = useState("attraction")
  const [targetUrl, setTargetUrl] = useState("")
  const [attractionSlug, setAttractionSlug] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [scale, setScale] = useState(1)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [attractionId, setAttractionId] = useState("")

  const selectedPoint = points.find((p) => p.id === selectedId)

  function resetForm() {
    setSelectedId(null)
    setX(null)
    setY(null)
    setName("")
    setType("attraction")
    setTargetUrl("")
    setAttractionSlug("")
    setImageUrl("")
    setShortDescription("")
    setIsActive(true)
    setAreaId("")
    setAttractionId("")
  }

  function selectPoint(point: any) {
    setSelectedId(point.id)
    setX(point.x)
    setY(point.y)
    setName(point.name || "")
    setType(point.type || "attraction")
    setTargetUrl(point.target_url || "")
    setImageUrl(point.image_url || "")
    setShortDescription(point.short_description || "")
    setIsActive(Boolean(point.is_active))

    if (point.type === "attraction" && point.target_url) {
      setAttractionSlug(point.target_url.replace("/attractions/", ""))
    } else {
      setAttractionSlug("")
    }
    setAreaId(point.area_id || "")
    setAttractionId(point.attraction_id || "")
  }

  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()

    const clickX = ((e.clientX - rect.left) / rect.width) * 100
    const clickY = ((e.clientY - rect.top) / rect.height) * 100

    setX(Number(clickX.toFixed(2)))
    setY(Number(clickY.toFixed(2)))
  }

  function updatePointPositionFromEvent(e: React.MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect()

  const nextX = ((e.clientX - rect.left) / rect.width) * 100
  const nextY = ((e.clientY - rect.top) / rect.height) * 100

  setX(Number(nextX.toFixed(2)))
  setY(Number(nextY.toFixed(2)))
}

  function handleTypeChange(value: string) {
    setType(value)

    if (value !== "attraction") {
      setAttractionSlug("")
    }
    if (value !== "attraction") {
  setAttractionSlug("")
  setAttractionId("")
}
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
      image_url: imageUrl || null,
      short_description: shortDescription || null,
      is_active: isActive,
      area_id: areaId || null,
      attraction_id: type === "attraction" ? attractionId || null : null,
    }

    setLoading(true)

    const { error } = selectedId
      ? await supabase.from("map_points").update(payload).eq("id", selectedId)
      : await supabase.from("map_points").insert(payload)

    setLoading(false)

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
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Plan du parc</h2>
            <p className="text-sm text-gray-500">
              Zoomez, déplacez la carte, puis cliquez pour placer ou déplacer un
              point.
            </p>
          </div>

          <div className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
            {points.length} point(s)
          </div>
        </div>

        <div className="relative h-[75vh] overflow-hidden rounded-3xl border bg-[#a3a463]">
          <TransformWrapper
            initialScale={1}
            minScale={0.8}
            maxScale={5}
            centerOnInit
            limitToBounds={false}
            wheel={{ step: 0.15 }}
            pinch={{ step: 5 }}
            doubleClick={{ disabled: true }}
            panning={{ velocityDisabled: true }}
            onZoom={(ref: any) => setScale(ref.state.scale)}
            onPanning={(ref: any) => setScale(ref.state.scale)}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute right-3 top-3 z-30 flex gap-2">
                  <button
                    type="button"
                    onClick={() => zoomOut()}
                    className="h-10 w-10 rounded-full bg-white text-lg font-black shadow"
                  >
                    -
                  </button>

                  <button
                    type="button"
                    onClick={() => resetTransform()}
                    className="rounded-full bg-white px-3 py-2 text-xs font-bold shadow"
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={() => zoomIn()}
                    className="h-10 w-10 rounded-full bg-white text-lg font-black shadow"
                  >
                    +
                  </button>
                </div>

                <TransformComponent
                  wrapperClass="!h-full !w-full !bg-[#a3a463]"
                  contentClass="!w-auto !h-auto !bg-[#a3a463]"
                >
                  <div
                    onClick={handleMapClick}
                    onMouseMove={(e) => {
                      if (!draggingId) return
                      updatePointPositionFromEvent(e)
                    }}
                    onMouseUp={() => setDraggingId(null)}
                    onMouseLeave={() => setDraggingId(null)}
                    className="relative w-[1100px] max-w-none cursor-crosshair"
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
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            selectPoint(point)
                            setDraggingId(point.id)
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            selectPoint(point)
                          }}
                          className="absolute"
                          style={{
                            left: `${selectedId === point.id && x !== null ? x : point.x}%`,
                            top: `${selectedId === point.id && y !== null ? y : point.y}%`,
                            transform: `translate(-50%, -50%) scale(${
                              1 / scale
                            })`,
                            transformOrigin: "center",
                          }}
                          title={point.name}
                        >
                          <span
                            className={`block h-7 w-7 rounded-full border-2 border-white shadow ${
                              isSelected
                                ? "bg-black ring-4 ring-white"
                                : getTypeColor(point.type)
                            } ${point.is_active ? "" : "opacity-40"}`}
                          />
                        </button>
                      )
                    })}

                    {x !== null && y !== null && !selectedPoint && (
                      <span
                        className="absolute h-7 w-7 rounded-full border-2 border-white bg-black shadow"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: `translate(-50%, -50%) scale(${
                            1 / scale
                          })`,
                          transformOrigin: "center",
                        }}
                      />
                    )}
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      </section>

      <aside className="rounded-3xl bg-white p-5 shadow-sm max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">
                {selectedId ? "Modifier le point" : "Nouveau point"}
              </h2>
              <p className="text-sm text-gray-500">
                Position : {x ?? "-"} / {y ?? "-"}
              </p>
            </div>

            {selectedId && (
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
            placeholder="Nom du point"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="w-full rounded-xl border p-3"
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            {TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-xl border p-3"
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
          >
            <option value="">Aucune zone</option>

            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>

          {type === "attraction" ? (
            <select
              className="w-full rounded-xl border p-3"
              value={attractionId}
              onChange={(e) => {
                const id = e.target.value

                setAttractionId(id)

                const selectedAttraction = attractions.find(
                  (attr) => attr.id === id
                )

                if (selectedAttraction) {
                  setAttractionSlug(selectedAttraction.slug || "")
                  setTargetUrl(
                    selectedAttraction.slug
                      ? `/attractions/${selectedAttraction.slug}`
                      : ""
                  )
                  setName(selectedAttraction.name || "")
                  setImageUrl(selectedAttraction.image_url || "")
                  setShortDescription(
                    selectedAttraction.short_description || ""
                  )
                } else {
                  setAttractionSlug("")
                  setTargetUrl("")
                }
              }}
            >
              <option value="">Choisir une attraction</option>

              {attractions.map((attr) => (
                <option key={attr.id} value={attr.id}>
                  {attr.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="w-full rounded-xl border p-3"
              placeholder="Lien cible ex: /programme"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
            />
          )}

          <div className="space-y-2">
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

          <textarea
            className="w-full rounded-xl border p-3"
            rows={3}
            placeholder="Description courte"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />

          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Point visible côté visiteur
          </label>

          {imageUrl && (
            <div className="overflow-hidden rounded-2xl border">
              <img src={imageUrl} alt="" className="h-32 w-full object-cover" />
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-gray-900 p-3 font-semibold text-white disabled:opacity-50"
          >
            {loading
              ? "Enregistrement..."
              : selectedId
                ? "Enregistrer les modifications"
                : "Créer le point"}
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
      </aside>
    </div>
  )
}