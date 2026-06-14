"use client"

import { useEffect, useMemo, useState } from "react"
import { trackEvent } from "@/lib/analytics"

function getStyle(type: string) {
  switch (type) {
    case "warning":
      return "bg-orange-500 text-white"
    case "danger":
      return "bg-red-600 text-white"
    case "success":
      return "bg-green-600 text-white"
    default:
      return "bg-blue-600 text-white"
  }
}

export default function AlertTicker({ alerts }: { alerts: any[] }) {
  const [closed, setClosed] = useState(false)

  const alertKey = useMemo(() => {
    return alerts.map((alert) => alert.id).join("-")
  }, [alerts])

  useEffect(() => {
    if (!alertKey) return

    const isClosed = sessionStorage.getItem(`visitor-alert-closed-${alertKey}`)
    setClosed(isClosed === "true")
  }, [alertKey])

  useEffect(() => {
    if (!alerts || alerts.length === 0 || closed || !alertKey) return
    if (sessionStorage.getItem(`visitor-alert-seen-${alertKey}`)) return

    sessionStorage.setItem(`visitor-alert-seen-${alertKey}`, "true")

    alerts.forEach((alert) => {
      trackEvent("alert_seen", {
        page: window.location.pathname,
        entityType: "alert",
        entityId: alert.id,
        metadata: {
          type: alert.type,
          title: alert.title,
        },
      })
    })
  }, [alerts, alertKey, closed])

  if (!alerts || alerts.length === 0 || closed) return null

  const text = alerts
    .map((alert) => `${alert.title} : ${alert.message}`)
    .join("  •  ")

  return (
    <div
      className={`relative z-50 flex items-center gap-2 px-3 py-2 text-xs font-semibold ${getStyle(
        alerts[0].type
      )}`}
    >
      <div className="overflow-hidden whitespace-nowrap">
  <div className="animate-marquee inline-flex gap-12">
    <span>{text}</span>
    <span>{text}</span>
  </div>
</div>

      <button
        type="button"
        onClick={() => {
          sessionStorage.setItem(`visitor-alert-closed-${alertKey}`, "true")
          setClosed(true)
        }}
        className="rounded-full bg-white/20 px-2 py-1 text-xs"
      >
        ✕
      </button>
    </div>
  )
}
