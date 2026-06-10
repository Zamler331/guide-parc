"use client"

import { useEffect } from "react"
import InteractiveMap from "./InteractiveMap"
import { useOfflineData } from "@/hooks/useOfflineData"

export default function OfflineMap({ points }: { points: any[] }) {
  const data = useOfflineData("map_points", points)

  useEffect(() => {
    async function cacheMapImage() {
      if (!("caches" in window)) return

      const cache = await caches.open("park-assets")
      await cache.add("/map.png")
    }

    cacheMapImage().catch(console.error)
  }, [])

  return <InteractiveMap points={data} />
}