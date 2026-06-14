export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import SectionTitle from "@/components/ui/SectionTitle"
import { getAttractionBySlug } from "@/lib/attractions"
import {
  getAttractionVisitorStatus,
  getTodayOpening,
} from "@/lib/opening-hours"

function getStatusLabel(status: string) {
  if (status === "open") return "Ouverte actuellement"
  if (status === "maintenance") return "En maintenance"
  return "Fermee actuellement"
}

function getStatusTone(status: string) {
  if (status === "open") return "green"
  if (status === "maintenance") return "orange"
  return "red"
}

function getThrillLabel(level?: number) {
  switch (level) {
    case 1:
      return "Tres doux"
    case 2:
      return "Doux"
    case 3:
      return "Modere"
    case 4:
      return "Sensations fortes"
    case 5:
      return "Extreme"
    default:
      return null
  }
}

function Stars({ level }: { level?: number }) {
  if (!level) return null

  return (
    <div className="text-lg text-yellow-500">
      {"★".repeat(level)}
      <span className="text-slate-300">{"★".repeat(5 - level)}</span>
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
    <main className="min-h-screen bg-slate-100 pb-6">
      <TrackEventOnMount
        eventName="attraction_opened"
        page={`/attractions/${attraction.slug}`}
        entityType="attraction"
        entityId={attraction.id}
        metadata={{ slug: attraction.slug, name: attraction.name }}
      />

      <div className="relative h-64 bg-slate-300">
        {attraction.image_url ? (
          <img
            src={attraction.image_url}
            alt={attraction.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-100 to-yellow-100 text-sm font-black uppercase text-pink-700">
            Attraction
          </div>
        )}

        <Link
          href="/attractions"
          className="absolute left-4 top-4 z-50 flex h-11 items-center rounded-full bg-white px-4 text-sm font-black text-slate-950 shadow-lg active:scale-95"
        >
          Attractions
        </Link>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-5 pt-24">
          <Badge tone={getStatusTone(visitorStatus)}>
            {getStatusLabel(visitorStatus)}
          </Badge>

          <h1 className="mt-3 text-3xl font-black leading-tight text-white drop-shadow">
            {attraction.name}
          </h1>

          {attraction.park_areas?.name && (
            <p className="mt-1 text-sm font-bold text-white/80">
              {attraction.park_areas.name}
            </p>
          )}
        </div>
      </div>

      <section className="-mt-5 space-y-4 px-4">
        <Card className="p-5">
          {attraction.short_description && (
            <p className="text-lg font-black leading-6 text-slate-950">
              {attraction.short_description}
            </p>
          )}

          {attraction.description && (
            <p className="mt-4 whitespace-pre-line text-sm font-medium leading-6 text-slate-600">
              {attraction.description}
            </p>
          )}
        </Card>

        <Card className="p-5">
          <SectionTitle title="A savoir" />
          <div className="grid grid-cols-2 gap-3">
            {attraction.ride_type && <InfoBadge label={attraction.ride_type} />}
            {attraction.opening_year && (
              <InfoBadge label={`Depuis ${attraction.opening_year}`} />
            )}
            {attraction.manufacturer && (
              <InfoBadge label={attraction.manufacturer} />
            )}
            {attraction.ride_duration && (
              <InfoBadge label={attraction.ride_duration} />
            )}
            {attraction.min_height && (
              <InfoBadge label={`Accompagne des ${attraction.min_height} cm`} />
            )}
            {attraction.accompanied_height && (
              <InfoBadge label={`Seul des ${attraction.accompanied_height} cm`} />
            )}
            {attraction.is_family && <InfoBadge label="Familiale" />}
            {attraction.is_kids && <InfoBadge label="Enfants" />}
            {attraction.is_accessible_pmr && <InfoBadge label="Accessible PMR" />}
          </div>
        </Card>

        {attraction.thrill_level && (
          <Card className="p-5">
            <SectionTitle title="Niveau de sensations" />
            <Stars level={Number(attraction.thrill_level)} />
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {getThrillLabel(Number(attraction.thrill_level))}
            </p>
          </Card>
        )}

        {attraction.location_hint && (
          <div className="rounded-2xl bg-blue-50 p-4 text-sm font-bold text-blue-700">
            {attraction.location_hint}
          </div>
        )}
      </section>
    </main>
  )
}

function InfoBadge({ label }: { label: string }) {
  return (
    <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold leading-tight text-slate-700">
      {label}
    </div>
  )
}
