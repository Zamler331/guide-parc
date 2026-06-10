"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { saveToCache } from "@/lib/offline-cache"

export default function OfflineSync() {
  const [status, setStatus] = useState("Préparation du guide...")

  useEffect(() => {
    async function syncData() {
      try {
        await Promise.allSettled([
          fetch("/"),
          fetch("/carte"),
          fetch("/attractions"),
          fetch("/programme"),
          fetch("/infos"),
          fetch("/horaires"),
          fetch("/map.png", { cache: "reload" }),
        ])

        const [attractions, mapPoints, infos, shows, alerts] =
          await Promise.all([
            supabase
              .from("attractions")
              .select(`
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
          ])

        saveToCache("attractions", attractions.data || [])
        saveToCache("map_points", mapPoints.data || [])
        saveToCache("practical_infos", infos.data || [])
        saveToCache(
          "shows",
          (shows.data || []).filter(
            (time: any) => time.show?.status === "active"
          )
        )
        saveToCache("alerts", alerts.data || [])

        setStatus("Guide disponible hors ligne ✅")
      } catch (error) {
        console.error("Erreur cache offline:", error)
        setStatus("Mode hors ligne disponible avec les dernières données")
      }
    }

    syncData()
  }, [])

  return (
    <div className="px-4 pt-2 text-xs text-gray-500">
      {status}
    </div>
  )
}