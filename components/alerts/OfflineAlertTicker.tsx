"use client"

import AlertTicker from "./AlertTicker"
import { useOfflineData } from "@/hooks/useOfflineData"

export default function OfflineAlertTicker({ alerts }: { alerts: any[] }) {
  const data = useOfflineData("alerts", alerts)

  return <AlertTicker alerts={data} />
}
