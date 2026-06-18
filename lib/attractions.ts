import { supabase } from "./supabase"
import { connection } from "next/server"

async function getEntityRules(targetType: string, targetIds: string[]) {
  if (targetIds.length === 0) return []

  const { data, error } = await supabase
    .from("entity_opening_rules")
    .select(`
      *,
      schedule:entity_opening_schedules(*)
    `)
    .eq("target_type", targetType)
    .eq("is_active", true)
    .in("target_id", targetIds)

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

async function attachOpeningRules(attractions: any[]) {
  const attractionIds = attractions.map((attraction) => attraction.id)
  const areaIds = Array.from(
    new Set(attractions.map((attraction) => attraction.area_id).filter(Boolean))
  )

  const [attractionRules, areaRules] = await Promise.all([
    getEntityRules("attraction", attractionIds),
    getEntityRules("park_area", areaIds),
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

export async function getAttractions() {
  await connection()

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

  return attachOpeningRules(data || [])
}

export async function getAttractionBySlug(slug: string) {
  await connection()

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

  if (!data) return null

  const [attraction] = await attachOpeningRules([data])
  return attraction
}
