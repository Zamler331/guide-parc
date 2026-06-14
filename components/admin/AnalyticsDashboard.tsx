"use client"

import { useEffect, useMemo, useState } from "react"
import { createSupabaseAuthClient } from "@/lib/supabase-auth-client"

type AnalyticsEvent = {
  id: string
  event_name: string
  device_id: string
  page: string | null
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, any> | null
  created_at: string
}

function countBy(items: string[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    if (!item) return acc
    acc[item] = (acc[item] || 0) + 1
    return acc
  }, {})
}

function topEntries(map: Record<string, number>, limit = 8) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getLast30Days() {
  return Array.from({ length: 30 }).map((_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - index))
    return formatDateKey(date)
  })
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-gray-900">{value}</p>
    </div>
  )
}

function RankingCard({
  title,
  entries,
  empty,
}: {
  title: string
  entries: Array<[string, number]>
  empty: string
}) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-gray-900">{title}</h2>
      <div className="mt-4 space-y-2">
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500">{empty}</p>
        ) : (
          entries.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm"
            >
              <span className="min-w-0 truncate font-semibold text-gray-700">
                {label}
              </span>
              <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-black text-white">
                {value}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default function AnalyticsDashboard() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadEvents() {
      const supabase = createSupabaseAuthClient()
      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .order("created_at", { ascending: false })
        .range(0, 9999)

      if (error) {
        setError(error.message)
      } else {
        setEvents(data || [])
      }

      setLoading(false)
    }

    loadEvents()
  }, [])

  const stats = useMemo(() => {
    const appOpenCount = events.filter(
      (event) => event.event_name === "app_opened"
    ).length
    const uniqueDevices = new Set(events.map((event) => event.device_id)).size
    const installCount = events.filter(
      (event) => event.event_name === "pwa_installed"
    ).length

    const pageViews = events.filter((event) => event.event_name === "page_view")
    const attractionViews = events.filter(
      (event) => event.event_name === "attraction_opened"
    )

    const pages = countBy(pageViews.map((event) => event.page || "Page inconnue"))
    const attractions = countBy(
      attractionViews.map(
        (event) =>
          event.metadata?.name ||
          event.metadata?.slug ||
          event.entity_id ||
          "Attraction inconnue"
      )
    )
    const eventNames = countBy(events.map((event) => event.event_name))

    const days = getLast30Days()
    const dailyCounts = countBy(
      events.map((event) => formatDateKey(new Date(event.created_at)))
    )

    return {
      appOpenCount,
      uniqueDevices,
      installCount,
      topPages: topEntries(pages),
      topAttractions: topEntries(attractions),
      topEvents: topEntries(eventNames),
      daily: days.map((day) => [day, dailyCounts[day] || 0] as [string, number]),
      maxDaily: Math.max(1, ...days.map((day) => dailyCounts[day] || 0)),
    }
  }, [events])

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-5 text-sm font-semibold text-gray-500 shadow-sm">
        Chargement des statistiques...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-red-50 p-5 text-sm font-semibold text-red-700">
        Impossible de charger les statistiques : {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Ouvertures de l'application" value={stats.appOpenCount} />
        <StatCard label="Appareils uniques" value={stats.uniqueDevices} />
        <StatCard label="Installations PWA detectees" value={stats.installCount} />
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-gray-900">
          Evolution sur 30 jours
        </h2>
        <div className="mt-4 flex h-40 items-end gap-1">
          {stats.daily.map(([day, count]) => (
            <div key={day} className="flex min-w-0 flex-1 flex-col items-center">
              <div
                className="w-full rounded-t-lg bg-blue-600"
                style={{
                  height: `${Math.max(4, (count / stats.maxDaily) * 128)}px`,
                }}
                title={`${day} : ${count}`}
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold text-gray-400">
          Chaque barre represente le nombre total d'evenements du jour.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <RankingCard
          title="Pages les plus consultees"
          entries={stats.topPages}
          empty="Aucune page consultee pour le moment."
        />
        <RankingCard
          title="Attractions les plus consultees"
          entries={stats.topAttractions}
          empty="Aucune fiche attraction consultee pour le moment."
        />
        <RankingCard
          title="Evenements les plus frequents"
          entries={stats.topEvents}
          empty="Aucun evenement collecte pour le moment."
        />
      </div>
    </div>
  )
}
