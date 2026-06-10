"use client"

import { useState } from "react"
import { createSupabaseAuthClient } from "@/lib/supabase-auth-client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    const supabase = createSupabaseAuthClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert("Erreur de connexion")
      return
    }

    router.push("/admin")
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-3 rounded-xl border p-6">
        <h1 className="text-xl font-bold">Connexion admin</h1>

        <input
          className="w-full rounded-lg border p-2"
          placeholder="Identifiant"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full rounded-lg border p-2"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full rounded-xl bg-black p-3 text-white font-semibold">
          Se connecter
        </button>
      </form>
    </main>
  )
}