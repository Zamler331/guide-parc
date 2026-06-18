export function formatOpeningTime(time?: string | null) {
  return time ? time.slice(0, 5).replace(":", "h") : ""
}

export function getOpeningScheduleLabel(schedule: any) {
  if (!schedule) return ""
  if (!schedule.is_open) return "Fermé aujourd'hui"

  const opensAt = formatOpeningTime(schedule.opens_at)
  const closesAt = formatOpeningTime(schedule.closes_at)

  if (!opensAt || !closesAt) return "Horaire indisponible"
  return `${opensAt} - ${closesAt}`
}

export function getEffectiveOpeningRule(item: any, opening: any) {
  if (opening?.schedule && !opening.schedule.is_open) {
    return {
      source: "park",
      schedule: opening.schedule,
      note: opening.note || null,
    }
  }

  const entityRule = item?.entity_opening_rule

  if (entityRule?.is_active && entityRule.schedule) {
    return {
      source: entityRule.source || "specific",
      schedule: entityRule.schedule,
      note: entityRule.note || null,
    }
  }

  if (opening?.schedule) {
    return {
      source: "park",
      schedule: opening.schedule,
      note: opening.note || null,
    }
  }

  return null
}

export function getOpeningSourceLabel(source?: string | null) {
  if (source === "specific") return "Horaires d'ouverture :"
  if (source === "area") return "Horaires d'ouverture :"
  if (source === "park") return "Horaires d'ouverture :"
  return "Horaire"
}

export function getEffectiveOpeningDisplay(item: any, opening: any) {
  const rule = getEffectiveOpeningRule(item, opening)
  if (!rule) return null

  const label = getOpeningScheduleLabel(rule.schedule)
  if (!label) return null

  return {
    ...rule,
    label,
    sourceLabel: getOpeningSourceLabel(rule.source),
  }
}
