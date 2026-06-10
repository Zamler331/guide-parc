"use client"

import AttractionList from "./AttractionList"
import { useOfflineData } from "@/hooks/useOfflineData"

export default function OfflineAttractions({
  attractions,
  opening,
}: {
  attractions: any[]
  opening: any
}) {
  const data = useOfflineData(
    "attractions",
    attractions
  )

  return (
    <AttractionList
      attractions={data}
      opening={opening}
    />
  )
}