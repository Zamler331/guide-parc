import { supabase } from "./supabase"

export async function getOpeningSchedules() {
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

export async function getOpeningDays() {
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

export async function getTodayOpening() {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  const today = `${year}-${month}-${day}`

  const { data, error } = await supabase
    .from("opening_days")
    .select(`
      *,
      schedule:opening_schedules(*)
    `)
    .eq("date", today)
    .maybeSingle()

  if (error) {
    console.error("Erreur getTodayOpening:", JSON.stringify(error, null, 2))
    return null
  }

  return data
}

export async function getOpeningDaysForYear(year: number) {
  const start = `${year}-01-01`
  const end = `${year}-12-31`

  const { data, error } = await supabase
    .from("opening_days")
    .select(`
      *,
      schedule:opening_schedules(*)
    `)
    .gte("date", start)
    .lte("date", end)
    .order("date")

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

export function isParkOpenNow(opening: any) {
  if (!opening?.schedule?.is_open) return false
  if (!opening.schedule.opens_at || !opening.schedule.closes_at) return false

  const now = new Date()

  const opensAt = buildDateTime(opening.date, opening.schedule.opens_at)
  const closesAt = buildDateTime(opening.date, opening.schedule.closes_at)

  return now >= opensAt && now <= closesAt
}

export function getAttractionVisitorStatus(attraction: any, opening: any) {
  if (attraction.status === "hidden") return "hidden"
  if (attraction.status === "maintenance") return "maintenance"
  if (attraction.status === "closed") return "closed"

  return isParkOpenNow(opening) ? "open" : "closed"
}