export function saveToCache(key: string, data: any) {
  if (typeof window === "undefined") return

  localStorage.setItem(
    key,
    JSON.stringify({
      data,
      savedAt: new Date().toISOString(),
    })
  )
}

export function readFromCache(key: string) {
  if (typeof window === "undefined") return null

  const raw = localStorage.getItem(key)

  if (!raw) return null

  try {
    return JSON.parse(raw).data
  } catch {
    return null
  }
}