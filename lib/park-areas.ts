import { supabase } from "./supabase"

export async function getParkAreas() {
  const { data, error } = await supabase
    .from("park_areas")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Erreur park areas:", error)
    return []
  }

  return data
}