"use client"

import { createSupabaseAuthClient } from "./supabase-auth-client"

type AnalyticsEventName =
  | "app_opened"
  | "pwa_installed"
  | "page_view"
  | "map_opened"
  | "attraction_opened"
  | "show_schedule_opened"
  | "info_opened"
  | "alert_seen"
  | "install_button_clicked"

type TrackEventData = {
  page?: string | null
  entityType?: string | null
  entityId?: string | null
  metadata?: Record<string, unknown> | null
}

type QueuedAnalyticsEvent = {
  event_name: AnalyticsEventName
  device_id: string
  page: string | null
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

const DEVICE_ID_KEY = "guide_parc_analytics_device_id"
const QUEUE_KEY = "guide_parc_analytics_queue"
const MAX_QUEUE_SIZE = 200
let memoryDeviceId = ""

function isBrowser() {
  return typeof window !== "undefined"
}

function readQueue(): QueuedAnalyticsEvent[] {
  if (!isBrowser()) return []

  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeQueue(events: QueuedAnalyticsEvent[]) {
  if (!isBrowser()) return

  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(events.slice(-MAX_QUEUE_SIZE)))
  } catch {
    // Analytics must never block the visitor experience.
  }
}

export function getAnalyticsDeviceId() {
  if (!isBrowser()) return ""

  const nextId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY)
    if (existing) return existing

    localStorage.setItem(DEVICE_ID_KEY, nextId)
    return nextId
  } catch {
    if (!memoryDeviceId) memoryDeviceId = nextId
    return memoryDeviceId
  }
}

async function sendEvents(events: QueuedAnalyticsEvent[]) {
  if (events.length === 0) return true

  try {
    const supabase = createSupabaseAuthClient()
    const { error } = await supabase.from("analytics_events").insert(events)

    return !error
  } catch {
    return false
  }
}

function queueEvent(event: QueuedAnalyticsEvent) {
  writeQueue([...readQueue(), event])
}

export async function flushAnalyticsQueue() {
  try {
    if (!isBrowser() || !navigator.onLine) return

    const queue = readQueue()
    if (queue.length === 0) return

    const sent = await sendEvents(queue)
    if (sent) writeQueue([])
  } catch {
    // Ignore analytics sync failures.
  }
}

export async function trackEvent(
  eventName: AnalyticsEventName,
  data: TrackEventData = {}
) {
  try {
    if (!isBrowser()) return

    const event: QueuedAnalyticsEvent = {
      event_name: eventName,
      device_id: getAnalyticsDeviceId(),
      page: data.page ?? window.location.pathname,
      entity_type: data.entityType ?? null,
      entity_id: data.entityId ?? null,
      metadata: data.metadata ?? null,
      created_at: new Date().toISOString(),
    }

    if (!navigator.onLine) {
      queueEvent(event)
      return
    }

    const sent = await sendEvents([event])
    if (!sent) queueEvent(event)
  } catch {
    // Ignore analytics failures.
  }
}
