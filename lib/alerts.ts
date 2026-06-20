import { supabase } from "./supabase"
import { FastDataOptions, withFastFallback } from "./fast-data"

export async function getAlerts() {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .order("starts_at", { ascending: false, nullsFirst: false })

  if (error) {
    console.error("Erreur getAlerts:", JSON.stringify(error, null, 2))
    return []
  }

  return data || []
}

export async function getActiveAlerts(options: FastDataOptions = {}) {
  const { data, error } = await withFastFallback(
    supabase.from("alerts").select("*").eq("is_active", true),
    { data: [] as any[], error: null },
    "getActiveAlerts timeout",
    options
  )

  if (error) {
    console.error("Erreur getActiveAlerts:", JSON.stringify(error, null, 2))
    return []
  }

  const now = new Date()

  return (data || []).filter((alert) => {
    const startsAt = alert.starts_at ? new Date(alert.starts_at) : null
    const endsAt = alert.ends_at ? new Date(alert.ends_at) : null

    if (startsAt && startsAt > now) return false
    if (endsAt && endsAt < now) return false

    return true
  })
}
