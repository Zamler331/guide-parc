"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseAuthClient } from "@/lib/supabase-auth-client"

type TargetType = "attraction" | "map_point" | "park_area"

type TargetOption = {
  id: string
  type: TargetType
  label: string
  detail: string
}

function formatTime(time?: string | null) {
  return time ? time.slice(0, 5) : "--:--"
}

function targetKey(type: TargetType, id: string) {
  return `${type}:${id}`
}

function parseTargetKey(value: string) {
  const [type, id] = value.split(":")
  return { type: type as TargetType, id }
}

function getTargetTypeLabel(type: TargetType) {
  switch (type) {
    case "attraction":
      return "Attraction"
    case "map_point":
      return "Boutique / restaurant"
    case "park_area":
      return "Zone"
    default:
      return "Cible"
  }
}

export default function EntityOpeningRulesEditor({
  schedules,
  rules,
  attractions,
  mapPoints,
  areas,
}: {
  schedules: any[]
  rules: any[]
  attractions: any[]
  mapPoints: any[]
  areas: any[]
}) {
  const router = useRouter()
  const supabase = createSupabaseAuthClient()
  const targets = useMemo<TargetOption[]>(() => {
    const attractionTargets = attractions.map((attraction) => ({
      id: attraction.id,
      type: "attraction" as TargetType,
      label: attraction.name,
      detail: attraction.park_areas?.name || "Attraction",
    }))

    const mapPointTargets = mapPoints
      .filter((point) => point.type === "shop" || point.type === "restaurant")
      .map((point) => ({
        id: point.id,
        type: "map_point" as TargetType,
        label: point.name,
        detail:
          point.type === "restaurant"
            ? "Restaurant"
            : point.type === "shop"
              ? "Boutique"
              : "Point de carte",
      }))

    const areaTargets = areas.map((area) => ({
      id: area.id,
      type: "park_area" as TargetType,
      label: area.name,
      detail: "Zone",
    }))

    return [...attractionTargets, ...mapPointTargets, ...areaTargets].sort(
      (a, b) => a.label.localeCompare(b.label)
    )
  }, [areas, attractions, mapPoints])

  const targetsByKey = useMemo(() => {
    const map = new Map<string, TargetOption>()
    targets.forEach((target) => map.set(targetKey(target.type, target.id), target))
    return map
  }, [targets])

  const [selectedTarget, setSelectedTarget] = useState(
    targets[0] ? targetKey(targets[0].type, targets[0].id) : ""
  )
  const [scheduleId, setScheduleId] = useState(schedules[0]?.id || "")
  const [note, setNote] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  function selectRule(rule: any) {
    setSelectedTarget(targetKey(rule.target_type, rule.target_id))
    setScheduleId(rule.schedule_id || "")
    setNote(rule.note || "")
    setIsActive(Boolean(rule.is_active))
  }

  function handleTargetChange(value: string) {
    setSelectedTarget(value)

    const { type, id } = parseTargetKey(value)
    const existingRule = rules.find(
      (rule) => rule.target_type === type && rule.target_id === id
    )

    if (existingRule) {
      setScheduleId(existingRule.schedule_id || "")
      setNote(existingRule.note || "")
      setIsActive(Boolean(existingRule.is_active))
      return
    }

    setScheduleId(schedules[0]?.id || "")
    setNote("")
    setIsActive(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedTarget || !scheduleId) {
      alert("Choisis une cible et un modele d'horaire.")
      return
    }

    const { type, id } = parseTargetKey(selectedTarget)
    const payload = {
      target_type: type,
      target_id: id,
      schedule_id: scheduleId,
      note: note || null,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    }

    setLoading(true)

    const { error } = await supabase
      .from("entity_opening_rules")
      .upsert(payload, { onConflict: "target_type,target_id" })

    setLoading(false)

    if (error) {
      alert("Erreur lors de l'enregistrement de l'horaire specifique.")
      console.error(error)
      return
    }

    router.refresh()
  }

  async function handleDelete(rule: any) {
    const target = targetsByKey.get(targetKey(rule.target_type, rule.target_id))
    const confirmed = confirm(
      `Supprimer l'horaire specifique de "${target?.label || "cette cible"}" ?`
    )

    if (!confirmed) return

    const { error } = await supabase
      .from("entity_opening_rules")
      .delete()
      .eq("id", rule.id)

    if (error) {
      alert("Erreur lors de la suppression.")
      console.error(error)
      return
    }

    router.refresh()
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold">Horaire specifique</h2>
          <p className="mt-1 text-sm text-gray-500">
            Applique un modele a une attraction, une boutique, un restaurant ou
            une zone.
          </p>
        </div>

        <label className="block text-sm font-semibold text-gray-600">
          Cible
          <select
            className="mt-1 w-full rounded-xl border p-3"
            value={selectedTarget}
            onChange={(e) => handleTargetChange(e.target.value)}
          >
            {targets.map((target) => (
              <option
                key={targetKey(target.type, target.id)}
                value={targetKey(target.type, target.id)}
              >
                {getTargetTypeLabel(target.type)} - {target.label}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 block text-sm font-semibold text-gray-600">
          Modele d'horaire
          <select
            className="mt-1 w-full rounded-xl border p-3"
            value={scheduleId}
            onChange={(e) => setScheduleId(e.target.value)}
          >
            {schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.name}
              </option>
            ))}
          </select>
        </label>

        <textarea
          className="mt-3 w-full rounded-xl border p-3"
          rows={3}
          placeholder="Note interne ou indication visiteur"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-600">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Horaire specifique actif
        </label>

        <button
          disabled={loading || targets.length === 0 || schedules.length === 0}
          className="mt-4 w-full rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer l'horaire specifique"}
        </button>
      </form>

      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="rounded-3xl bg-white p-5 text-sm text-gray-500 shadow-sm">
            Aucun horaire specifique pour le moment.
          </div>
        ) : (
          rules.map((rule) => {
            const target = targetsByKey.get(
              targetKey(rule.target_type, rule.target_id)
            )

            return (
              <div
                key={rule.id}
                className="rounded-3xl bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => selectRule(rule)}
                    className="min-w-0 text-left"
                  >
                    <p className="text-xs font-black uppercase text-gray-400">
                      {getTargetTypeLabel(rule.target_type)}
                    </p>
                    <h3 className="mt-1 font-bold text-gray-900">
                      {target?.label || "Cible introuvable"}
                    </h3>
                    {target?.detail && (
                      <p className="mt-1 text-sm text-gray-500">
                        {target.detail}
                      </p>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(rule)}
                    className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
                  >
                    Supprimer
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-black"
                    style={{
                      backgroundColor: rule.schedule?.color || "#f3f4f6",
                      color: "#111827",
                    }}
                  >
                    {rule.schedule?.name || "Modele supprime"}
                  </span>
                  <span className="text-gray-500">
                    {rule.schedule?.is_open
                      ? `${formatTime(rule.schedule?.opens_at)} - ${formatTime(
                          rule.schedule?.closes_at
                        )}`
                      : "Ferme"}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      rule.is_active
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {rule.is_active ? "Actif" : "Inactif"}
                  </span>
                </div>

                {rule.note && (
                  <p className="mt-3 text-sm text-gray-500">{rule.note}</p>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
