import { createBrowserClient } from "@supabase/ssr"

let supabaseAuthClient: ReturnType<typeof createBrowserClient> | null = null

export function createSupabaseAuthClient() {
  if (!supabaseAuthClient) {
    supabaseAuthClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  return supabaseAuthClient
}
