"use client"

import { useMemo, useState } from "react"
import type { PointerEvent, ReactNode } from "react"
import { useRouter } from "next/navigation"
import Card from "@/components/ui/Card"
import PrimaryButton from "@/components/ui/PrimaryButton"
import { saveToCache } from "@/lib/offline-cache"
import { createSupabaseAuthClient } from "@/lib/supabase-auth-client"
import {
  APPEARANCE_CACHE_KEY,
  AppearanceSettings,
  DEFAULT_APPEARANCE_SETTINGS,
  FontChoice,
  HOME_BUTTONS,
  HomeElementAppearance,
  MAP_POINT_TYPES,
  VisualProfile,
  VisualProfileStatus,
  mergeAppearanceSettings,
} from "@/lib/appearance-defaults"

type AppearanceSection = "studio" | "home" | "map"

type VisualProfileRow = {
  id: string
  name: string
  status: VisualProfileStatus
  settings?: Partial<AppearanceSettings> | null
  created_at?: string | null
  updated_at?: string | null
  published_at?: string | null
}

const FONT_OPTIONS: Array<{ value: FontChoice; label: string }> = [
  { value: "system", label: "Simple" },
  { value: "rounded", label: "Ronde" },
  { value: "serif", label: "Classique" },
  { value: "mono", label: "Technique" },
]

const HOME_ELEMENTS: Array<{
  key: keyof AppearanceSettings["home"]["layout"]
  label: string
}> = [
  { key: "heading", label: "Textes d'accueil" },
  { key: "installButton", label: "Bouton installer" },
  { key: "mascot", label: "Image principale" },
  { key: "buttons", label: "Boutons" },
  { key: "logo", label: "Logo" },
]

function rowToProfile(row: VisualProfileRow): VisualProfile {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    settings: mergeAppearanceSettings(row.settings),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  }
}

function statusLabel(status: VisualProfileStatus) {
  if (status === "published") return "Publie"
  if (status === "archived") return "Archive"
  return "Brouillon"
}

function getFontFamily(choice: FontChoice) {
  switch (choice) {
    case "rounded":
      return "var(--font-heading), ui-rounded, system-ui, sans-serif"
    case "serif":
      return "Georgia, Cambria, 'Times New Roman', serif"
    case "mono":
      return "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    default:
      return "var(--font-body), system-ui, sans-serif"
  }
}

function elementStyle(element: HomeElementAppearance) {
  return {
    transform: `translate(${element.offsetX}px, ${element.offsetY}px) scale(${element.scale})`,
    transformOrigin: "center",
  }
}

export default function AppearanceEditor({
  settings,
  profiles,
}: {
  settings: AppearanceSettings
  profiles: VisualProfile[]
}) {
  const router = useRouter()
  const initialProfiles = profiles.length
    ? profiles
    : [
        {
          id: "default",
          name: "Style par defaut",
          status: "published" as const,
          settings,
        },
      ]
  const firstProfile =
    initialProfiles.find((profile) => profile.status === "draft") ||
    initialProfiles.find((profile) => profile.status === "published") ||
    initialProfiles[0]

  const [profileList, setProfileList] = useState(initialProfiles)
  const [activeId, setActiveId] = useState(firstProfile.id)
  const [appearance, setAppearance] = useState(() =>
    mergeAppearanceSettings(firstProfile.settings)
  )
  const [section, setSection] = useState<AppearanceSection>("studio")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  const activeProfile =
    profileList.find((profile) => profile.id === activeId) || profileList[0]

  const previewGradient = useMemo(
    () =>
      `linear-gradient(135deg, ${appearance.home.backgroundFrom}, ${appearance.home.backgroundVia}, ${appearance.home.backgroundTo})`,
    [
      appearance.home.backgroundFrom,
      appearance.home.backgroundVia,
      appearance.home.backgroundTo,
    ]
  )

  function selectProfile(id: string) {
    const nextProfile = profileList.find((profile) => profile.id === id)
    if (!nextProfile) return

    setActiveId(id)
    setAppearance(mergeAppearanceSettings(nextProfile.settings))
    setMessage("")
  }

  function updateActiveProfile(profile: VisualProfile) {
    setProfileList((current) => {
      const exists = current.some((item) => item.id === profile.id)
      return exists
        ? current.map((item) => (item.id === profile.id ? profile : item))
        : [profile, ...current]
    })
    setActiveId(profile.id)
    setAppearance(profile.settings)
  }

  function updateHome<Key extends keyof AppearanceSettings["home"]>(
    key: Key,
    value: AppearanceSettings["home"][Key]
  ) {
    setAppearance((current) => ({
      ...current,
      home: {
        ...current.home,
        [key]: value,
      },
    }))
  }

  function updateTypography(field: "bodyFont" | "headingFont", value: FontChoice) {
    setAppearance((current) => ({
      ...current,
      home: {
        ...current.home,
        typography: {
          ...current.home.typography,
          [field]: value,
        },
      },
    }))
  }

  function updateHomeElement(
    key: keyof AppearanceSettings["home"]["layout"],
    value: HomeElementAppearance
  ) {
    setAppearance((current) => ({
      ...current,
      home: {
        ...current.home,
        layout: {
          ...current.home.layout,
          [key]: value,
        },
      },
    }))
  }

  function updateHomeButton(
    key: string,
    field: "label" | "backgroundColor" | "shadowColor" | "textColor",
    value: string
  ) {
    setAppearance((current) => ({
      ...current,
      home: {
        ...current.home,
        buttons: {
          ...current.home.buttons,
          [key]: {
            ...current.home.buttons[key as keyof typeof current.home.buttons],
            [field]: value,
          },
        },
      },
    }))
  }

  function updateMapColor(key: string, value: string) {
    setAppearance((current) => ({
      ...current,
      map: {
        ...current.map,
        pointColors: {
          ...current.map.pointColors,
          [key]: value,
        },
      },
    }))
  }

  function updateMapIcon(key: string, value: string) {
    setAppearance((current) => ({
      ...current,
      map: {
        ...current.map,
        pointIcons: {
          ...current.map.pointIcons,
          [key]: value,
        },
        attractionIconUrl:
          key === "attraction" ? value : current.map.attractionIconUrl,
      },
    }))
  }

  async function saveDraft() {
    setSaving(true)
    setMessage("")

    const supabase = createSupabaseAuthClient()
    const nextSettings = mergeAppearanceSettings(appearance)
    const shouldCreateDraft =
      activeProfile.id === "default" || activeProfile.status === "published"

    if (shouldCreateDraft) {
      const { data, error } = (await supabase
        .from("app_visual_profiles")
        .insert({
          name:
            activeProfile.status === "published"
              ? `Brouillon - ${activeProfile.name}`
              : "Nouveau profil",
          status: "draft",
          settings: nextSettings,
        })
        .select("id,name,status,settings,created_at,updated_at,published_at")
        .single()) as { data: VisualProfileRow | null; error: any }

      setSaving(false)

      if (error || !data) {
        setMessage("Impossible d'enregistrer le brouillon pour le moment.")
        return
      }

      updateActiveProfile(rowToProfile(data))
      setMessage("Brouillon cree. Rien n'est visible cote visiteur.")
      router.refresh()
      return
    }

    const { data, error } = (await supabase
      .from("app_visual_profiles")
      .update({
        settings: nextSettings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeProfile.id)
      .select("id,name,status,settings,created_at,updated_at,published_at")
      .single()) as { data: VisualProfileRow | null; error: any }

    setSaving(false)

    if (error || !data) {
      setMessage("Impossible d'enregistrer le brouillon pour le moment.")
      return
    }

    updateActiveProfile(rowToProfile(data))
    setMessage("Brouillon enregistre. Il n'est pas encore publie.")
    router.refresh()
  }

  async function createProfile() {
    const name = window.prompt("Nom du nouveau profil", "Profil saisonnier")
    if (!name) return

    setSaving(true)
    setMessage("")

    const supabase = createSupabaseAuthClient()
    const { data, error } = (await supabase
      .from("app_visual_profiles")
      .insert({
        name,
        status: "draft",
        settings: mergeAppearanceSettings(appearance),
      })
      .select("id,name,status,settings,created_at,updated_at,published_at")
      .single()) as { data: VisualProfileRow | null; error: any }

    setSaving(false)

    if (error || !data) {
      setMessage("Impossible de creer ce profil.")
      return
    }

    updateActiveProfile(rowToProfile(data))
    setMessage("Profil cree en brouillon.")
    router.refresh()
  }

  async function publishProfile() {
    if (activeProfile.id === "default" || activeProfile.status === "archived") {
      setMessage("Ce profil doit etre enregistre en brouillon avant publication.")
      return
    }

    setSaving(true)
    setMessage("")

    const supabase = createSupabaseAuthClient()
    await supabase
      .from("app_visual_profiles")
      .update({ status: "draft", published_at: null })
      .eq("status", "published")

    const nextSettings = mergeAppearanceSettings(appearance)
    const { data, error } = (await supabase
      .from("app_visual_profiles")
      .update({
        status: "published",
        settings: nextSettings,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeProfile.id)
      .select("id,name,status,settings,created_at,updated_at,published_at")
      .single()) as { data: VisualProfileRow | null; error: any }

    setSaving(false)

    if (error || !data) {
      setMessage("Impossible de publier ce profil pour le moment.")
      return
    }

    const publishedProfile = rowToProfile(data)
    setProfileList((current) =>
      current.map((profile) =>
        profile.id === publishedProfile.id
          ? publishedProfile
          : profile.status === "published"
            ? { ...profile, status: "draft", publishedAt: null }
            : profile
      )
    )
    setActiveId(publishedProfile.id)
    setAppearance(publishedProfile.settings)
    saveToCache(APPEARANCE_CACHE_KEY, publishedProfile.settings)
    setMessage("Profil publie. Il sera utilise par les visiteurs.")
    router.refresh()
  }

  async function archiveProfile() {
    if (activeProfile.status === "published") {
      setMessage("Publiez un autre profil avant d'archiver celui-ci.")
      return
    }
    if (activeProfile.id === "default") return

    setSaving(true)
    const supabase = createSupabaseAuthClient()
    const { data, error } = (await supabase
      .from("app_visual_profiles")
      .update({
        status: "archived",
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeProfile.id)
      .select("id,name,status,settings,created_at,updated_at,published_at")
      .single()) as { data: VisualProfileRow | null; error: any }

    setSaving(false)

    if (error || !data) {
      setMessage("Impossible d'archiver ce profil.")
      return
    }

    updateActiveProfile(rowToProfile(data))
    setMessage("Profil archive.")
    router.refresh()
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
      <div className="space-y-5">
        <ProfileBar
          profiles={profileList}
          activeProfile={activeProfile}
          onSelectProfile={selectProfile}
          onCreateProfile={createProfile}
          onSaveDraft={saveDraft}
          onPublishProfile={publishProfile}
          onArchiveProfile={archiveProfile}
          saving={saving}
        />

        <Card className="p-3">
          <div className="flex gap-2 overflow-x-auto">
            <TabButton
              active={section === "studio"}
              onClick={() => setSection("studio")}
            >
              Studio accueil
            </TabButton>
            <TabButton active={section === "home"} onClick={() => setSection("home")}>
              Style accueil
            </TabButton>
            <TabButton active={section === "map"} onClick={() => setSection("map")}>
              Carte
            </TabButton>
          </div>
        </Card>

        {section === "studio" && (
          <StudioForm
            appearance={appearance}
            updateTypography={updateTypography}
            updateHomeElement={updateHomeElement}
          />
        )}

        {section === "home" && (
          <HomeAppearanceForm
            appearance={appearance}
            updateHome={updateHome}
            updateHomeButton={updateHomeButton}
          />
        )}

        {section === "map" && (
          <MapAppearanceForm
            appearance={appearance}
            updateMapColor={updateMapColor}
            updateMapIcon={updateMapIcon}
          />
        )}
      </div>

      <aside className="space-y-4">
        <HomePreview
          appearance={appearance}
          previewGradient={previewGradient}
          updateHomeElement={updateHomeElement}
        />

        <Card className="p-4">
          <p className="text-sm font-bold text-gray-700">
            Le visiteur ne recoit que le profil publie. Les brouillons restent
            invisibles et peuvent etre prepares tranquillement.
          </p>
        </Card>

        {message && (
          <p className="rounded-2xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-600">
            {message}
          </p>
        )}
      </aside>
    </div>
  )
}

function ProfileBar({
  profiles,
  activeProfile,
  onSelectProfile,
  onCreateProfile,
  onSaveDraft,
  onPublishProfile,
  onArchiveProfile,
  saving,
}: {
  profiles: VisualProfile[]
  activeProfile: VisualProfile
  onSelectProfile: (id: string) => void
  onCreateProfile: () => void
  onSaveDraft: () => void
  onPublishProfile: () => void
  onArchiveProfile: () => void
  saving: boolean
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase text-gray-400">
            Profil visuel
          </p>
          <select
            value={activeProfile.id}
            onChange={(event) => onSelectProfile(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-900 outline-none focus:border-gray-900"
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name} - {statusLabel(profile.status)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCreateProfile}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-700"
          >
            Nouveau
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={saving}
            className="rounded-2xl bg-gray-950 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : "Sauver brouillon"}
          </button>
          <button
            type="button"
            onClick={onPublishProfile}
            disabled={saving}
            className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
          >
            Publier
          </button>
          <button
            type="button"
            onClick={onArchiveProfile}
            disabled={saving || activeProfile.status === "published"}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-gray-500 disabled:opacity-40"
          >
            Archiver
          </button>
        </div>
      </div>
    </Card>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-black ${
        active ? "bg-gray-950 text-white" : "bg-gray-100 text-gray-600"
      }`}
    >
      {children}
    </button>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-gray-400">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-gray-900"
    />
  )
}

function ColorInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value.startsWith("#") ? value : "#ffffff"}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-14 cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
      />
      <TextInput value={value} onChange={onChange} />
    </div>
  )
}

function RangeInput({
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-gray-950"
      />
      <span className="w-12 text-right text-xs font-black text-gray-500">
        {value}
      </span>
    </div>
  )
}

function StudioForm({
  appearance,
  updateTypography,
  updateHomeElement,
}: {
  appearance: AppearanceSettings
  updateTypography: (field: "bodyFont" | "headingFont", value: FontChoice) => void
  updateHomeElement: (
    key: keyof AppearanceSettings["home"]["layout"],
    value: HomeElementAppearance
  ) => void
}) {
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h2 className="text-xl font-black text-gray-950">Polices</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Police generale">
            <select
              value={appearance.home.typography.bodyFont}
              onChange={(event) =>
                updateTypography("bodyFont", event.target.value as FontChoice)
              }
              className="min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-900"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Police des titres">
            <select
              value={appearance.home.typography.headingFont}
              onChange={(event) =>
                updateTypography("headingFont", event.target.value as FontChoice)
              }
              className="min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-900"
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-xl font-black text-gray-950">Elements accueil</h2>
        <div className="mt-4 grid gap-4">
          {HOME_ELEMENTS.map((item) => {
            const element = appearance.home.layout[item.key]

            return (
              <div key={item.key} className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black text-gray-900">{item.label}</h3>
                  <label className="flex items-center gap-2 text-xs font-black uppercase text-gray-500">
                    <input
                      type="checkbox"
                      checked={element.visible}
                      onChange={(event) =>
                        updateHomeElement(item.key, {
                          ...element,
                          visible: event.target.checked,
                        })
                      }
                    />
                    Visible
                  </label>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <Field label="Deplacement horizontal">
                    <RangeInput
                      value={element.offsetX}
                      min={-80}
                      max={80}
                      onChange={(value) =>
                        updateHomeElement(item.key, {
                          ...element,
                          offsetX: value,
                        })
                      }
                    />
                  </Field>
                  <Field label="Deplacement vertical">
                    <RangeInput
                      value={element.offsetY}
                      min={-70}
                      max={70}
                      onChange={(value) =>
                        updateHomeElement(item.key, {
                          ...element,
                          offsetY: value,
                        })
                      }
                    />
                  </Field>
                  <Field label="Taille">
                    <RangeInput
                      value={element.scale}
                      min={0.75}
                      max={1.35}
                      step={0.01}
                      onChange={(value) =>
                        updateHomeElement(item.key, {
                          ...element,
                          scale: value,
                        })
                      }
                    />
                  </Field>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function HomeAppearanceForm({
  appearance,
  updateHome,
  updateHomeButton,
}: {
  appearance: AppearanceSettings
  updateHome: <Key extends keyof AppearanceSettings["home"]>(
    key: Key,
    value: AppearanceSettings["home"][Key]
  ) => void
  updateHomeButton: (
    key: string,
    field: "label" | "backgroundColor" | "shadowColor" | "textColor",
    value: string
  ) => void
}) {
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h2 className="text-xl font-black text-gray-950">Textes accueil</h2>
        <div className="mt-4 grid gap-4">
          <Field label="Petit titre">
            <TextInput
              value={appearance.home.eyebrowText}
              onChange={(value) => updateHome("eyebrowText", value)}
            />
          </Field>
          <Field label="Titre principal">
            <TextInput
              value={appearance.home.title}
              onChange={(value) => updateHome("title", value)}
            />
          </Field>
          <Field label="Sous-titre">
            <TextInput
              value={appearance.home.subtitle}
              onChange={(value) => updateHome("subtitle", value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-xl font-black text-gray-950">Fond et couleurs</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Couleur haute">
            <ColorInput
              value={appearance.home.backgroundFrom}
              onChange={(value) => updateHome("backgroundFrom", value)}
            />
          </Field>
          <Field label="Couleur milieu">
            <ColorInput
              value={appearance.home.backgroundVia}
              onChange={(value) => updateHome("backgroundVia", value)}
            />
          </Field>
          <Field label="Couleur basse">
            <ColorInput
              value={appearance.home.backgroundTo}
              onChange={(value) => updateHome("backgroundTo", value)}
            />
          </Field>
          <Field label="Petit titre">
            <ColorInput
              value={appearance.home.eyebrowColor}
              onChange={(value) => updateHome("eyebrowColor", value)}
            />
          </Field>
          <Field label="Titre">
            <ColorInput
              value={appearance.home.titleColor}
              onChange={(value) => updateHome("titleColor", value)}
            />
          </Field>
          <Field label="Sous-titre">
            <ColorInput
              value={appearance.home.subtitleColor}
              onChange={(value) => updateHome("subtitleColor", value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-xl font-black text-gray-950">Images accueil</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Image principale">
            <TextInput
              value={appearance.home.mascotImageUrl}
              onChange={(value) => updateHome("mascotImageUrl", value)}
              placeholder="/home-mascotte.png"
            />
          </Field>
          <Field label="Logo">
            <TextInput
              value={appearance.home.logoImageUrl}
              onChange={(value) => updateHome("logoImageUrl", value)}
              placeholder="/logo-recre.png"
            />
          </Field>
          <Field label="Fondu autour du logo">
            <TextInput
              value={appearance.home.logoGlowColor}
              onChange={(value) => updateHome("logoGlowColor", value)}
              placeholder="rgba(255,255,255,0.16)"
            />
          </Field>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-xl font-black text-gray-950">Boutons accueil</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {HOME_BUTTONS.map((button) => {
            const buttonStyle = appearance.home.buttons[button.key]

            return (
              <div key={button.key} className="rounded-2xl bg-gray-50 p-4">
                <h3 className="font-black text-gray-900">{button.label}</h3>
                <div className="mt-3 space-y-3">
                  <Field label="Texte du bouton">
                    <TextInput
                      value={buttonStyle.label}
                      onChange={(value) =>
                        updateHomeButton(button.key, "label", value)
                      }
                    />
                  </Field>
                  <Field label="Fond">
                    <ColorInput
                      value={buttonStyle.backgroundColor}
                      onChange={(value) =>
                        updateHomeButton(button.key, "backgroundColor", value)
                      }
                    />
                  </Field>
                  <Field label="Texte">
                    <ColorInput
                      value={buttonStyle.textColor}
                      onChange={(value) =>
                        updateHomeButton(button.key, "textColor", value)
                      }
                    />
                  </Field>
                  <Field label="Ombre">
                    <TextInput
                      value={buttonStyle.shadowColor}
                      onChange={(value) =>
                        updateHomeButton(button.key, "shadowColor", value)
                      }
                    />
                  </Field>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

function MapAppearanceForm({
  appearance,
  updateMapColor,
  updateMapIcon,
}: {
  appearance: AppearanceSettings
  updateMapColor: (key: string, value: string) => void
  updateMapIcon: (key: string, value: string) => void
}) {
  return (
    <Card className="p-5">
      <h2 className="text-xl font-black text-gray-950">Points de carte</h2>
      <p className="mt-1 text-sm font-bold text-gray-500">
        Laissez le champ icone vide pour garder le libelle court actuel.
      </p>

      <div className="mt-5 grid gap-4">
        {MAP_POINT_TYPES.map((type) => (
          <div
            key={type.value}
            className="grid gap-3 rounded-2xl bg-gray-50 p-4 md:grid-cols-[10rem_minmax(0,1fr)_12rem]"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-xs font-black text-white shadow"
                style={{
                  backgroundColor: appearance.map.pointColors[type.value],
                }}
              >
                {appearance.map.pointIcons[type.value] ? (
                  <img
                    src={appearance.map.pointIcons[type.value]}
                    alt=""
                    className="h-6 w-6 object-contain"
                  />
                ) : (
                  type.shortLabel
                )}
              </span>
              <p className="font-black text-gray-900">{type.label}</p>
            </div>

            <Field label="Icone">
              <TextInput
                value={appearance.map.pointIcons[type.value]}
                onChange={(value) => updateMapIcon(type.value, value)}
                placeholder={
                  type.value === "attraction"
                    ? "/attraction-map-icon.png"
                    : "Optionnel"
                }
              />
            </Field>

            <Field label="Couleur">
              <ColorInput
                value={appearance.map.pointColors[type.value]}
                onChange={(value) => updateMapColor(type.value, value)}
              />
            </Field>
          </div>
        ))}
      </div>
    </Card>
  )
}

function DraggablePreviewElement({
  element,
  className = "",
  onChange,
  children,
}: {
  element: HomeElementAppearance
  className?: string
  onChange: (element: HomeElementAppearance) => void
  children: ReactNode
}) {
  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement
    if (target.closest("button,input,select,textarea,a")) return

    event.preventDefault()
    const startX = event.clientX
    const startY = event.clientY
    const startElement = element

    function handlePointerMove(moveEvent: globalThis.PointerEvent) {
      onChange({
        ...startElement,
        offsetX: Math.round(startElement.offsetX + moveEvent.clientX - startX),
        offsetY: Math.round(startElement.offsetY + moveEvent.clientY - startY),
      })
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
  }

  return (
    <div
      className={`group touch-none cursor-move rounded-2xl outline outline-2 outline-transparent transition hover:outline-white/70 ${className}`}
      onPointerDown={handlePointerDown}
      style={elementStyle(element)}
      title="Glisser pour deplacer"
    >
      {children}
    </div>
  )
}

function HomePreview({
  appearance,
  previewGradient,
  updateHomeElement,
}: {
  appearance: AppearanceSettings
  previewGradient: string
  updateHomeElement: (
    key: keyof AppearanceSettings["home"]["layout"],
    value: HomeElementAppearance
  ) => void
}) {
  const home = appearance.home

  return (
    <Card className="overflow-hidden p-0">
      <div className="p-4">
        <p className="text-xs font-black uppercase text-gray-400">
          Apercu mobile
        </p>
        <h2 className="mt-1 text-xl font-black text-gray-950">Accueil</h2>
      </div>
      <div className="mx-auto mb-4 h-[34rem] w-[18rem] overflow-hidden rounded-[2rem] border-4 border-gray-950 bg-white shadow-xl">
        <div
          className="relative flex h-full flex-col items-center overflow-hidden px-3 py-3 text-center"
          style={{
            background: previewGradient,
            fontFamily: getFontFamily(home.typography.bodyFont),
          }}
        >
          {home.layout.heading.visible && (
            <DraggablePreviewElement
              element={home.layout.heading}
              className="relative z-10 px-2 py-1"
              onChange={(element) => updateHomeElement("heading", element)}
            >
              <p
                className="text-[10px] font-black uppercase"
                style={{ color: home.eyebrowColor }}
              >
                {home.eyebrowText}
              </p>
              <p
                className="mt-1 text-2xl font-black leading-none"
                style={{
                  color: home.titleColor,
                  fontFamily: getFontFamily(home.typography.headingFont),
                }}
              >
                {home.title}
              </p>
              <p
                className="mt-1 text-xs font-bold"
                style={{ color: home.subtitleColor }}
              >
                {home.subtitle}
              </p>
            </DraggablePreviewElement>
          )}

          {home.layout.installButton.visible && (
            <DraggablePreviewElement
              element={home.layout.installButton}
              className="relative z-20 mt-3 rounded-full bg-white/90 px-3 py-2 text-[10px] font-black text-gray-900"
              onChange={(element) => updateHomeElement("installButton", element)}
            >
              Installer l'application
            </DraggablePreviewElement>
          )}

          {home.layout.mascot.visible && (
            <DraggablePreviewElement
              element={home.layout.mascot}
              className="relative z-10 flex min-h-0 flex-1 items-center"
              onChange={(element) => updateHomeElement("mascot", element)}
            >
              <img
                src={home.mascotImageUrl}
                alt=""
                className="max-h-72 object-contain drop-shadow-2xl"
              />
            </DraggablePreviewElement>
          )}

          {home.layout.buttons.visible && (
            <DraggablePreviewElement
              element={home.layout.buttons}
              className="relative z-20 -mt-12 grid w-full grid-cols-2 gap-2"
              onChange={(element) => updateHomeElement("buttons", element)}
            >
              {HOME_BUTTONS.map((button) => {
                const buttonStyle = home.buttons[button.key]

                return (
                  <div
                    key={button.key}
                    className="rounded-2xl px-2 py-3 text-[11px] font-black"
                    style={{
                      backgroundColor: buttonStyle.backgroundColor,
                      color: buttonStyle.textColor,
                    }}
                  >
                    {buttonStyle.label || button.label}
                  </div>
                )
              })}
            </DraggablePreviewElement>
          )}

          {home.layout.logo.visible && (
            <DraggablePreviewElement
              element={home.layout.logo}
              className="relative z-20 mt-2"
              onChange={(element) => updateHomeElement("logo", element)}
            >
              <div
                className="absolute inset-0 rounded-full blur-lg"
                style={{ background: home.logoGlowColor }}
              />
              <img
                src={home.logoImageUrl}
                alt=""
                className="relative h-10 object-contain"
              />
            </DraggablePreviewElement>
          )}
        </div>
      </div>
    </Card>
  )
}
