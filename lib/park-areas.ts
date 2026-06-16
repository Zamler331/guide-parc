import { supabase } from "./supabase"
import { connection } from "next/server"

export async function getParkAreas() {
  await connection()

  const { data, error } = await supabase
    .from("park_areas")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Erreur getParkAreas:", JSON.stringify(error, null, 2))
    return []
  }

  return data || []
}
