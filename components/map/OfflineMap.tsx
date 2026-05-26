"use client"

import InteractiveMap from "./InteractiveMap"
import { useOfflineData } from "@/hooks/useOfflineData"

export default function OfflineMap({ points }: { points: any[] }) {
  const data = useOfflineData("map_points", points)

  return <InteractiveMap points={data} />
}