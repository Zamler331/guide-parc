"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { saveToCache } from "@/lib/offline-cache"

export default function OfflineSync() {
  const [status, setStatus] = useState("Préparation du guide...")

  useEffect(() => {
    async function syncData() {
      try {
        const [
          attractions,
          mapPoints,
          infos,
          shows,
          alerts,
        ] = await Promise.all([
          supabase.from("attractions").select("*"),
          supabase.from("map_points").select("*").eq("is_active", true),
          supabase.from("practical_infos").select("*").eq("is_active", true),
          supabase.from("shows").select("*").eq("status", "active"),
          supabase.from("alerts").select("*").eq("is_active", true),
        ])

        saveToCache("attractions", attractions.data || [])
        saveToCache("map_points", mapPoints.data || [])
        saveToCache("practical_infos", infos.data || [])
        saveToCache("shows", shows.data || [])
        saveToCache("alerts", alerts.data || [])

        setStatus("Guide disponible hors ligne ✅")
      } catch {
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