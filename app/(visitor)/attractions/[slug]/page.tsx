export const dynamic = "force-dynamic"

import { getAttractionBySlug } from "@/lib/attractions"
import {
  getTodayOpening,
  getAttractionVisitorStatus,
} from "@/lib/opening-hours"
import { notFound } from "next/navigation"
import Link from "next/link"

function getStatusLabel(status: string) {
  if (status === "open") return "Ouverte actuellement"
  if (status === "maintenance") return "En maintenance"
  return "Fermée actuellement"
}

function getStatusStyle(status: string) {
  if (status === "open") return "bg-green-100 text-green-700"
  if (status === "maintenance") return "bg-orange-100 text-orange-700"
  return "bg-red-100 text-red-700"
}

function getThrillLabel(level?: number) {
  switch (level) {
    case 1:
      return "Très doux"
    case 2:
      return "Doux"
    case 3:
      return "Modéré"
    case 4:
      return "Sensations fortes"
    case 5:
      return "Extrême"
    default:
      return null
  }
}

function Stars({ level }: { level?: number }) {
  if (!level) return null

  return (
    <div className="text-lg text-yellow-500">
      {"★".repeat(level)}
      <span className="text-gray-300">{"★".repeat(5 - level)}</span>
    </div>
  )
}

export default async function AttractionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const attraction = await getAttractionBySlug(slug)
  const opening = await getTodayOpening()

  if (!attraction) return notFound()

  const visitorStatus = getAttractionVisitorStatus(attraction, opening)

  if (visitorStatus === "hidden") return notFound()

  return (
    <main className="min-h-screen bg-gray-100 pb-6">
      <div className="relative h-56 bg-gray-300">
        {attraction.image_url ? (
          <img
            src={attraction.image_url}
            alt={attraction.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl">
            🎢
          </div>
        )}

        <Link
          href="/attractions"
          className="absolute left-4 top-4 z-50 flex h-11 items-center rounded-full bg-white px-4 text-sm font-bold text-gray-900 shadow-lg active:scale-95"
        >
          ◀ Attractions
        </Link>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-20">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
              visitorStatus
            )}`}
          >
            {getStatusLabel(visitorStatus)}
          </span>

          <h1 className="mt-3 text-3xl font-black text-white drop-shadow">
            {attraction.name}
          </h1>

          {attraction.park_areas?.name && (
            <p className="mt-1 text-sm font-semibold text-white/80">
              📍 {attraction.park_areas.name}
            </p>
          )}
        </div>
      </div>

      <section className="-mt-6 rounded-t-[2rem] bg-white p-5 shadow-lg">
        {attraction.short_description && (
          <p className="text-lg font-bold text-gray-900">
            {attraction.short_description}
          </p>
        )}

        {attraction.description && (
          <p className="mt-4 whitespace-pre-line text-gray-700">
            {attraction.description}
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          {attraction.ride_type && (
            <InfoBadge icon="🎢" label={attraction.ride_type} />
          )}

          {attraction.opening_year && (
            <InfoBadge icon="📅" label={`Depuis ${attraction.opening_year}`} />
          )}

          {attraction.manufacturer && (
            <InfoBadge icon="🏭" label={attraction.manufacturer} />
          )}

          {attraction.ride_duration && (
            <InfoBadge icon="⏱️" label={attraction.ride_duration} />
          )}

          {attraction.min_height && (
            <InfoBadge
              icon="📏"
              label={`Accompagné dès ${attraction.min_height} cm`}
            />
          )}

          {attraction.accompanied_height && (
            <InfoBadge
              icon="✅"
              label={`Seul dès ${attraction.accompanied_height} cm`}
            />
          )}

          {attraction.is_family && (
            <InfoBadge icon="👨‍👩‍👧‍👦" label="Familiale" />
          )}

          {attraction.is_kids && (
            <InfoBadge icon="🧒" label="Enfants" />
          )}

          {attraction.is_accessible_pmr && (
            <InfoBadge icon="♿" label="Accessible PMR" />
          )}
        </div>

        {attraction.thrill_level && (
          <div className="mt-5 rounded-3xl bg-gray-100 p-4">
            <p className="text-sm font-bold text-gray-500">
              Niveau de sensations
            </p>
            <Stars level={Number(attraction.thrill_level)} />
            <p className="mt-1 text-sm font-semibold text-gray-700">
              {getThrillLabel(Number(attraction.thrill_level))}
            </p>
          </div>
        )}

        {attraction.location_hint && (
          <div className="mt-5 rounded-3xl bg-blue-50 p-4 text-sm font-semibold text-blue-700">
            📍 {attraction.location_hint}
          </div>
        )}
      </section>
    </main>
  )
}

function InfoBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700">
      <span className="mr-1">{icon}</span>
      {label}
    </div>
  )
}