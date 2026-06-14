"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { flushAnalyticsQueue, trackEvent } from "@/lib/analytics"

export default function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    flushAnalyticsQueue()

    function handleOnline() {
      flushAnalyticsQueue()
    }

    function handleInstalled() {
      trackEvent("pwa_installed", {
        page: window.location.pathname,
        metadata: { source: "appinstalled" },
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("appinstalled", handleInstalled)

    let shouldTrackAppOpen = true

    try {
      shouldTrackAppOpen = !sessionStorage.getItem(
        "guide_parc_app_opened_tracked"
      )
      if (shouldTrackAppOpen) {
        sessionStorage.setItem("guide_parc_app_opened_tracked", "true")
      }
    } catch {
      shouldTrackAppOpen = true
    }

    if (shouldTrackAppOpen) {
      trackEvent("app_opened", {
        page: window.location.pathname,
        metadata: {
          standalone:
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as Navigator & { standalone?: boolean })
              .standalone === true,
        },
      })
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("appinstalled", handleInstalled)
    }
  }, [])

  useEffect(() => {
    trackEvent("page_view", { page: pathname })
  }, [pathname])

  return null
}
