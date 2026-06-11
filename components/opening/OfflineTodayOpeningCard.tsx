"use client"

import TodayOpeningCard from "./TodayOpeningCard"
import { useOfflineData } from "@/hooks/useOfflineData"

function getTodayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export default function OfflineTodayOpeningCard({ opening }: { opening: any }) {
  const openingDays = useOfflineData<any[]>("opening_days", [])
  const cachedOpening = openingDays.find((day) => day.date === getTodayKey())

  return <TodayOpeningCard opening={opening || cachedOpening} />
}
