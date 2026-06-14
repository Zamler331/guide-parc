import { supabase } from "./supabase"

function getAttractionSlugFromTargetUrl(targetUrl?: string | null) {
  const match = targetUrl?.match(/^\/attractions\/([^/?#]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

async function attachAttractionsFromTargetUrl(points: any[]) {
  const missingSlugs = Array.from(
    new Set(
      points
        .filter((point) => point.type === "attraction" && !point.attraction)
        .map((point) => getAttractionSlugFromTargetUrl(point.target_url))
        .filter(Boolean)
    )
  )

  if (missingSlugs.length === 0) return points

  const { data, error } = await supabase
    .from("attractions")
    .select("*")
    .in("slug", missingSlugs)

  if (error) {
    console.error("Erreur attractions liées aux points:", JSON.stringify(error, null, 2))
    return points
  }

  const attractionsBySlug = new Map(
    (data || []).map((attraction) => [attraction.slug, attraction])
  )

  return points.map((point) => {
    if (point.attraction) return point

    const slug = getAttractionSlugFromTargetUrl(point.target_url)
    const attraction = slug ? attractionsBySlug.get(slug) : null

    return attraction ? { ...point, attraction } : point
  })
}

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

  return attachAttractionsFromTargetUrl(data || [])
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

  return attachAttractionsFromTargetUrl(data || [])
}
