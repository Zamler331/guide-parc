import { supabase } from "./supabase"
import { connection } from "next/server"
import { FastDataOptions, withFastFallback } from "./fast-data"

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function getEntityRules(
  targetType: string,
  targetIds: string[],
  options: FastDataOptions = {}
) {
  if (targetIds.length === 0) return []

  const { data, error } = await withFastFallback(
    supabase
      .from("entity_opening_rules")
      .select(`
        *,
        schedule:entity_opening_schedules(*)
      `)
      .eq("target_type", targetType)
      .eq("is_active", true)
      .in("target_id", targetIds),
    { data: [] as any[], error: null },
    `getMapEntityRules ${targetType} timeout`,
    options
  )

  if (error) {
    console.error("Erreur horaires points carte:", JSON.stringify(error, null, 2))
    return []
  }

  return data || []
}

function getTodayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function getTodayWeekday() {
  return new Date().getDay()
}

function ruleAppliesToday(rule: any) {
  const today = getTodayKey()
  const weekday = getTodayWeekday()
  const weekdays = Array.isArray(rule.weekdays) ? rule.weekdays : []

  if (rule.starts_on && rule.starts_on > today) return false
  if (rule.ends_on && rule.ends_on < today) return false
  if (weekdays.length > 0 && !weekdays.includes(weekday)) return false

  return true
}

function sortRulesByPriority(rules: any[]) {
  return [...rules].sort((a, b) => {
    const dateA = a.starts_on || ""
    const dateB = b.starts_on || ""
    if (dateA !== dateB) return dateA < dateB ? 1 : -1
    return String(b.created_at || "").localeCompare(String(a.created_at || ""))
  })
}

function groupRulesByTarget(rules: any[]) {
  const rulesById = new Map<any, any[]>()

  rules.forEach((rule) => {
    const list = rulesById.get(rule.target_id) || []
    list.push(rule)
    rulesById.set(rule.target_id, list)
  })

  return rulesById
}

function getRuleForTarget(rulesById: Map<any, any[]>, targetId?: string | null) {
  if (!targetId) return null
  return sortRulesByPriority(rulesById.get(targetId) || []).find(ruleAppliesToday) || null
}

async function attachOpeningRules(points: any[], options: FastDataOptions = {}) {
  const pointIds = points.map((point) => point.id)
  const attractionIds = Array.from(
    new Set(
      points
        .map((point) => point.attraction_id || point.attraction?.id)
        .filter(Boolean)
    )
  )
  const restaurantIds = Array.from(
    new Set(
      points
        .map((point) => point.restaurant_id || point.restaurant?.id)
        .filter(Boolean)
    )
  )
  const shopIds = Array.from(
    new Set(points.map((point) => point.shop_id || point.shop?.id).filter(Boolean))
  )
  const areaIds = Array.from(
    new Set(points.map((point) => point.area_id).filter(Boolean))
  )

  const [pointRules, attractionRules, restaurantRules, shopRules, areaRules] =
    await Promise.all([
      getEntityRules("map_point", pointIds, options),
      getEntityRules("attraction", attractionIds, options),
      getEntityRules("restaurant", restaurantIds, options),
      getEntityRules("shop", shopIds, options),
      getEntityRules("park_area", areaIds, options),
    ])

  const pointRulesById = groupRulesByTarget(pointRules)
  const attractionRulesById = groupRulesByTarget(attractionRules)
  const restaurantRulesById = groupRulesByTarget(restaurantRules)
  const shopRulesById = groupRulesByTarget(shopRules)
  const areaRulesById = groupRulesByTarget(areaRules)

  return points.map((point) => {
    const pointRule = getRuleForTarget(pointRulesById, point.id)
    const attractionRule = getRuleForTarget(
      attractionRulesById,
      point.attraction_id || point.attraction?.id
    )
    const restaurantRule = getRuleForTarget(
      restaurantRulesById,
      point.restaurant_id || point.restaurant?.id
    )
    const shopRule = getRuleForTarget(shopRulesById, point.shop_id || point.shop?.id)
    const areaRule = getRuleForTarget(areaRulesById, point.area_id)

    return {
      ...point,
      entity_opening_rule: pointRule
        ? { ...pointRule, source: "specific" }
        : attractionRule
          ? { ...attractionRule, source: "specific" }
          : restaurantRule
            ? { ...restaurantRule, source: "specific" }
            : shopRule
              ? { ...shopRule, source: "specific" }
              : areaRule
                ? { ...areaRule, source: "area" }
                : null,
    }
  })
}

function getAttractionSlugFromTargetUrl(targetUrl?: string | null) {
  const match = targetUrl?.match(/^\/attractions\/([^/?#]+)/)
  return match ? slugify(decodeURIComponent(match[1])) : null
}

async function attachAttractionsFromTargetUrl(
  points: any[],
  options: FastDataOptions = {}
) {
  const missingSlugs = Array.from(
    new Set(
      points
        .filter((point) => point.type === "attraction" && !point.attraction)
        .map((point) => getAttractionSlugFromTargetUrl(point.target_url))
        .filter(Boolean)
    )
  )

  if (missingSlugs.length === 0) return points

  const { data, error } = await withFastFallback(
    supabase.from("attractions").select("*").in("slug", missingSlugs),
    { data: [] as any[], error: null },
    "attachAttractionsFromTargetUrl timeout",
    options
  )

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

export async function getMapPoints(options: FastDataOptions = {}) {
  await connection()

  const { data, error } = await withFastFallback(
    supabase
      .from("map_points")
      .select(`
        *,
        area:park_areas(*),
        attraction:attractions!map_points_attraction_id_fkey(*),
        restaurant:restaurants!map_points_restaurant_id_fkey(*),
        shop:shops!map_points_shop_id_fkey(*)
      `)
      .eq("is_active", true)
      .order("name", { ascending: true }),
    { data: [] as any[], error: null },
    "getMapPoints timeout",
    options
  )

  if (error) {
    console.error("Erreur getMapPoints:", JSON.stringify(error, null, 2))
    return []
  }

  const points = await attachAttractionsFromTargetUrl(data || [], options)
  return attachOpeningRules(points, options)
}

export async function getAllMapPoints() {
  await connection()

  const { data, error } = await supabase
    .from("map_points")
    .select(`
      *,
      area:park_areas(*),
      attraction:attractions!map_points_attraction_id_fkey(*),
      restaurant:restaurants!map_points_restaurant_id_fkey(*),
      shop:shops!map_points_shop_id_fkey(*)
    `)
    .order("name", { ascending: true })

  if (error) {
    console.error("Erreur getAllMapPoints:", JSON.stringify(error, null, 2))
    return []
  }

  const points = await attachAttractionsFromTargetUrl(data || [])
  return attachOpeningRules(points)
}
