"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"
import { getEffectiveOpeningDisplay } from "@/lib/opening-display"

const TYPES = [
  { value: "all", label: "Tous", shortLabel: "Tous" },
  { value: "attraction", label: "Attractions", shortLabel: "Attr." },
  { value: "restaurant", label: "Restauration", shortLabel: "Food" },
  { value: "shop", label: "Boutiques", shortLabel: "Shop" },
  { value: "toilet", label: "Toilettes", shortLabel: "WC" },
  { value: "first_aid", label: "Secours", shortLabel: "SOS" },
  { value: "parking", label: "Parking", shortLabel: "P" },
  { value: "show", label: "Spectacles", shortLabel: "Show" },
]

const ATTRACTION_ICON_SRC = "/attraction-map-icon.png"

function getType(type: string) {
  return TYPES.find((item) => item.value === type) || TYPES[0]
}

function getTypeStyle(type: string) {
  switch (type) {
    case "attraction":
      return "bg-red-500 text-white"
    case "restaurant":
      return "bg-orange-500 text-white"
    case "shop":
      return "bg-purple-500 text-white"
    case "toilet":
      return "bg-blue-500 text-white"
    case "first_aid":
      return "bg-green-600 text-white"
    case "parking":
      return "bg-slate-800 text-white"
    case "show":
      return "bg-pink-500 text-white"
    default:
      return "bg-white text-slate-700"
  }
}

function getPointLink(point: any) {
  if (point.type === "attraction" && point.attraction?.slug) {
    return `/attractions/${point.attraction.slug}`
  }

  return point.target_url || "/carte"
}

function getPointName(point: any) {
  return point.type === "attraction"
    ? point.attraction?.name || point.name
    : point.name
}

function getPointImage(point: any) {
  return point.type === "attraction"
    ? point.attraction?.image_url || point.image_url
    : point.image_url
}

function getPointDescription(point: any) {
  return point.type === "attraction"
    ? point.attraction?.short_description || point.short_description
    : point.short_description
}

function AttractionMarkerIcon() {
  return (
    <img
      src={ATTRACTION_ICON_SRC}
      alt=""
      className="h-6 w-6 object-contain"
      draggable={false}
    />
  )
}

function getZoneClusters(points: any[]) {
  const groups: Record<string, any[]> = {}

  points.forEach((point) => {
    const key = point.area_id || "no-area"

    if (!groups[key]) groups[key] = []
    groups[key].push(point)
  })

  const clusters = Object.entries(groups).map(([areaId, items]) => {
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
      displayX: avgX,
      displayY: avgY,
    }
  })

  return spreadCloseClusters(clusters)
}

function spreadCloseClusters(clusters: any[]) {
  const placed: any[] = []
  const minDistance = 8
  const offsets = [
    [0, 0],
    [-7, -5],
    [7, -5],
    [-8, 5],
    [8, 5],
    [0, -9],
    [0, 9],
    [-12, 0],
    [12, 0],
  ]

  return clusters
    .sort((a, b) => b.count - a.count)
    .map((cluster) => {
      const closeCount = placed.filter((placedCluster) => {
        const dx = placedCluster.x - cluster.x
        const dy = placedCluster.y - cluster.y
        return Math.sqrt(dx * dx + dy * dy) < minDistance
      }).length
      const [offsetX, offsetY] = offsets[closeCount % offsets.length]
      const nextCluster = {
        ...cluster,
        displayX: Math.min(94, Math.max(6, cluster.x + offsetX)),
        displayY: Math.min(94, Math.max(8, cluster.y + offsetY)),
      }

      placed.push(nextCluster)
      return nextCluster
    })
}

export default function InteractiveMap({
  points,
  opening,
  mapSrc = "/map.png",
}: {
  points: any[]
  opening: any
  mapSrc?: string
}) {
  const [filter, setFilter] = useState("all")
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null)
  const [scale, setScale] = useState(1.2)

  const filteredPoints = useMemo(() => {
    return filter === "all"
      ? points
      : points.filter((point) => point.type === filter)
  }, [filter, points])

  const clusters = useMemo(
    () => getZoneClusters(filteredPoints),
    [filteredPoints]
  )

  const showClusters = scale < 1.75 && filter === "all"
  const selectedPointOpening = selectedPoint
    ? getEffectiveOpeningDisplay(selectedPoint, opening)
    : null

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-[#a3a463]">
      <div className="absolute left-0 right-0 top-0 z-30 border-b border-white/50 bg-white/90 px-3 py-3 shadow-sm backdrop-blur">
        <div className="flex gap-2 overflow-x-auto pb-1">
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
                className={`min-h-9 whitespace-nowrap rounded-full border px-3 text-sm font-black transition active:scale-95 ${
                  active
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {type.label}
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
        limitToBounds
        wheel={{ step: 0.12 }}
        pinch={{ step: 4 }}
        doubleClick={{ disabled: true }}
        panning={{ velocityDisabled: false }}
        onZoom={(ref: any) => setScale(ref.state.scale)}
      >
        {({ zoomIn, zoomOut, resetTransform, zoomToElement }: any) => (
          <>
            <div className="absolute bottom-28 right-3 z-30 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => zoomIn(0.55)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl font-black text-slate-950 shadow-lg active:scale-95"
                aria-label="Zoomer"
              >
                +
              </button>

              <button
                type="button"
                onClick={() => zoomOut(0.55)}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl font-black text-slate-950 shadow-lg active:scale-95"
                aria-label="Dezoomer"
              >
                -
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPoint(null)
                  setScale(1.2)
                  resetTransform()
                }}
                className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-950 shadow-lg active:scale-95"
              >
                Recentrer
              </button>
            </div>

            <TransformComponent
              wrapperClass="!h-full !w-full !bg-[#a3a463]"
              contentClass="!w-auto !h-auto !bg-[#a3a463]"
            >
              <div
                className="relative mt-16 w-[1100px] max-w-none touch-none"
                onClick={() => setSelectedPoint(null)}
              >
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
                              zoomToElement(clusterId, 2.9, 420)
                              setScale(2.9)
                            }
                          }}
                          className="absolute"
                          style={{
                            left: `${cluster.displayX}%`,
                            top: `${cluster.displayY}%`,
                            transform: `translate(-50%, -50%) scale(${1 / scale})`,
                            transformOrigin: "center",
                          }}
                          title={areaName}
                        >
                          <span
                            className="flex min-h-11 max-w-36 items-center gap-2 rounded-2xl border-2 border-white px-3 py-2 text-left text-xs font-black leading-tight text-white shadow-xl"
                            style={{ backgroundColor: areaColor }}
                          >
                            <span className="min-w-0 truncate">
                              {areaName}
                            </span>
                            <span className="shrink-0 rounded-full bg-white/25 px-2 py-0.5">
                              {cluster.count}
                            </span>
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
                          aria-label={getPointName(point)}
                        >
                          <span
                            className={`flex h-9 min-w-9 items-center justify-center rounded-full border-2 border-white px-2 text-[9px] font-black shadow-lg transition ${
                              getTypeStyle(point.type)
                            } ${selected ? "ring-4 ring-white" : ""}`}
                            style={{
                              backgroundColor:
                                point.type === "attraction"
                                  ? "#ffffff"
                                  : point.area?.color || undefined,
                              borderColor:
                                point.type === "attraction"
                                  ? point.area?.color || "#ffffff"
                                  : "#ffffff",
                            }}
                          >
                            {point.type === "attraction" ? (
                              <AttractionMarkerIcon />
                            ) : (
                              type.shortLabel
                            )}
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
          <button
            type="button"
            onClick={() => setSelectedPoint(null)}
            className="absolute -top-3 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-lg font-black leading-none text-white shadow-lg active:scale-95"
            aria-label="Fermer la fiche"
          >
            x
          </button>

          <Link
            href={getPointLink(selectedPoint)}
            className="block rounded-2xl border border-slate-100 bg-white p-3 shadow-2xl active:scale-[0.99]"
          >
            <div className="flex gap-3">
              <div className="h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                {getPointImage(selectedPoint) ? (
                  <img
                    src={getPointImage(selectedPoint)}
                    alt={getPointName(selectedPoint)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center text-xs font-black uppercase ${getTypeStyle(
                      selectedPoint.type
                    )}`}
                  >
                    {selectedPoint.type === "attraction" ? (
                      <AttractionMarkerIcon />
                    ) : (
                      getType(selectedPoint.type).shortLabel
                    )}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase text-slate-400">
                  {getType(selectedPoint.type).label}
                </p>

                <h2 className="mt-1 truncate text-lg font-black text-slate-950">
                  {getPointName(selectedPoint)}
                </h2>

                {selectedPoint.area?.name && (
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {selectedPoint.area.name}
                  </p>
                )}

                {selectedPointOpening && (
                  <div className="mt-1 rounded-xl bg-emerald-50 px-2 py-1">
                    <p className="text-[10px] font-black uppercase text-emerald-600">
                      {selectedPointOpening.sourceLabel}
                    </p>
                    <p className="text-xs font-black text-emerald-800">
                      {selectedPointOpening.label}
                    </p>
                  </div>
                )}

                {getPointDescription(selectedPoint) && (
                  <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-600">
                    {getPointDescription(selectedPoint)}
                  </p>
                )}

                <p className="mt-2 text-xs font-black text-slate-400">
                  Toucher pour ouvrir
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
