import { supabase } from "./supabase"

export async function getShows() {
  const { data, error } = await supabase
    .from("shows")
    .select("*")
    .order("title", { ascending: true })

  if (error) {
    console.error("Erreur getShows:", JSON.stringify(error, null, 2))
    return []
  }

  return data || []
}

export async function getActiveShows() {
  const { data, error } = await supabase
    .from("shows")
    .select("*")
    .eq("status", "active")
    .order("title", { ascending: true })

  if (error) {
    console.error("Erreur getActiveShows:", JSON.stringify(error, null, 2))
    return []
  }

  return data || []
}

export async function getShowTimes() {
  const { data, error } = await supabase
    .from("show_times")
    .select(`
      *,
      show:shows(*)
    `)
    .order("show_date", { ascending: true })
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Erreur getShowTimes:", JSON.stringify(error, null, 2))
    return []
  }

  return data || []
}

export async function getTodayShowTimes() {
  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("show_times")
    .select(`
      *,
      show:shows(*)
    `)
    .eq("show_date", today)
    .eq("is_active", true)
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Erreur getTodayShowTimes:", JSON.stringify(error, null, 2))
    return []
  }

  return (data || []).filter((time) => time.show?.status === "active")
}

function getTodayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export async function getShowById(id: string) {
  const { data, error } = await supabase
    .from("shows")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("Erreur getShowById:", JSON.stringify(error, null, 2))
    return null
  }

  return data
}

export async function getTodayShowTimesForShow(showId: string) {
  const today = getTodayKey()

  const { data, error } = await supabase
    .from("show_times")
    .select("*")
    .eq("show_id", showId)
    .eq("show_date", today)
    .eq("is_active", true)
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Erreur getTodayShowTimesForShow:", JSON.stringify(error, null, 2))
    return []
  }

  return data || []
}

export async function getShowBySlug(slug: string) {
  const { data, error } = await supabase
    .from("shows")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    console.error("Erreur getShowBySlug:", error)
    return null
  }

  return data
}