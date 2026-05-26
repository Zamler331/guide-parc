import { supabase } from "./supabase"

export async function getTodayShows() {
  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("shows")
    .select("*")
    .eq("status", "active")
    .eq("show_date", today)
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Erreur shows:", error)
    return []
  }

  return data
}