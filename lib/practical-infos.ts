import { supabase } from "./supabase"
import { FastDataOptions, withFastFallback } from "./fast-data"

export async function getPracticalInfos(options: FastDataOptions = {}) {
  const { data, error } = await withFastFallback(
    supabase
      .from("practical_infos")
      .select("*")
      .order("sort_order", { ascending: true }),
    { data: [] as any[], error: null },
    "getPracticalInfos timeout",
    options
  )

  if (error) {
    console.error("Erreur practical_infos:", JSON.stringify(error, null, 2))
    return []
  }

  return data || []
}
