import { supabase } from "./supabase"

export async function getPracticalInfos() {
  const { data, error } = await supabase
    .from("practical_infos")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Erreur practical infos:", error)
    return []
  }

  return data
}