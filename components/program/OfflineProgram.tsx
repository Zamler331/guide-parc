"use client"

import ShowCard from "./ShowCard"
import { useOfflineData } from "@/hooks/useOfflineData"
import { getLocalDateKey } from "@/lib/date"

export default function OfflineProgram({ showTimes }: { showTimes: any[] }) {
  const data = useOfflineData("shows", showTimes)
  const today = getLocalDateKey()

  const todayShowTimes = data
    .filter((showTime: any) => showTime.show_date === today)
    .sort((a: any, b: any) =>
      String(a.start_time).localeCompare(String(b.start_time))
    )

  return (
    <div className="space-y-3 px-4 pb-6">
      {todayShowTimes.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-500 shadow-sm">
          Aucun spectacle aujourd'hui.
        </p>
      ) : (
        todayShowTimes.map((showTime: any) => (
          <ShowCard key={showTime.id} showTime={showTime} />
        ))
      )}
    </div>
  )
}
