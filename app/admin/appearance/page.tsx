import AppearanceEditor from "@/components/appearance/AppearanceEditor"
import PageHeader from "@/components/ui/PageHeader"
import { getAppearanceSettings } from "@/lib/appearance"
import {
  getDefaultVisualProfile,
  getVisualProfiles,
} from "@/lib/visual-profiles"

export default async function AdminAppearancePage() {
  const settings = await getAppearanceSettings()
  const profiles = await getVisualProfiles()
  const visualProfiles =
    profiles.length > 0 ? profiles : [getDefaultVisualProfile(settings)]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apparence"
        subtitle="Preparer des profils visuels, travailler en brouillon, puis publier quand tout est pret."
        tone="blue"
      />

      <AppearanceEditor settings={settings} profiles={visualProfiles} />
    </div>
  )
}
