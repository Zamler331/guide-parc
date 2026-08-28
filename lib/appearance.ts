import { connection } from "next/server"
import { FastDataOptions, withFastFallback } from "./fast-data"
import { supabase } from "./supabase"
import {
  AppearanceSettings,
  DEFAULT_APPEARANCE_SETTINGS,
  mergeAppearanceSettings,
} from "./appearance-defaults"

export async function getAppearanceSettings(
  options: FastDataOptions = {}
): Promise<AppearanceSettings> {
  await connection()

  const publishedProfile = await withFastFallback(
    supabase
      .from("app_visual_profiles")
      .select("settings")
      .eq("status", "published")
      .maybeSingle(),
    { data: null, error: null },
    "app_visual_profiles",
    options
  ) as {
    data: { settings?: Partial<AppearanceSettings> | null } | null
    error: any
  }

  if (!publishedProfile.error && publishedProfile.data) {
    return mergeAppearanceSettings(publishedProfile.data.settings)
  }

  const { data, error } = await withFastFallback(
    supabase
      .from("app_appearance_settings")
      .select("settings")
      .eq("id", "default")
      .maybeSingle(),
    { data: null, error: null },
    "app_appearance_settings",
    options
  ) as {
    data: { settings?: Partial<AppearanceSettings> | null } | null
    error: any
  }

  if (error) {
    return DEFAULT_APPEARANCE_SETTINGS
  }

  return mergeAppearanceSettings(data?.settings)
}
