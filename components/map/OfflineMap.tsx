"use client"

import { useEffect, useState } from "react"
import InteractiveMap from "./InteractiveMap"
import { useOfflineData } from "@/hooks/useOfflineData"
import { readImageOffline } from "@/lib/offline-map-image"

export default function OfflineMap({ points }: { points: any[] }) {
  const data = useOfflineData("map_points", points)
  const [mapSrc, setMapSrc] = useState("/map.png")

  useEffect(() => {
    if (!navigator.onLine) {
      const cached = readImageOffline("offline_map_image")
      if (cached) setMapSrc(cached)
    }
  }, [])

  return <InteractiveMap points={data} mapSrc={mapSrc} />
}