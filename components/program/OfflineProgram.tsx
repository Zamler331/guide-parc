"use client"

import ShowCard from "./ShowCard"
import { useOfflineData } from "@/hooks/useOfflineData"

export default function OfflineProgram({
  showTimes,
}: {
  showTimes: any[]
}) {
  const data = useOfflineData("shows", showTimes)

  return (
    <div className="space-y-3 px-4 pb-6">
      {data.length === 0 ? (
        <p className="rounded-3xl bg-white p-4 text-gray-500 shadow-sm">
          Aucun spectacle aujourd’hui.
        </p>
      ) : (
        data.map((showTime: any) => (
          <ShowCard key={showTime.id} showTime={showTime} />
        ))
      )}
    </div>
  )
}