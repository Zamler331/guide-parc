"use client"

import { useEffect, useState } from "react"
import { readFromCache } from "@/lib/offline-cache"

export function useOfflineData<T>(
  cacheKey: string,
  serverData: T
) {
  const [data, setData] = useState(serverData)

  useEffect(() => {
    const cached = readFromCache(cacheKey)
    const hasServerData = Array.isArray(serverData)
      ? serverData.length > 0
      : Boolean(serverData)

    if (!navigator.onLine || !hasServerData) {
      if (cached) {
        setData(cached)
      }
    }
  }, [cacheKey, serverData])

  return data
}
