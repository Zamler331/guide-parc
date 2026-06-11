const STATIC_IMAGE_CACHE = "static-image-assets"
const CROSS_ORIGIN_CACHE = "cross-origin"

export async function saveImageOffline(key: string, path: string) {
  if (typeof window === "undefined") return

  if ("caches" in window) {
    const cache = await caches.open(STATIC_IMAGE_CACHE)
    const response = await fetch(path, { cache: "reload" })

    if (response.ok || response.type === "opaque") {
      await cache.put(path, response.clone())
    }

    return
  }

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

export async function saveRemoteImagesOffline(paths: Array<string | null | undefined>) {
  if (typeof window === "undefined") return
  if (!("caches" in window)) return

  const uniquePaths = Array.from(
    new Set(paths.filter((path): path is string => Boolean(path)))
  )

  const imageCache = await caches.open(STATIC_IMAGE_CACHE)
  const crossOriginCache = await caches.open(CROSS_ORIGIN_CACHE)

  await Promise.allSettled(
    uniquePaths.map(async (path) => {
      const response = await fetch(path, { mode: "no-cors" })

      if (response.ok || response.type === "opaque") {
        await imageCache.put(path, response.clone())
        await crossOriginCache.put(path, response.clone())
      }
    })
  )
}

export async function readImageOffline(key: string, path?: string) {
  if (typeof window === "undefined") return null

  if (path && "caches" in window) {
    const imageCache = await caches.open(STATIC_IMAGE_CACHE)
    const crossOriginCache = await caches.open(CROSS_ORIGIN_CACHE)
    const cached =
      (await imageCache.match(path)) || (await crossOriginCache.match(path))

    if (cached) {
      return URL.createObjectURL(await cached.blob())
    }
  }

  return localStorage.getItem(key)
}
