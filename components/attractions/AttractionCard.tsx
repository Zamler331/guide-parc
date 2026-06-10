import Link from "next/link"
import { getAttractionVisitorStatus } from "@/lib/opening-hours"

type Attraction = {
  id: string
  name: string
  slug: string
  short_description?: string
  image_url?: string
  status?: string
  park_areas?: { name: string }
}

function getStatusLabel(status?: string) {
  switch (status) {
    case "maintenance":
      return "Maintenance"
    case "hidden":
      return "Masquée"
    case "open":
      return "Ouverte actuellement"
    default:
      return "Fermée actuellement"
  }
}

function getStatusStyle(status?: string) {
  switch (status) {
    case "maintenance":
      return "bg-orange-100 text-orange-700"
    case "hidden":
      return "bg-gray-100 text-gray-600"
    case "open":
      return "bg-green-100 text-green-700"
    default:
      return "bg-red-100 text-red-700"
  }
}

export default function AttractionCard({
  attraction,
  opening,
}: {
  attraction: Attraction
  opening: any
}) {
  if (!attraction.slug) return null

  const visitorStatus = getAttractionVisitorStatus(attraction, opening)

  if (visitorStatus === "hidden") return null

  return (
    <Link
      href={`/attractions/${attraction.slug}`}
      className="group block overflow-hidden rounded-3xl bg-white shadow-sm transition active:scale-[0.98]"
    >
      <div className="relative h-44 bg-gray-100">
        {attraction.image_url ? (
          <img
            src={attraction.image_url}
            alt={attraction.name}
            className="h-full w-full object-cover transition group-active:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            🎢
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
          <h2 className="text-xl font-black text-white drop-shadow">
            {attraction.name}
          </h2>
        </div>

        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
            visitorStatus
          )}`}
        >
          {getStatusLabel(visitorStatus)}
        </span>
      </div>

      <div className="p-4">
        {attraction.park_areas?.name && (
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            📍 {attraction.park_areas.name}
          </p>
        )}

        {attraction.short_description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">
            {attraction.short_description}
          </p>
        )}

        <p className="mt-3 text-sm font-black text-gray-900">
          Découvrir →
        </p>
      </div>
    </Link>
  )
}