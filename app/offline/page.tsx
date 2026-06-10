import Link from "next/link"

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6 text-center">
      <h1 className="text-3xl font-black">Guide hors ligne</h1>

      <p className="mt-3 text-gray-600">
        Vous êtes hors connexion, mais le guide reste disponible après un premier lancement en ligne.
      </p>

      <div className="mt-6 grid w-full max-w-sm gap-3">
        <Link href="/" className="rounded-2xl bg-gray-900 p-4 font-bold text-white">
          Accueil
        </Link>

        <Link href="/attractions" className="rounded-2xl bg-white p-4 font-bold shadow-sm">
          Attractions
        </Link>

        <Link href="/carte" className="rounded-2xl bg-white p-4 font-bold shadow-sm">
          Carte
        </Link>

        <Link href="/programme" className="rounded-2xl bg-white p-4 font-bold shadow-sm">
          Programme
        </Link>
      </div>
    </main>
  )
}