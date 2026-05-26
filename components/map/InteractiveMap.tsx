"use client"

import { useState } from "react"
import Link from "next/link"
import {
  TransformWrapper,
  TransformComponent,
} from "react-zoom-pan-pinch"

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

export default function InteractiveMap({ points }: { points: any[] }) {
  const [filter, setFilter] = useState("all")
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null)

  const filteredPoints =
    filter === "all" ? points : points.filter((point) => point.type === filter)

  return (
    <div className="space-y-3 px-4 pb-6">
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
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition ${
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

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={4}
          centerOnInit
          wheel={{ step: 0.15 }}
          pinch={{ step: 5 }}
          doubleClick={{ disabled: true }}
          panning={{ velocityDisabled: true }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="flex items-center justify-between border-b bg-white px-3 py-2">
                <p className="text-xs text-gray-500">
                  Pincez ou faites glisser la carte
                </p>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => zoomOut()}
                    className="h-8 w-8 rounded-full bg-gray-100 text-sm font-bold"
                  >
                    -
                  </button>

                  <button
                    type="button"
                    onClick={() => resetTransform()}
                    className="h-8 rounded-full bg-gray-100 px-3 text-xs font-semibold"
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={() => zoomIn()}
                    className="h-8 w-8 rounded-full bg-gray-100 text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="h-[520px] bg-gray-100">
                <TransformComponent
                  wrapperClass="!w-full !h-full"
                  contentClass="!w-full"
                >
                  <div className="relative w-full">
                    <img
                      src="/map.png"
                      alt="Plan du parc"
                      className="block w-full select-none"
                      draggable={false}
                    />

                    {filteredPoints.map((point) => {
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
                          className="absolute -translate-x-1/2 -translate-y-1/2"
                          style={{
                            left: `${point.x}%`,
                            top: `${point.y}%`,
                          }}
                          aria-label={point.name}
                        >
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white text-sm shadow-md transition ${getColor(
                              point.type
                            )} ${
                              selected
                                ? "scale-110 ring-4 ring-white"
                                : "hover:scale-105"
                            }`}
                          >
                            {type.icon}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </TransformComponent>
              </div>
            </>
          )}
        </TransformWrapper>

        {selectedPoint && (
          <Link
            href={getPointLink(selectedPoint)}
            className="block border-t bg-white p-3"
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
                  <div className="flex h-full w-full items-center justify-center text-2xl">
                    {getType(selectedPoint.type).icon}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {getType(selectedPoint.type).label}
                </p>

                <h2 className="mt-1 truncate text-lg font-bold text-gray-900">
                  {selectedPoint.name}
                </h2>

                {selectedPoint.short_description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {selectedPoint.short_description}
                  </p>
                )}
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}