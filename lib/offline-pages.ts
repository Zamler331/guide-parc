const CACHE_NAME = "park-pages-cache"

export async function saveOfflinePage(path: string) {
  if (typeof window === "undefined") return
  if (!("caches" in window)) return

  const cache = await caches.open(CACHE_NAME)
  const response = await fetch(path, { cache: "reload" })

  if (response.ok) {
    await cache.put(path, response.clone())
  }
}