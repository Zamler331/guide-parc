"use client"

import AttractionList from "./AttractionList"
import { useOfflineData } from "@/hooks/useOfflineData"

export default function OfflineAttractions({
  attractions,
}: {
  attractions: any[]
}) {
  const data = useOfflineData(
    "attractions",
    attractions
  )

  return <AttractionList attractions={data} />
}