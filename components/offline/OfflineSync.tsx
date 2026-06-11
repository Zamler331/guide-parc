"use client"

import { useEffect, useState } from "react"
import { saveToCache } from "@/lib/offline-cache"
import {
  saveLocalImagesOffline,
  saveRemoteImagesOffline,
} from "@/lib/offline-map-image"
import { saveOfflinePage } from "@/lib/offline-pages"
import { supabase } from "@/lib/supabase"

function getTodayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export default function OfflineSync() {
  const [status, setStatus] = useState("Preparation du guide...")

  useEffect(() => {
    async function syncData() {
      try {
        const today = getTodayKey()
        const year = today.slice(0, 4)

        await Promise.allSettled([
          fetch("/"),
          fetch("/offline"),
          fetch("/carte"),
          fetch("/attractions"),
          fetch("/programme"),
          fetch("/infos"),
          fetch("/horaires"),
          fetch("/map.png", { cache: "reload" }),
        ])

        await saveLocalImagesOffline()

        const [attractions, mapPoints, infos, shows, alerts, openingDays] =
          await Promise.all([
            supabase.from("attractions").select(`
              *,
              park_areas(*)
            `),

            supabase
              .from("map_points")
              .select(`
                *,
                area:park_areas(*),
                attraction:attractions!map_points_attraction_id_fkey(*)
              `)
              .eq("is_active", true),

            supabase
              .from("practical_infos")
              .select("*")
              .eq("is_active", true),

            supabase
              .from("show_times")
              .select(`
                *,
                show:shows(*)
              `)
              .eq("is_active", true),

            supabase
              .from("alerts")
              .select("*")
              .eq("is_active", true),

            supabase
              .from("opening_days")
              .select(`
                *,
                schedule:opening_schedules(*)
              `)
              .gte("date", `${year}-01-01`)
              .lte("date", `${year}-12-31`)
              .order("date"),
          ])

        const attractionsData = attractions.data || []
        const openingDaysData = openingDays.data || []

        const showTimesData = (shows.data || []).filter(
          (time: any) => time.show?.status === "active"
        )

        await Promise.allSettled([
          saveOfflinePage("/"),
          saveOfflinePage("/carte"),
          saveOfflinePage("/attractions"),
          saveOfflinePage("/programme"),
          saveOfflinePage("/infos"),
          saveOfflinePage("/horaires"),
          saveOfflinePage("/offline"),

          ...attractionsData
            .filter((attraction: any) => attraction.slug)
            .map((attraction: any) =>
              saveOfflinePage(`/attractions/${attraction.slug}`)
            ),

          ...Array.from(
  new Set(
    showTimesData
      .filter((time: any) => time.show?.slug)
      .map((time: any) => time.show.slug)
  )
).map((slug: string) => saveOfflinePage(`/programme/${slug}`)),
        ])

        await saveRemoteImagesOffline([
          ...attractionsData.map((attraction: any) => attraction.image_url),
          ...showTimesData.map((time: any) => time.show?.image_url),
        ])

        saveToCache("attractions", attractionsData)
        saveToCache("map_points", mapPoints.data || [])
        saveToCache("practical_infos", infos.data || [])
        saveToCache("shows", showTimesData)
        saveToCache("alerts", alerts.data || [])
        saveToCache("opening_days", openingDaysData)
        saveToCache(
          "today_opening",
          openingDaysData.find((openingDay: any) => openingDay.date === today) ||
            null
        )

        setStatus("Guide disponible hors ligne")
      } catch (error) {
        console.error("Erreur cache offline:", error)
        setStatus("Mode hors ligne disponible avec les dernieres donnees")
      }
    }

    syncData()
  }, [])

  return <div className="px-4 pt-2 text-xs text-gray-500">{status}</div>
}
