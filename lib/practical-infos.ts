import { supabase } from "./supabase"

export async function getPracticalInfos() {
  const { data, error } = await supabase
    .from("practical_infos")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Erreur practical_infos:", JSON.stringify(error, null, 2))
    return []
  }

  return data || []
}