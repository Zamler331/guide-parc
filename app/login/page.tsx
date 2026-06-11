"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Card from "@/components/ui/Card"
import PrimaryButton from "@/components/ui/PrimaryButton"
import { createSupabaseAuthClient } from "@/lib/supabase-auth-client"

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
              className="mt-2 min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <PrimaryButton className="w-full">Se connecter</PrimaryButton>
        </form>
      </Card>
    </main>
  )
}
