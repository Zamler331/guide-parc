import { supabase } from "./supabase"
import { connection } from "next/server"
import { getEffectiveOpeningRule } from "./opening-display"
import { FastDataOptions, withFastFallback } from "./fast-data"

export {
  formatOpeningTime,
  getEffectiveOpeningDisplay,
  getEffectiveOpeningRule,
  getOpeningScheduleLabel,
  getOpeningSourceLabel,
} from "./opening-display"

export async function getOpeningSchedules() {
  await connection()

  const { data, error } = await supabase
    .from("opening_schedules")
    .select("*")
    .order("sort_order")

  if (error) {
    console.error(error)
    return []
  }

  return data || []
}

export async function getEntityOpeningSchedules() {
  await connection()

  const { data, error } = await supabase
    .from("entity_opening_schedules")
    .select("*")
    .order("sort_order")
    .order("name")

  if (error) {
    console.error("Erreur getEntityOpeningSchedules:", error)
    return []
  }

  return data || []
}

export async function getOpeningDays() {
  await connection()

  const { data, error } = await supabase
    .from("opening_days")
    .select(`
      *,
      schedule:opening_schedules(*)
    `)

  if (error) {
    console.error(error)
    return []
  }

  return data || []
}

export async function getTodayOpening(options: FastDataOptions = {}) {
  await connection()

  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  const today = `${year}-${month}-${day}`

  const { data, error } = await withFastFallback(
    supabase
      .from("opening_days")
      .select(`
        *,
        schedule:opening_schedules(*)
      `)
      .eq("date", today)
      .maybeSingle(),
    { data: null, error: null },
    "getTodayOpening timeout",
    options
  )

  if (error) {
    console.error("Erreur getTodayOpening:", JSON.stringify(error, null, 2))
    return null
  }

  return data
}

export async function getOpeningDaysForYear(
  year: number,
  options: FastDataOptions = {}
) {
  await connection()

  const start = `${year}-01-01`
  const end = `${year}-12-31`

  const { data, error } = await withFastFallback(
    supabase
      .from("opening_days")
      .select(`
        *,
        schedule:opening_schedules(*)
      `)
      .gte("date", start)
      .lte("date", end)
      .order("date"),
    { data: [] as any[], error: null },
    "getOpeningDaysForYear timeout",
    options
  )

  if (error) {
    console.error("Erreur getOpeningDaysForYear:", error)
    return []
  }

  return data || []
}

function buildDateTime(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number)
  const [hours, minutes] = time.split(":").map(Number)

  return new Date(year, month - 1, day, hours, minutes)
}

function getTodayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function isScheduleOpenNow(schedule: any, date = getTodayKey()) {
  if (!schedule?.is_open) return false
  if (!schedule.opens_at || !schedule.closes_at) return false

  const now = new Date()
  const opensAt = buildDateTime(date, schedule.opens_at)
  const closesAt = buildDateTime(date, schedule.closes_at)

  return now >= opensAt && now <= closesAt
}

export function isParkOpenNow(opening: any) {
  if (!opening?.date) return false
  return isScheduleOpenNow(opening.schedule, opening.date)
}

export function getAttractionVisitorStatus(attraction: any, opening: any) {
  if (attraction.status === "hidden") return "hidden"
  if (attraction.status === "maintenance") return "maintenance"
  if (attraction.status === "closed") return "closed"

  const effectiveOpening = getEffectiveOpeningRule(attraction, opening)

  if (effectiveOpening?.schedule) {
    return isScheduleOpenNow(effectiveOpening.schedule) ? "open" : "closed"
  }

  return isParkOpenNow(opening) ? "open" : "closed"
}

export async function getEntityOpeningRules() {
  await connection()

  const { data, error } = await supabase
    .from("entity_opening_rules")
    .select(`
      *,
      schedule:entity_opening_schedules(*)
    `)
    .order("target_type", { ascending: true })
    .order("starts_on", { ascending: false, nullsFirst: false })

  if (error) {
    console.error("Erreur getEntityOpeningRules:", error)
    return []
  }

  return data || []
}
