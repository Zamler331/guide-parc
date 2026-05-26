import { supabase } from "@/lib/supabase"

export default async function TestSupabasePage() {
  const { data, error } = await supabase
    .from("park_settings")
    .select("*")

  return (
    <main style={{ padding: 24 }}>
      <h1>Test Supabase</h1>

      {error && (
        <pre style={{ color: "red" }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      {!error && (
        <pre>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  )
}