export async function saveImageOffline(key: string, path: string) {
  if (typeof window === "undefined") return

  const response = await fetch(path, { cache: "reload" })
  const blob = await response.blob()

  const reader = new FileReader()

  reader.onloadend = () => {
    localStorage.setItem(key, String(reader.result))
  }

  reader.readAsDataURL(blob)
}

export async function saveLocalImagesOffline() {
  await Promise.allSettled([
    saveImageOffline("offline_map_image", "/map.png"),
    saveImageOffline("offline_home_mascotte", "/home-mascotte.png"),
    saveImageOffline("offline_logo_recre", "/logo-recre.png"),
  ])
}

export function readImageOffline(key: string) {
  if (typeof window === "undefined") return null

  return localStorage.getItem(key)
}