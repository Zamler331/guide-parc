import { connection } from "next/server"
import { supabase } from "./supabase"

export async function getRestaurants() {
  await connection()

  const { data, error } = await supabase
    .from("restaurants")
    .select(`
      *,
      park_areas (
        name
      )
    `)
    .order("name")

  if (error) {
    console.error("Erreur getRestaurants:", error)
    return []
  }

  return data || []
}

export async function getShops() {
  await connection()

  const { data, error } = await supabase
    .from("shops")
    .select(`
      *,
      park_areas (
        name
      )
    `)
    .order("name")

  if (error) {
    console.error("Erreur getShops:", error)
    return []
  }

  return data || []
}
