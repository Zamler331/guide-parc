export async function saveMapImageOffline() {
  if (typeof window === "undefined") return

  const response = await fetch("/map.png", { cache: "reload" })
  const blob = await response.blob()

  const reader = new FileReader()

  reader.onloadend = () => {
    localStorage.setItem("offline_map_image", String(reader.result))
  }

  reader.readAsDataURL(blob)
}

export function readMapImageOffline() {
  if (typeof window === "undefined") return null

  return localStorage.getItem("offline_map_image")
}