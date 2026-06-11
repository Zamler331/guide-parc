"use client"

import VisitorOpeningCalendar from "./VisitorOpeningCalendar"
import { useOfflineData } from "@/hooks/useOfflineData"

export default function OfflineOpeningCalendar({
  year,
  openingDays,
}: {
  year: number
  openingDays: any[]
}) {
  const data = useOfflineData("opening_days", openingDays)

  return <VisitorOpeningCalendar year={year} openingDays={data} />
}
