import { supabase } from "./supabase"

export async function getAttractions() {
  const { data, error } = await supabase
    .from("attractions")
    .select(`
      *,
      park_areas (
        name
      )
    `)
    .order("name", { ascending: true })

  if (error) {
    console.error("Erreur getAttractions:", error)
    return []
  }

  return data
}

export async function getAttractionBySlug(slug: string) {
  const { data, error } = await supabase
    .from("attractions")
    .select(`
      *,
      park_areas (
        name
      )
    `)
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    console.error("Erreur getAttractionBySlug:", error)
    return null
  }

  return data
}