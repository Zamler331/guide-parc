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
    `getEntityRules ${targetType} timeout`,
    options
  )

  if (error) {
    console.error("Erreur getEntityRules:", error)
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
    return String(a.created_at || "").localeCompare(String(b.created_at || ""))
  })
}

function getRuleForTarget(rulesById: Map<any, any[]>, targetId?: string | null) {
  if (!targetId) return null
  return sortRulesByPriority(rulesById.get(targetId) || []).find(ruleAppliesToday) || null
}

async function attachOpeningRules(
  attractions: any[],
  options: FastDataOptions = {}
) {
  const attractionIds = attractions.map((attraction) => attraction.id)
  const areaIds = Array.from(
    new Set(attractions.map((attraction) => attraction.area_id).filter(Boolean))
  )

  const [attractionRules, areaRules] = await Promise.all([
    getEntityRules("attraction", attractionIds, options),
    getEntityRules("park_area", areaIds, options),
  ])

  const attractionRulesById = new Map<any, any[]>()
  attractionRules.forEach((rule) => {
    const list = attractionRulesById.get(rule.target_id) || []
    list.push(rule)
    attractionRulesById.set(rule.target_id, list)
  })

  const areaRulesById = new Map<any, any[]>()
  areaRules.forEach((rule) => {
    const list = areaRulesById.get(rule.target_id) || []
    list.push(rule)
    areaRulesById.set(rule.target_id, list)
  })

  return attractions.map((attraction) => {
    const attractionRule = getRuleForTarget(attractionRulesById, attraction.id)
    const areaRule = getRuleForTarget(areaRulesById, attraction.area_id)

    return {
      ...attraction,
      entity_opening_rule: attractionRule
        ? { ...attractionRule, source: "specific" }
        : areaRule
          ? { ...areaRule, source: "area" }
          : null,
    }
  })
}

export async function getAttractions(options: FastDataOptions = {}) {
  await connection()

  const { data, error } = await withFastFallback(
    supabase
      .from("attractions")
      .select(`
        *,
        park_areas (
          name
        )
      `)
      .order("name", { ascending: true }),
    { data: [] as any[], error: null },
    "getAttractions timeout",
    options
  )

  if (error) {
    console.error("Erreur getAttractions:", error)
    return []
  }

  return attachOpeningRules(data || [], options)
}

export async function getAttractionBySlug(slug: string) {
  await connection()
  const normalizedSlug = slugify(slug)

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

  if (!data && normalizedSlug && normalizedSlug !== slug) {
    const { data: normalizedData, error: normalizedError } = await supabase
      .from("attractions")
      .select(`
        *,
        park_areas (
          name
        )
      `)
      .eq("slug", normalizedSlug)
      .maybeSingle()

    if (normalizedError) {
      console.error("Erreur getAttractionBySlug normalized:", normalizedError)
      return null
    }

    if (!normalizedData) return null

    const [attraction] = await attachOpeningRules([normalizedData])
    return attraction
  }

  if (!data) return null

  const [attraction] = await attachOpeningRules([data])
  return attraction
}
