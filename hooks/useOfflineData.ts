"use client"

import { useEffect, useState } from "react"
import { readFromCache } from "@/lib/offline-cache"

export function useOfflineData(cacheKey: string, serverData: any[]) {
  const [data, setData] = useState(serverData)

  useEffect(() => {
    const cached = readFromCache(cacheKey)

    if (!navigator.onLine || serverData.length === 0) {
      if (cached) {
        setData(cached)
      }
      return
    }

    setData(serverData)
  }, [cacheKey])

  return data
}