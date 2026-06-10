import { supabase } from "./supabase"

export async function getMapPoints() {
  const { data, error } = await supabase
    .from("map_points")
    .select(`
      *,
      area:park_areas(*),
      attraction:attractions!map_points_attraction_id_fkey(*)
    `)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    console.error("Erreur getMapPoints:", JSON.stringify(error, null, 2))
    return []
  }

  return data || []
}

export async function getAllMapPoints() {
  const { data, error } = await supabase
    .from("map_points")
    .select(`
      *,
      area:park_areas(*),
      attraction:attractions!map_points_attraction_id_fkey(*)
    `)
    .order("name", { ascending: true })

  if (error) {
    console.error("Erreur getAllMapPoints:", JSON.stringify(error, null, 2))
    return []
  }

  return data || []
}