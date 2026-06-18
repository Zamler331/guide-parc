"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseAuthClient } from "@/lib/supabase-auth-client"

type TargetType = "attraction" | "park_area" | "map_point" | "restaurant" | "shop"

type TargetOption = {
  id: string
  type: TargetType
  label: string
  detail: string
}

const WEEKDAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mer" },
  { value: 4, label: "Jeu" },
  { value: 5, label: "Ven" },
  { value: 6, label: "Sam" },
  { value: 0, label: "Dim" },
]

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
    case "park_area":
      return "Zone"
    case "map_point":
      return "Point de carte"
    case "restaurant":
      return "Restaurant"
    case "shop":
      return "Boutique"
    default:
      return "Cible"
  }
}

function getRulePeriodLabel(rule: any) {
  if (!rule.starts_on && !rule.ends_on) return "Toute l'annee"
  if (rule.starts_on && rule.ends_on) return `${rule.starts_on} -> ${rule.ends_on}`
  if (rule.starts_on) return `A partir du ${rule.starts_on}`
  return `Jusqu'au ${rule.ends_on}`
}

export default function SpecificOpeningHoursEditor({
  schedules,
  rules,
  attractions,
  areas,
  mapPoints,
  restaurants,
  shops,
}: {
  schedules: any[]
  rules: any[]
  attractions: any[]
  areas: any[]
  mapPoints: any[]
  restaurants: any[]
  shops: any[]
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

    const areaTargets = areas.map((area) => ({
      id: area.id,
      type: "park_area" as TargetType,
      label: area.name,
      detail: "Zone",
    }))

    const mapPointTargets = mapPoints.map((point) => ({
      id: point.id,
      type: "map_point" as TargetType,
      label: point.name || "Point sans nom",
      detail: getTargetTypeLabel(point.type === "shop" ? "shop" : point.type === "restaurant" ? "restaurant" : "map_point"),
    }))

    const restaurantTargets = restaurants.map((restaurant) => ({
      id: restaurant.id,
      type: "restaurant" as TargetType,
      label: restaurant.name,
      detail: restaurant.park_areas?.name || "Restaurant",
    }))

    const shopTargets = shops.map((shop) => ({
      id: shop.id,
      type: "shop" as TargetType,
      label: shop.name,
      detail: shop.park_areas?.name || "Boutique",
    }))

    return [
      ...attractionTargets,
      ...areaTargets,
      ...mapPointTargets,
      ...restaurantTargets,
      ...shopTargets,
    ].sort((a, b) => a.label.localeCompare(b.label))
  }, [areas, attractions, mapPoints, restaurants, shops])

  const targetsByKey = useMemo(() => {
    const map = new Map<string, TargetOption>()
    targets.forEach((target) => map.set(targetKey(target.type, target.id), target))
    return map
  }, [targets])

  const [selectedScheduleId, setSelectedScheduleId] = useState(schedules[0]?.id || "")
  const [selectedTargets, setSelectedTargets] = useState<string[]>([])
  const [targetFilter, setTargetFilter] = useState<TargetType | "all">("all")
  const [startsOn, setStartsOn] = useState("")
  const [endsOn, setEndsOn] = useState("")
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0])
  const [ruleNote, setRuleNote] = useState("")
  const [scheduleId, setScheduleId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [color, setColor] = useState("#14b8a6")
  const [isOpen, setIsOpen] = useState(true)
  const [opensAt, setOpensAt] = useState("10:00")
  const [closesAt, setClosesAt] = useState("18:00")
  const [description, setDescription] = useState("")
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  const filteredTargets =
    targetFilter === "all"
      ? targets
      : targets.filter((target) => target.type === targetFilter)

  function resetScheduleForm() {
    setScheduleId(null)
    setName("")
    setColor("#14b8a6")
    setIsOpen(true)
    setOpensAt("10:00")
    setClosesAt("18:00")
    setDescription("")
    setSortOrder(0)
    setIsActive(true)
  }

  function selectSchedule(schedule: any) {
    setScheduleId(schedule.id)
    setName(schedule.name || "")
    setColor(schedule.color || "#14b8a6")
    setIsOpen(Boolean(schedule.is_open))
    setOpensAt(schedule.opens_at ? schedule.opens_at.slice(0, 5) : "10:00")
    setClosesAt(schedule.closes_at ? schedule.closes_at.slice(0, 5) : "18:00")
    setDescription(schedule.description || "")
    setSortOrder(schedule.sort_order || 0)
    setIsActive(Boolean(schedule.is_active))
  }

  function toggleTarget(value: string) {
    setSelectedTargets((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    )
  }

  function toggleWeekday(value: number) {
    setWeekdays((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    )
  }

  async function handleScheduleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!name.trim()) {
      alert("Le nom du modele est obligatoire.")
      return
    }

    const payload = {
      name: name.trim(),
      color,
      is_open: isOpen,
      opens_at: isOpen ? opensAt : null,
      closes_at: isOpen ? closesAt : null,
      description: description || null,
      sort_order: sortOrder,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    }

    setLoading(true)

    const { error } = scheduleId
      ? await supabase
          .from("entity_opening_schedules")
          .update(payload)
          .eq("id", scheduleId)
      : await supabase.from("entity_opening_schedules").insert(payload)

    setLoading(false)

    if (error) {
      alert("Erreur lors de l'enregistrement du modele specifique.")
      console.error(error)
      return
    }

    resetScheduleForm()
    router.refresh()
  }

  async function handleApplyRules(event: React.FormEvent) {
    event.preventDefault()

    if (!selectedScheduleId || selectedTargets.length === 0) {
      alert("Choisis un modele et au moins une cible.")
      return
    }

    if (weekdays.length === 0) {
      alert("Choisis au moins un jour de semaine.")
      return
    }

    const payload = selectedTargets.map((value) => {
      const target = parseTargetKey(value)

      return {
        target_type: target.type,
        target_id: target.id,
        schedule_id: selectedScheduleId,
        starts_on: startsOn || null,
        ends_on: endsOn || null,
        weekdays,
        note: ruleNote || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      }
    })

    setLoading(true)
    const { error } = await supabase.from("entity_opening_rules").insert(payload)
    setLoading(false)

    if (error) {
      alert("Erreur lors de l'application des horaires specifiques.")
      console.error(error)
      return
    }

    setSelectedTargets([])
    setRuleNote("")
    router.refresh()
  }

  async function handleDeleteRule(rule: any) {
    const confirmed = confirm("Supprimer cette application d'horaire specifique ?")
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
    <div className="space-y-6">
      <div className="rounded-3xl border border-teal-100 bg-teal-50 p-5">
        <p className="text-xs font-black uppercase text-teal-700">
          Systeme separe
        </p>
        <h2 className="mt-1 text-xl font-black text-teal-950">
          Horaires specifiques des entites
        </h2>
        <p className="mt-2 text-sm font-semibold text-teal-800">
          Ces modeles ne modifient pas les horaires du parc. Ils servent
          uniquement aux attractions, zones, boutiques, restaurants et points de
          carte.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={handleScheduleSubmit} className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                {scheduleId ? "Modifier le modele" : "Nouveau modele specifique"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Palette teal pour le distinguer des horaires du parc.
              </p>
            </div>

            {scheduleId && (
              <button
                type="button"
                onClick={resetScheduleForm}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600"
              >
                Nouveau
              </button>
            )}
          </div>

          <input
            className="w-full rounded-xl border p-3"
            placeholder="Nom du modele"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label className="mt-3 block text-sm font-semibold text-gray-600">
            Couleur
            <input
              type="color"
              className="mt-1 h-12 w-full rounded-xl border p-2"
              value={color}
              onChange={(event) => setColor(event.target.value)}
            />
          </label>

          <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-600">
            <input
              type="checkbox"
              checked={isOpen}
              onChange={(event) => setIsOpen(event.target.checked)}
            />
            Entite ouverte sur ce modele
          </label>

          {isOpen && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input
                type="time"
                className="rounded-xl border p-3"
                value={opensAt}
                onChange={(event) => setOpensAt(event.target.value)}
              />
              <input
                type="time"
                className="rounded-xl border p-3"
                value={closesAt}
                onChange={(event) => setClosesAt(event.target.value)}
              />
            </div>
          )}

          <textarea
            className="mt-3 w-full rounded-xl border p-3"
            rows={3}
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <input
            type="number"
            className="mt-3 w-full rounded-xl border p-3"
            placeholder="Ordre"
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value))}
          />

          <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-600">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            Modele actif
          </label>

          <button
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-teal-700 p-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Enregistrer le modele"}
          </button>
        </form>

        <div className="grid gap-3 md:grid-cols-2">
          {schedules.length === 0 ? (
            <div className="rounded-3xl bg-white p-5 text-sm text-gray-500 shadow-sm">
              Aucun modele specifique.
            </div>
          ) : (
            schedules.map((schedule) => (
              <button
                key={schedule.id}
                type="button"
                onClick={() => {
                  selectSchedule(schedule)
                  setSelectedScheduleId(schedule.id)
                }}
                className="rounded-3xl bg-white p-5 text-left shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 h-4 w-4 rounded-full"
                    style={{ backgroundColor: schedule.color || "#14b8a6" }}
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{schedule.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-gray-500">
                      {schedule.is_open
                        ? `${formatTime(schedule.opens_at)} - ${formatTime(
                            schedule.closes_at
                          )}`
                        : "Ferme"}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
                      Modele specifique
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <form onSubmit={handleApplyRules} className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Appliquer en masse</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            className="rounded-xl border p-3"
            value={selectedScheduleId}
            onChange={(event) => setSelectedScheduleId(event.target.value)}
          >
            {schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.name}
              </option>
            ))}
          </select>

          <select
            className="rounded-xl border p-3"
            value={targetFilter}
            onChange={(event) => setTargetFilter(event.target.value as any)}
          >
            <option value="all">Toutes les cibles</option>
            <option value="attraction">Attractions</option>
            <option value="park_area">Zones</option>
            <option value="map_point">Points de carte</option>
            <option value="restaurant">Restaurants</option>
            <option value="shop">Boutiques</option>
          </select>

          <input
            type="date"
            className="rounded-xl border p-3"
            value={startsOn}
            onChange={(event) => setStartsOn(event.target.value)}
          />

          <input
            type="date"
            className="rounded-xl border p-3"
            value={endsOn}
            onChange={(event) => setEndsOn(event.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {WEEKDAYS.map((weekday) => (
            <button
              key={weekday.value}
              type="button"
              onClick={() => toggleWeekday(weekday.value)}
              className={`rounded-full px-3 py-2 text-xs font-black ${
                weekdays.includes(weekday.value)
                  ? "bg-teal-700 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {weekday.label}
            </button>
          ))}
        </div>

        <textarea
          className="mt-4 w-full rounded-xl border p-3"
          rows={2}
          placeholder="Note optionnelle"
          value={ruleNote}
          onChange={(event) => setRuleNote(event.target.value)}
        />

        <div className="mt-4 grid max-h-80 gap-2 overflow-auto rounded-2xl border p-3 md:grid-cols-2">
          {filteredTargets.map((target) => {
            const key = targetKey(target.type, target.id)
            const selected = selectedTargets.includes(key)

            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleTarget(key)}
                className={`rounded-2xl border p-3 text-left transition ${
                  selected
                    ? "border-teal-600 bg-teal-50"
                    : "border-gray-100 bg-white"
                }`}
              >
                <p className="text-xs font-black uppercase text-gray-400">
                  {getTargetTypeLabel(target.type)}
                </p>
                <p className="mt-1 font-bold text-gray-900">{target.label}</p>
                <p className="text-sm text-gray-500">{target.detail}</p>
              </button>
            )
          })}
        </div>

        <button
          disabled={loading || selectedTargets.length === 0 || schedules.length === 0}
          className="mt-4 w-full rounded-xl bg-teal-700 p-3 font-semibold text-white disabled:opacity-50"
        >
          {loading
            ? "Application..."
            : `Appliquer a ${selectedTargets.length} cible(s)`}
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-xl font-black">Applications existantes</h2>
        {rules.length === 0 ? (
          <div className="rounded-3xl bg-white p-5 text-sm text-gray-500 shadow-sm">
            Aucun horaire specifique applique.
          </div>
        ) : (
          rules.map((rule) => {
            const target = targetsByKey.get(targetKey(rule.target_type, rule.target_id))
            const days = (rule.weekdays || [])
              .map((value: number) => WEEKDAYS.find((day) => day.value === value)?.label)
              .filter(Boolean)
              .join(", ")

            return (
              <div key={rule.id} className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase text-gray-400">
                      {getTargetTypeLabel(rule.target_type)}
                    </p>
                    <h3 className="mt-1 font-bold text-gray-900">
                      {target?.label || "Cible introuvable"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {getRulePeriodLabel(rule)} - {days}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteRule(rule)}
                    className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700"
                  >
                    Supprimer
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-xs font-black"
                    style={{
                      backgroundColor: rule.schedule?.color || "#ccfbf1",
                      color: "#0f172a",
                    }}
                  >
                    {rule.schedule?.name || "Modele supprime"}
                  </span>
                  <span className="text-sm font-semibold text-gray-500">
                    {rule.schedule?.is_open
                      ? `${formatTime(rule.schedule?.opens_at)} - ${formatTime(
                          rule.schedule?.closes_at
                        )}`
                      : "Ferme"}
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
