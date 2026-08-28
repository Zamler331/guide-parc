"use client"

import { useState } from "react"
import Card from "@/components/ui/Card"
import PrimaryButton from "@/components/ui/PrimaryButton"
import { createSupabaseAuthClient } from "@/lib/supabase-auth-client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")

    const supabase = createSupabaseAuthClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoading(false)
      setErrorMessage("Identifiants incorrects ou connexion impossible.")
      return
    }

    window.location.assign("/admin")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-sm p-6">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase text-blue-600">
              Administration
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">
              Connexion
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Acces reserve a l'equipe du parc.
            </p>
          </div>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">Email</span>
            <input
              type="email"
              autoComplete="email"
              className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="admin@exemple.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Mot de passe
            </span>
            <input
              type="password"
              autoComplete="current-password"
              className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {errorMessage && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </p>
          )}

          <PrimaryButton className="w-full" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </PrimaryButton>
        </form>
      </Card>
    </main>
  )
}
