"use client"

import { useEffect } from "react"
import { trackEvent } from "@/lib/analytics"

type TrackEventOnMountProps = {
  eventName:
    | "map_opened"
    | "attraction_opened"
    | "show_schedule_opened"
    | "info_opened"
  page?: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
}

export default function TrackEventOnMount({
  eventName,
  page,
  entityType,
  entityId,
  metadata,
}: TrackEventOnMountProps) {
  useEffect(() => {
    trackEvent(eventName, {
      page,
      entityType,
      entityId,
      metadata,
    })
  }, [eventName, page, entityType, entityId, metadata])

  return null
}
