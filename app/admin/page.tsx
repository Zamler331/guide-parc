import Link from "next/link"

const adminLinks = [
  {
    href: "/admin/attractions",
    icon: "🎢",
    title: "Attractions",
    description: "Ajouter et modifier les attractions",
  },
  {
    href: "/admin/map",
    icon: "🗺️",
    title: "Carte",
    description: "Placer les points sur le plan",
  },
  {
    href: "/admin/programme",
    icon: "🎭",
    title: "Programme",
    description: "Gérer les spectacles et animations",
  },
  {
    href: "/admin/infos",
    icon: "ℹ️",
    title: "Infos pratiques",
    description: "Horaires, accès, services et règlement",
  },
  {
    href: "/admin/alerts",
    icon: "🚨",
    title: "Alertes",
    description: "Messages exceptionnels sur l’accueil",
  },
]

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <section className="rounded-3xl bg-gray-900 p-5 text-white shadow-sm">
        <p className="text-sm text-gray-300">Interface de gestion</p>
        <h1 className="mt-1 text-2xl font-black">Admin du parc ⚙️</h1>
        <p className="mt-2 text-sm text-gray-300">
          Gérez les contenus visibles dans l’application visiteur.
        </p>
      </section>

      <section className="mt-5 space-y-3">
        {adminLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm transition active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
              {item.icon}
            </div>

            <div className="min-w-0">
              <h2 className="font-bold text-gray-900">{item.title}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {item.description}
              </p>
            </div>

            <span className="ml-auto text-gray-300">›</span>
          </Link>
        ))}
      </section>

      <section className="mt-5 rounded-3xl border bg-white p-4">
        <h2 className="font-bold text-gray-900">État du prototype</h2>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-green-50 p-3 text-green-700">
            PWA active
          </div>
          <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
            Offline actif
          </div>
          <div className="rounded-2xl bg-purple-50 p-3 text-purple-700">
            Carte éditable
          </div>
          <div className="rounded-2xl bg-orange-50 p-3 text-orange-700">
            Supabase connecté
          </div>
        </div>
      </section>
    </main>
  )
}