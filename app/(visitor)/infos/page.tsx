import OfflineInfos from "@/components/infos/OfflineInfos"
import PageHeader from "@/components/ui/PageHeader"
import { getPracticalInfos } from "@/lib/practical-infos"

export default async function InfosPage() {
  const infos = await getPracticalInfos()

  return (
    <main className="min-h-screen bg-slate-100">
      <PageHeader
        title="Infos pratiques"
        subtitle="Tout ce qu'il faut savoir pour profiter de la visite."
        eyebrow="Services"
        tone="green"
      />
      <OfflineInfos infos={infos} />
    </main>
  )
}
