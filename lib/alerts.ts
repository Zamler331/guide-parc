import { supabase } from "./supabase"

export async function getActiveAlerts() {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)

  if (error) {
    console.error("Erreur alerts:", error)
    return []
  }

  return data
}