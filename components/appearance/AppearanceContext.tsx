"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { readFromCache } from "@/lib/offline-cache"
import {
  APPEARANCE_CACHE_KEY,
  AppearanceSettings,
  DEFAULT_APPEARANCE_SETTINGS,
  isDefaultAppearance,
  mergeAppearanceSettings,
} from "@/lib/appearance-defaults"

const AppearanceContext = createContext<AppearanceSettings>(
  DEFAULT_APPEARANCE_SETTINGS
)

export function AppearanceProvider({
  settings,
  children,
}: {
  settings: AppearanceSettings
  children: ReactNode
}) {
  const serverSettings = useMemo(
    () => mergeAppearanceSettings(settings),
    [settings]
  )
  const [appearance, setAppearance] = useState(serverSettings)

  useEffect(() => {
    const cached = readFromCache(APPEARANCE_CACHE_KEY)
    const shouldPreferCache =
      cached && (!navigator.onLine || isDefaultAppearance(serverSettings))

    setAppearance(
      shouldPreferCache ? mergeAppearanceSettings(cached) : serverSettings
    )
  }, [serverSettings])

  useEffect(() => {
    function handleCacheUpdate(event: Event) {
      const detail = (event as CustomEvent).detail
      if (detail?.key !== APPEARANCE_CACHE_KEY) return

      const cached = readFromCache(APPEARANCE_CACHE_KEY)
      if (cached) setAppearance(mergeAppearanceSettings(cached))
    }

    window.addEventListener("offline-cache-updated", handleCacheUpdate)
    return () =>
      window.removeEventListener("offline-cache-updated", handleCacheUpdate)
  }, [])

  return (
    <AppearanceContext.Provider value={appearance}>
      {children}
    </AppearanceContext.Provider>
  )
}

export function useAppearance() {
  return useContext(AppearanceContext)
}
