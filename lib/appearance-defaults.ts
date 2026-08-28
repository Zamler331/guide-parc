export const APPEARANCE_CACHE_KEY = "appearance_settings"

export const MAP_POINT_TYPES = [
  { value: "attraction", label: "Attractions", shortLabel: "Attr." },
  { value: "restaurant", label: "Restauration", shortLabel: "Food" },
  { value: "shop", label: "Boutiques", shortLabel: "Shop" },
  { value: "toilet", label: "Toilettes", shortLabel: "WC" },
  { value: "first_aid", label: "Secours", shortLabel: "SOS" },
  { value: "parking", label: "Parking", shortLabel: "P" },
  { value: "show", label: "Spectacles", shortLabel: "Show" },
] as const

export const HOME_BUTTONS = [
  { key: "attractions", label: "Attractions", href: "/attractions" },
  { key: "map", label: "Plan du parc", href: "/carte" },
  { key: "programme", label: "Programme", href: "/programme" },
  { key: "horaires", label: "Horaires", href: "/horaires" },
] as const

export type MapPointType = (typeof MAP_POINT_TYPES)[number]["value"]
export type HomeButtonKey = (typeof HOME_BUTTONS)[number]["key"]

export type HomeButtonAppearance = {
  label: string
  backgroundColor: string
  shadowColor: string
  textColor: string
}

export type FontChoice = "system" | "rounded" | "serif" | "mono"

export type HomeElementAppearance = {
  visible: boolean
  offsetX: number
  offsetY: number
  scale: number
}

export type VisualProfileStatus = "draft" | "published" | "archived"

export type VisualProfile = {
  id: string
  name: string
  status: VisualProfileStatus
  settings: AppearanceSettings
  createdAt?: string | null
  updatedAt?: string | null
  publishedAt?: string | null
}

export type AppearanceSettings = {
  home: {
    eyebrowText: string
    title: string
    subtitle: string
    backgroundFrom: string
    backgroundVia: string
    backgroundTo: string
    eyebrowColor: string
    titleColor: string
    subtitleColor: string
    mascotImageUrl: string
    logoImageUrl: string
    logoGlowColor: string
    typography: {
      bodyFont: FontChoice
      headingFont: FontChoice
    }
    layout: {
      heading: HomeElementAppearance
      installButton: HomeElementAppearance
      mascot: HomeElementAppearance
      buttons: HomeElementAppearance
      logo: HomeElementAppearance
    }
    buttons: Record<HomeButtonKey, HomeButtonAppearance>
  }
  map: {
    attractionIconUrl: string
    pointIcons: Record<MapPointType, string>
    pointColors: Record<MapPointType, string>
  }
}

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  home: {
    eyebrowText: "Guide du parc",
    title: "Bienvenue à la Récré !",
    subtitle: "Préparez votre journée en famille.",
    backgroundFrom: "#38bdf8",
    backgroundVia: "#2563eb",
    backgroundTo: "#312e81",
    eyebrowColor: "#fef08a",
    titleColor: "#ffffff",
    subtitleColor: "#eff6ff",
    mascotImageUrl: "/home-mascotte.png",
    logoImageUrl: "/logo-recre.png",
    logoGlowColor: "rgba(255,255,255,0.16)",
    typography: {
      bodyFont: "system",
      headingFont: "rounded",
    },
    layout: {
      heading: {
        visible: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
      },
      installButton: {
        visible: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
      },
      mascot: {
        visible: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1.08,
      },
      buttons: {
        visible: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
      },
      logo: {
        visible: true,
        offsetX: 0,
        offsetY: 0,
        scale: 1,
      },
    },
    buttons: {
      attractions: {
        label: "Attractions",
        backgroundColor: "#ec4899",
        shadowColor: "rgba(131,24,67,0.3)",
        textColor: "#ffffff",
      },
      map: {
        label: "Plan du parc",
        backgroundColor: "#10b981",
        shadowColor: "rgba(6,78,59,0.3)",
        textColor: "#ffffff",
      },
      programme: {
        label: "Programme",
        backgroundColor: "#f97316",
        shadowColor: "rgba(124,45,18,0.3)",
        textColor: "#ffffff",
      },
      horaires: {
        label: "Horaires",
        backgroundColor: "#0ea5e9",
        shadowColor: "rgba(12,74,110,0.3)",
        textColor: "#ffffff",
      },
    },
  },
  map: {
    attractionIconUrl: "/attraction-map-icon.png",
    pointIcons: {
      attraction: "/attraction-map-icon.png",
      restaurant: "",
      shop: "",
      toilet: "",
      first_aid: "",
      parking: "",
      show: "",
    },
    pointColors: {
      attraction: "#ef4444",
      restaurant: "#f97316",
      shop: "#a855f7",
      toilet: "#3b82f6",
      first_aid: "#16a34a",
      parking: "#1e293b",
      show: "#ec4899",
    },
  },
}

function mergeRecord<T extends Record<string, any>>(
  defaults: T,
  custom?: Partial<T> | null
) {
  return {
    ...defaults,
    ...(custom || {}),
  }
}

export function mergeAppearanceSettings(
  settings?: Partial<AppearanceSettings> | null
): AppearanceSettings {
  const home: Partial<AppearanceSettings["home"]> = settings?.home || {}
  const map: Partial<AppearanceSettings["map"]> = settings?.map || {}

  return {
    home: {
      ...DEFAULT_APPEARANCE_SETTINGS.home,
      ...home,
      typography: {
        ...DEFAULT_APPEARANCE_SETTINGS.home.typography,
        ...home.typography,
      },
      layout: {
        heading: {
          ...DEFAULT_APPEARANCE_SETTINGS.home.layout.heading,
          ...home.layout?.heading,
        },
        installButton: {
          ...DEFAULT_APPEARANCE_SETTINGS.home.layout.installButton,
          ...home.layout?.installButton,
        },
        mascot: {
          ...DEFAULT_APPEARANCE_SETTINGS.home.layout.mascot,
          ...home.layout?.mascot,
        },
        buttons: {
          ...DEFAULT_APPEARANCE_SETTINGS.home.layout.buttons,
          ...home.layout?.buttons,
        },
        logo: {
          ...DEFAULT_APPEARANCE_SETTINGS.home.layout.logo,
          ...home.layout?.logo,
        },
      },
      buttons: {
        attractions: {
          ...DEFAULT_APPEARANCE_SETTINGS.home.buttons.attractions,
          ...home.buttons?.attractions,
        },
        map: {
          ...DEFAULT_APPEARANCE_SETTINGS.home.buttons.map,
          ...home.buttons?.map,
        },
        programme: {
          ...DEFAULT_APPEARANCE_SETTINGS.home.buttons.programme,
          ...home.buttons?.programme,
        },
        horaires: {
          ...DEFAULT_APPEARANCE_SETTINGS.home.buttons.horaires,
          ...home.buttons?.horaires,
        },
      },
    },
    map: {
      ...DEFAULT_APPEARANCE_SETTINGS.map,
      ...map,
      pointIcons: mergeRecord(
        DEFAULT_APPEARANCE_SETTINGS.map.pointIcons,
        map.pointIcons
      ),
      pointColors: mergeRecord(
        DEFAULT_APPEARANCE_SETTINGS.map.pointColors,
        map.pointColors
      ),
    },
  }
}

export function isDefaultAppearance(settings: AppearanceSettings) {
  return (
    JSON.stringify(settings) === JSON.stringify(DEFAULT_APPEARANCE_SETTINGS)
  )
}
