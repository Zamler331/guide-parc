import InfoEditor from "@/components/infos/InfoEditor"
import { getPracticalInfos } from "@/lib/practical-infos"

export default async function AdminInfosPage() {
  const infos = await getPracticalInfos()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Infos pratiques ℹ️</h1>
        <p className="mt-1 text-gray-500">
          Créez, modifiez et organisez les informations visibles dans l’onglet Infos.
        </p>
      </div>

      <InfoEditor infos={infos} />
    </div>
  )
}