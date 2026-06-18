"use client"

import { useEffect, useState } from "react"
import InteractiveMap from "./InteractiveMap"
import { useOfflineData } from "@/hooks/useOfflineData"
import { readFromCache } from "@/lib/offline-cache"
import { readImageOffline } from "@/lib/offline-map-image"

export default function OfflineMap({
  points,
  opening,
}: {
  points: any[]
  opening: any
}) {
  const data = useOfflineData("map_points", points)
  const [todayOpening, setTodayOpening] = useState(opening)
  const [mapSrc, setMapSrc] = useState("/map.png")

  useEffect(() => {
    async function loadCachedMap() {
      const cached = await readImageOffline("offline_map_image", "/map.png")
      if (cached) setMapSrc(cached)
    }

    if (!navigator.onLine) {
      loadCachedMap()
    }
  }, [])

  useEffect(() => {
    const cachedOpening = readFromCache("today_opening")

    if (!navigator.onLine && cachedOpening) {
      setTodayOpening(cachedOpening)
      return
    }

    setTodayOpening(opening)
  }, [opening])

  return <InteractiveMap points={data} opening={todayOpening} mapSrc={mapSrc} />
}
