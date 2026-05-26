"use client"

import { useEffect, useState } from "react"
import { readFromCache } from "@/lib/offline-cache"

export function useOfflineData<T>(
  cacheKey: string,
  serverData: T
) {
  const [data, setData] = useState(serverData)

  useEffect(() => {
    if (!navigator.onLine) {
      const cached = readFromCache(cacheKey)

      if (cached) {
        setData(cached)
      }
    }
  }, [cacheKey])

  return data
}