import { supabase } from "./supabase"

export async function getMapPoints() {
  const { data, error } = await supabase
    .from("map_points")
    .select("*")
    .eq("is_active", true)

  if (error) {
    console.error("Erreur map points:", JSON.stringify(error, null, 2))
    return []
  }

  return data
}