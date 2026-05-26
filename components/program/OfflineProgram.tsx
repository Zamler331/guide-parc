"use client"

import ShowCard from "./ShowCard"
import { useOfflineData } from "@/hooks/useOfflineData"

export default function OfflineProgram({ shows }: { shows: any[] }) {
  const data = useOfflineData("shows", shows)

  return (
    <div className="space-y-3 px-4 pb-6">
      {data.length === 0 ? (
        <p className="text-gray-500">Aucun spectacle aujourd’hui.</p>
      ) : (
        data.map((show: any) => <ShowCard key={show.id} show={show} />)
      )}
    </div>
  )
}