"use client"

import { useEffect, useState } from "react"
import { saveToCache } from "@/lib/offline-cache"
import {
  saveLocalImagesOffline,
  saveRemoteImagesOffline,
} from "@/lib/offline-map-image"
import { saveOfflinePage } from "@/lib/offline-pages"
import { supabase } from "@/lib/supabase"
import { getLocalDateKey } from "@/lib/date"

function getTodayKey() {
  return getLocalDateKey()
}

function getAttractionSlugFromTargetUrl(targetUrl?: string | null) {
  const match = targetUrl?.match(/^\/attractions\/([^/?#]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

function attachAttractionsToMapPoints(mapPoints: any[], attractions: any[]) {
  const attractionsBySlug = new Map(
    attractions.map((attraction) => [attraction.slug, attraction])
  )

  return mapPoints.map((point) => {
    if (point.attraction) return point

    const slug = getAttractionSlugFromTargetUrl(point.target_url)
    const attraction = slug ? attractionsBySlug.get(slug) : null

    return attraction ? { ...point, attraction } : point
  })
}

function attachOpeningRulesToItems(
  items: any[],
  targetType: "attraction" | "map_point",
  rules: any[]
) {
  const weekday = new Date().getDay()
  const today = getTodayKey()
  const appliesToday = (rule: any) => {
    const weekdays = Array.isArray(rule.weekdays) ? rule.weekdays : []

    if (rule.starts_on && rule.starts_on > today) return false
    if (rule.ends_on && rule.ends_on < today) return false
    if (weekdays.length > 0 && !weekdays.includes(weekday)) return false

    return true
  }
  const getCurrentRule = (rulesById: Map<any, any[]>, id?: string | null) => {
    if (!id) return null
    return (rulesById.get(id) || [])
      .sort((a, b) => String(b.starts_on || "").localeCompare(String(a.starts_on || "")))
      .find(appliesToday)
  }
  const groupRules = (target: string) => {
    const rulesById = new Map<any, any[]>()

    rules
      .filter((rule) => rule.target_type === target)
      .forEach((rule) => {
        const list = rulesById.get(rule.target_id) || []
        list.push(rule)
        rulesById.set(rule.target_id, list)
      })

    return rulesById
  }

  const itemRulesById = groupRules(targetType)
  const areaRulesById = groupRules("park_area")
  const attractionRulesById = groupRules("attraction")
  const restaurantRulesById = groupRules("restaurant")
  const shopRulesById = groupRules("shop")

  return items.map((item) => {
    const itemRule = getCurrentRule(itemRulesById, item.id)
    const attractionRule =
      targetType === "map_point"
        ? getCurrentRule(attractionRulesById, item.attraction_id || item.attraction?.id)
        : null
    const restaurantRule =
      targetType === "map_point"
        ? getCurrentRule(restaurantRulesById, item.restaurant_id || item.restaurant?.id)
        : null
    const shopRule =
      targetType === "map_point"
        ? getCurrentRule(shopRulesById, item.shop_id || item.shop?.id)
        : null
    const areaRule = getCurrentRule(areaRulesById, item.area_id)

    return {
      ...item,
      entity_opening_rule: itemRule
        ? { ...itemRule, source: "specific" }
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

export default function OfflineSync() {
  const [status, setStatus] = useState("Preparation du guide...")
  const [visible, setVisible] = useState(false)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    async function syncData() {
      try {
        const today = getTodayKey()
        const year = today.slice(0, 4)

        await Promise.allSettled([
          fetch("/"),
          fetch("/offline"),
          fetch("/carte"),
          fetch("/attractions"),
          fetch("/programme"),
          fetch("/infos"),
          fetch("/horaires"),
          fetch("/map.png", { cache: "reload" }),
        ])

        await saveLocalImagesOffline()

        const [
          attractions,
          mapPoints,
          infos,
          shows,
          alerts,
          openingDays,
          entityRules,
        ] =
          await Promise.all([
            supabase.from("attractions").select(`
              *,
              park_areas(*)
            `),

            supabase
              .from("map_points")
              .select(`
                *,
                area:park_areas(*),
                attraction:attractions!map_points_attraction_id_fkey(*),
                restaurant:restaurants!map_points_restaurant_id_fkey(*),
                shop:shops!map_points_shop_id_fkey(*)
              `)
              .eq("is_active", true),

            supabase
              .from("practical_infos")
              .select("*")
              .eq("is_active", true),

            supabase
              .from("show_times")
              .select(`
                *,
                show:shows(*)
              `)
              .eq("is_active", true),

            supabase
              .from("alerts")
              .select("*")
              .eq("is_active", true),

            supabase
              .from("opening_days")
              .select(`
                *,
                schedule:entity_opening_schedules(*)
              `)
              .gte("date", `${year}-01-01`)
              .lte("date", `${year}-12-31`)
              .order("date"),

            supabase
              .from("entity_opening_rules")
              .select(`
                *,
                schedule:opening_schedules(*)
              `)
              .eq("is_active", true),
          ])

        const entityRulesData = entityRules.data || []
        const attractionsData = attachOpeningRulesToItems(
          attractions.data || [],
          "attraction",
          entityRulesData
        )
        const openingDaysData = openingDays.data || []
        const mapPointsData = attachOpeningRulesToItems(
          attachAttractionsToMapPoints(mapPoints.data || [], attractionsData),
          "map_point",
          entityRulesData
        )

        const showTimesData = (shows.data || []).filter(
          (time: any) => time.show?.status === "active"
        )

        await Promise.allSettled([
          saveOfflinePage("/"),
          saveOfflinePage("/carte"),
          saveOfflinePage("/attractions"),
          saveOfflinePage("/programme"),
          saveOfflinePage("/infos"),
          saveOfflinePage("/horaires"),
          saveOfflinePage("/offline"),

          ...attractionsData
            .filter((attraction: any) => attraction.slug)
            .map((attraction: any) =>
              saveOfflinePage(`/attractions/${attraction.slug}`)
            ),

          ...Array.from(
  new Set(
    showTimesData
      .filter((time: any) => time.show?.slug)
      .map((time: any) => time.show.slug)
  )
).map((slug: string) => saveOfflinePage(`/programme/${slug}`)),
        ])

        await saveRemoteImagesOffline([
          ...attractionsData.map((attraction: any) => attraction.image_url),
          ...showTimesData.map((time: any) => time.show?.image_url),
        ])

        saveToCache("attractions", attractionsData)
        saveToCache("map_points", mapPointsData)
        saveToCache("practical_infos", infos.data || [])
        saveToCache("shows", showTimesData)
        saveToCache("alerts", alerts.data || [])
        saveToCache("opening_days", openingDaysData)
        saveToCache(
          "today_opening",
          openingDaysData.find((openingDay: any) => openingDay.date === today) ||
            null
        )

        setStatus("Guide disponible hors ligne")
      } catch (error) {
        console.error("Erreur cache offline:", error)
        setStatus("Mode hors ligne disponible avec les dernieres donnees")
      }
    }

    const syncTimer = window.setTimeout(() => {
      syncData()
    }, 1200)

    return () => window.clearTimeout(syncTimer)
  }, [])

  useEffect(() => {
    if (status === "Preparation du guide...") return

    setRendered(true)
    setVisible(true)
    const hideTimer = window.setTimeout(() => {
      setVisible(false)
    }, 5000)
    const removeTimer = window.setTimeout(() => {
      setRendered(false)
    }, 5700)

    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(removeTimer)
    }
  }, [status])

  if (!rendered) return null

  return (
    <div
      className={`pointer-events-none fixed bottom-16 left-1/2 z-40 -translate-x-1/2 rounded-full bg-white/85 px-3 py-1 text-center text-[10px] font-medium text-gray-400 shadow-sm backdrop-blur transition-opacity duration-700 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-live="polite"
    >
      {status}
    </div>
  )
}
