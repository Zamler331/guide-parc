"use client"

import InfoCard from "./InfoCard"
import { useOfflineData } from "@/hooks/useOfflineData"

export default function OfflineInfos({ infos }: { infos: any[] }) {
  const data = useOfflineData("practical_infos", infos)

  return (
    <div className="-mt-3 space-y-3 px-4 pb-6">
      {data.length === 0 ? (
        <p className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-500 shadow-sm">
          Aucune information pratique pour le moment.
        </p>
      ) : (
        data.map((info: any) => <InfoCard key={info.id} info={info} />)
      )}
    </div>
  )
}
