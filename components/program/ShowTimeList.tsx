"use client"

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR")
}

function formatTime(time?: string | null) {
  if (!time) return ""
  return time.slice(0, 5).replace(":", "h")
}

export default function ShowTimeList({ showTimes }: { showTimes: any[] }) {
  const router = useRouter()

  async function deleteShowTime(id: string) {
    const confirmDelete = confirm("Supprimer cette représentation ?")
    if (!confirmDelete) return

    const { error } = await supabase
      .from("show_times")
      .delete()
      .eq("id", id)

    if (error) {
      alert("Erreur lors de la suppression")
      console.error(error)
      return
    }

    router.refresh()
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">Représentations existantes</h2>

      <div className="mt-4 space-y-3">
        {showTimes.length === 0 ? (
          <p className="text-gray-500">Aucune représentation configurée.</p>
        ) : (
          showTimes.map((time) => (
            <div
              key={time.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3"
            >
              <div>
                <p className="font-bold">{time.show?.title}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(time.show_date)} · {formatTime(time.start_time)}
                  {time.end_time ? ` → ${formatTime(time.end_time)}` : ""}
                </p>

                {time.note && (
                  <p className="mt-1 text-sm text-gray-500">{time.note}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => deleteShowTime(time.id)}
                className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
              >
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}