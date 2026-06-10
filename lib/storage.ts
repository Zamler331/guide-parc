import { createSupabaseAuthClient } from "./supabase-auth-client"

export async function uploadImage(file: File) {
  const supabase = createSupabaseAuthClient()

  const ext = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${ext}`

  const { error } = await supabase.storage
    .from("park-images")
    .upload(fileName, file)

  if (error) {
    throw error
  }

  const { data } = supabase.storage
    .from("park-images")
    .getPublicUrl(fileName)

  return data.publicUrl
}