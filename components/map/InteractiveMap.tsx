"use client"

import { useState } from "react"
import Link from "next/link"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"

const TYPES = [
  { value: "all", label: "Tous", icon: "✨" },
  { value: "attraction", label: "Attractions", icon: "🎢" },
  { value: "restaurant", label: "Restauration", icon: "🍔" },
  { value: "shop", label: "Boutiques", icon: "🛍️" },
  { value: "toilet", label: "Toilettes", icon: "🚻" },
  { value: "first_aid", label: "Secours", icon: "🩺" },
  { value: "parking", label: "Parking", icon: "🅿️" },
  { value: "show", label: "Spectacles", icon: "🎭" },
]

function getType(type: string) {
  return TYPES.find((item) => item.value === type) || TYPES[0]
}

function getColor(type: string) {
  switch (type) {
    case "attraction":
      return "border-red-500 text-red-600"
    case "restaurant":
      return "border-orange-500 text-orange-600"
    case "shop":
      return "border-purple-500 text-purple-600"
    case "toilet":
      return "border-blue-500 text-blue-600"
    case "first_aid":
      return "border-green-500 text-green-600"
    case "parking":
      return "border-gray-700 text-gray-700"
    case "show":
      return "border-pink-500 text-pink-600"
    default:
      return "border-gray-400 text-gray-600"
  }
}

function getPointLink(point: any) {
  return point.target_url || "/carte"
}

function getZoneClusters(points: any[]) {
  const groups: Record<string, any[]> = {}

  points.forEach((point) => {
    const key = point.area_id || "no-area"

    if (!groups[key]) groups[key] = []

    groups[key].push(point)
  })

  return Object.entries(groups).map(([areaId, items]) => {
    const avgX =
      items.reduce((sum, point) => sum + Number(point.x), 0) / items.length

    const avgY =
      items.reduce((sum, point) => sum + Number(point.y), 0) / items.length

    return {
      areaId,
      area: items[0]?.area,
      count: items.length,
      x: avgX,
      y: avgY,
    }
  })
}

export default function InteractiveMap({
  points,
  mapSrc = "/map.png",
}: {
  points: any[]
  mapSrc?: string
}) {
  const [filter, setFilter] = useState("all")
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null)
  const [scale, setScale] = useState(1)

  const filteredPoints =
    filter === "all" ? points : points.filter((point) => point.type === filter)

  const showClusters = scale < 1.6 && filter === "all"
  const clusters = getZoneClusters(filteredPoints)

  return (
    <div className="relative h-[calc(100vh-64px)] overflow-hidden bg-[#a3a463]">
      <div className="absolute left-0 right-0 top-0 z-30 bg-white/90 px-3 py-3 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto">
          {TYPES.map((type) => {
            const active = filter === type.value

            return (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  setFilter(type.value)
                  setSelectedPoint(null)
                }}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-semibold ${
                  active
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600"
                }`}
              >
                {type.icon} {type.label}
              </button>
            )
          })}
        </div>
      </div>

      <TransformWrapper
        initialScale={1.2}
        minScale={1}
        maxScale={7}
        centerOnInit
        limitToBounds={true}
        wheel={{ step: 0.15 }}
        pinch={{ step: 5 }}
        doubleClick={{ disabled: true }}
        panning={{ velocityDisabled: true }}
        onZoom={(ref: any) => setScale(ref.state.scale)}
        onPanning={(ref: any) => setScale(ref.state.scale)}
      >
        {({ zoomIn, zoomOut, resetTransform, zoomToElement }: any) => (
          <>
            <div className="absolute bottom-28 right-3 z-30 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => zoomIn()}
                className="h-10 w-10 rounded-full bg-white text-lg font-black shadow"
              >
                +
              </button>

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
            </div>

            <TransformComponent
              wrapperClass="!h-full !w-full !bg-[#a3a463]"
              contentClass="!w-auto !h-auto !bg-[#a3a463]"
            >
              <div className="relative mt-16 w-[1100px] max-w-none">
                <img
                  src={mapSrc}
                  alt="Plan du parc"
                  className="block w-full select-none"
                  draggable={false}
                />

                {showClusters
                  ? clusters.map((cluster) => {
                      const areaName = cluster.area?.name || "Autres"
                      const areaColor = cluster.area?.color || "#111827"
                      const clusterId = `cluster-${cluster.areaId}`

                      return (
                        <button
                          id={clusterId}
                          key={cluster.areaId}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPoint(null)

                            if (zoomToElement) {
                              zoomToElement(clusterId, 2.8, 500)

                              setTimeout(() => {
                                setScale(2.8)
                              }, 550)
                            }
                          }}
                          className="absolute"
                          style={{
                            left: `${cluster.x}%`,
                            top: `${cluster.y}%`,
                            transform: `translate(-50%, -50%) scale(${1 / scale})`,
                            transformOrigin: "center",
                          }}
                          title={areaName}
                        >
                          <span
                          className="flex items-center gap-1 rounded-full border-1 border-white px-2 py-1 text-[10px] font-black text-white shadow-lg"
                          style={{ backgroundColor: areaColor }}
                        >
                          <span>📍</span>
                          <span>{areaName}</span>
                        </span>
                        </button>
                      )
                    })
                  : filteredPoints.map((point) => {
                      const selected = selectedPoint?.id === point.id
                      const type = getType(point.type)

                      return (
                        <button
                          key={point.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedPoint(point)
                          }}
                          className="absolute"
                          style={{
                            left: `${point.x}%`,
                            top: `${point.y}%`,
                            transform: `translate(-50%, -50%) scale(${1 / scale})`,
                            transformOrigin: "center",
                          }}
                          aria-label={point.name}
                        >
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm shadow-lg ${
                              selected ? "ring-4 ring-white" : ""
                            }`}
                            style={{
                              backgroundColor: point.area?.color || "#ffffff",
                              borderColor: "white",
                              color: "white",
                            }}
                          >
                            {type.icon}
                          </span>
                        </button>
                      )
                    })}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {selectedPoint && (
        <div className="absolute bottom-3 left-3 right-3 z-40">
          <Link
            href={getPointLink(selectedPoint)}
            className="block rounded-3xl bg-white p-3 shadow-2xl"
          >
            <div className="flex gap-3">
              <div className="h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                {selectedPoint.image_url ? (
                  <img
                    src={selectedPoint.image_url}
                    alt={selectedPoint.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl">
                    {getType(selectedPoint.type).icon}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  {getType(selectedPoint.type).label}
                </p>

                <h2 className="mt-1 truncate text-lg font-black text-gray-900">
                  {selectedPoint.name}
                </h2>

                {selectedPoint.area?.name && (
                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    📍 {selectedPoint.area.name}
                  </p>
                )}

                {selectedPoint.short_description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {selectedPoint.short_description}
                  </p>
                )}

                <p className="mt-2 text-xs font-bold text-gray-400">
                  Toucher pour ouvrir →
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}