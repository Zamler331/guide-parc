"use client"

import { useEffect, useState } from "react"
import InteractiveMap from "./InteractiveMap"
import { useOfflineData } from "@/hooks/useOfflineData"
import { readImageOffline } from "@/lib/offline-map-image"

export default function OfflineMap({ points }: { points: any[] }) {
  const data = useOfflineData("map_points", points)
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

  return <InteractiveMap points={data} mapSrc={mapSrc} />
}
