"use client"

import { useEffect, useState } from "react"
import { readFromCache } from "@/lib/offline-cache"

export function useOfflineData(cacheKey: string, serverData: any[]) {
  const [data, setData] = useState(serverData)
  const serverDataSignature = JSON.stringify(serverData)

  useEffect(() => {
    function applyData() {
      const cached = readFromCache(cacheKey)

      if (!navigator.onLine || serverData.length === 0) {
        if (cached) {
          setData(cached)
        }
        return
      }

      setData(serverData)
    }

    function handleCacheUpdated(event: Event) {
      const cacheEvent = event as CustomEvent<{ key?: string }>

      if (cacheEvent.detail?.key === cacheKey) {
        applyData()
      }
    }

    applyData()
    window.addEventListener("offline-cache-updated", handleCacheUpdated)

    return () => {
      window.removeEventListener("offline-cache-updated", handleCacheUpdated)
    }
  }, [cacheKey, serverDataSignature])

  return data
}
