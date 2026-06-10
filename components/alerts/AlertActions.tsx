"use client"

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function AlertActions({ alert }: { alert: any }) {
  const router = useRouter()

  async function toggleActive() {
    const { error } = await supabase
      .from("alerts")
      .update({ is_active: !alert.is_active })
      .eq("id", alert.id)

    if (error) {
      alert("Erreur lors de la modification")
      console.error(error)
      return
    }

    router.refresh()
  }

  async function deleteAlert() {
    const confirmDelete = confirm(`Supprimer l’alerte "${alert.title}" ?`)
    if (!confirmDelete) return

    const { error } = await supabase
      .from("alerts")
      .delete()
      .eq("id", alert.id)

    if (error) {
      alert("Erreur lors de la suppression")
      console.error(error)
      return
    }

    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={toggleActive}
        className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700"
      >
        {alert.is_active ? "Désactiver" : "Activer"}
      </button>

      <button
        type="button"
        onClick={deleteAlert}
        className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
      >
        Supprimer
      </button>
    </div>
  )
}