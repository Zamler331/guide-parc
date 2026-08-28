import { connection } from "next/server"
import { createSupabaseServerClient } from "./supabase-server"
import {
  AppearanceSettings,
  DEFAULT_APPEARANCE_SETTINGS,
  VisualProfile,
  VisualProfileStatus,
  mergeAppearanceSettings,
} from "./appearance-defaults"

type VisualProfileRow = {
  id: string
  name: string
  status: VisualProfileStatus
  settings?: Partial<AppearanceSettings> | null
  created_at?: string | null
  updated_at?: string | null
  published_at?: string | null
}

function rowToProfile(row: VisualProfileRow): VisualProfile {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    settings: mergeAppearanceSettings(row.settings),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  }
}

export async function getVisualProfiles(): Promise<VisualProfile[]> {
  await connection()
  const supabase = await createSupabaseServerClient()

  const { data, error } = (await supabase
    .from("app_visual_profiles")
    .select("id,name,status,settings,created_at,updated_at,published_at")
    .order("status")
    .order("updated_at", { ascending: false })) as {
    data: VisualProfileRow[] | null
    error: any
  }

  if (error || !data) return []

  return data.map(rowToProfile)
}

export async function getPublishedVisualProfile(): Promise<VisualProfile | null> {
  await connection()
  const supabase = await createSupabaseServerClient()

  const { data, error } = (await supabase
    .from("app_visual_profiles")
    .select("id,name,status,settings,created_at,updated_at,published_at")
    .eq("status", "published")
    .maybeSingle()) as {
    data: VisualProfileRow | null
    error: any
  }

  if (error || !data) return null

  return rowToProfile(data)
}

export function getDefaultVisualProfile(settings = DEFAULT_APPEARANCE_SETTINGS) {
  return {
    id: "default",
    name: "Style par defaut",
    status: "published" as const,
    settings,
    createdAt: null,
    updatedAt: null,
    publishedAt: null,
  }
}
