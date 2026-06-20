import Link from "next/link"
import Badge from "@/components/ui/Badge"
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

function getAttractionHref(slug: string) {
  return `/attractions/${encodeURIComponent(slug)}`
}

function getStatusLabel(status?: string) {
  switch (status) {
    case "maintenance":
      return "Maintenance"
    case "hidden":
      return "Masquee"
    case "open":
      return "Ouverte"
    default:
      return "Fermee"
  }
}

function getStatusTone(status?: string) {
  switch (status) {
    case "maintenance":
      return "orange"
    case "hidden":
      return "gray"
    case "open":
      return "green"
    default:
      return "red"
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
      href={getAttractionHref(attraction.slug)}
      className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition active:scale-[0.98]"
    >
      <div className="relative h-44 bg-slate-200">
        {attraction.image_url ? (
          <img
            src={attraction.image_url}
            alt={attraction.name}
            className="h-full w-full object-cover transition group-active:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-100 to-yellow-100 text-sm font-black uppercase text-pink-700">
            Attraction
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-4 pt-12">
          <h2 className="text-xl font-black leading-tight text-white drop-shadow">
            {attraction.name}
          </h2>
        </div>

        <Badge
          tone={getStatusTone(visitorStatus)}
          className="absolute left-3 top-3 shadow-sm"
        >
          {getStatusLabel(visitorStatus)}
        </Badge>
      </div>

      <div className="p-4">
        {attraction.park_areas?.name && (
          <p className="text-xs font-black uppercase text-slate-400">
            {attraction.park_areas.name}
          </p>
        )}

        {attraction.short_description && (
          <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-slate-600">
            {attraction.short_description}
          </p>
        )}

        <p className="mt-3 text-sm font-black text-slate-950">Decouvrir</p>
      </div>
    </Link>
  )
}
