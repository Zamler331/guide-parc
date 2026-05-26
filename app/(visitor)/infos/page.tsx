import { getPracticalInfos } from "@/lib/practical-infos"
import OfflineInfos from "@/components/infos/OfflineInfos"

export default async function InfosPage() {
  const infos = await getPracticalInfos()

  return (
    <main>
      <h1 className="p-4 text-xl font-bold">Infos pratiques ℹ️</h1>
      <OfflineInfos infos={infos} />
    </main>
  )
}