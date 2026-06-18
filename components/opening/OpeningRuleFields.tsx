"use client"

type OpeningRuleFieldsProps = {
  schedules: any[]
  scheduleId: string
  note: string
  isActive: boolean
  inheritedLabel?: string
  onScheduleIdChange: (value: string) => void
  onNoteChange: (value: string) => void
  onIsActiveChange: (value: boolean) => void
}

function formatTime(time?: string | null) {
  return time ? time.slice(0, 5) : "--:--"
}

export default function OpeningRuleFields({
  schedules,
  scheduleId,
  note,
  isActive,
  inheritedLabel = "Aucun horaire specifique",
  onScheduleIdChange,
  onNoteChange,
  onIsActiveChange,
}: OpeningRuleFieldsProps) {
  const selectedSchedule = schedules.find((schedule) => schedule.id === scheduleId)

  return (
    <div className="mt-4 rounded-2xl border p-4">
      <h3 className="font-bold text-gray-900">Horaire specifique</h3>
      <p className="mt-1 text-sm text-gray-500">
        Choisis un modele specifique separe des horaires du parc.
      </p>

      <select
        className="mt-3 w-full rounded-xl border p-3"
        value={scheduleId}
        onChange={(event) => onScheduleIdChange(event.target.value)}
      >
        <option value="">{inheritedLabel}</option>
        {schedules.map((schedule) => (
          <option key={schedule.id} value={schedule.id}>
            {schedule.name}
          </option>
        ))}
      </select>

      {selectedSchedule && (
        <p className="mt-2 text-sm font-semibold text-gray-500">
          {selectedSchedule.is_open
            ? `${formatTime(selectedSchedule.opens_at)} - ${formatTime(
                selectedSchedule.closes_at
              )}`
            : "Ferme"}
        </p>
      )}

      <textarea
        className="mt-3 w-full rounded-xl border p-3"
        rows={2}
        placeholder="Note optionnelle"
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
      />

      <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-gray-600">
        <input
          type="checkbox"
          checked={isActive}
          disabled={!scheduleId}
          onChange={(event) => onIsActiveChange(event.target.checked)}
        />
        Horaire specifique actif
      </label>
    </div>
  )
}
