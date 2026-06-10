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
  {
    href: "/admin/opening-hours",
    icon: "🕒",
    title: "Horiares",
    description: "Définir les jours et heures d'ouverture du parc",
  },
]

export default function AdminPage() {
  return (
    <div>
      <section className="rounded-3xl bg-gray-900 p-6 text-white shadow-sm">
        <p className="text-sm text-gray-300">Interface de gestion</p>
        <h1 className="mt-1 text-3xl font-black">Admin du parc ⚙️</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-300">
          Gérez les contenus visibles dans l’application visiteur.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
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

      <section className="mt-6 rounded-3xl border bg-white p-5">
        <h2 className="font-bold text-gray-900">État du prototype</h2>

        <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
          <div className="rounded-2xl bg-green-50 p-4 text-green-700">
            PWA active
          </div>
          <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
            Offline actif
          </div>
          <div className="rounded-2xl bg-purple-50 p-4 text-purple-700">
            Carte éditable
          </div>
          <div className="rounded-2xl bg-orange-50 p-4 text-orange-700">
            Supabase connecté
          </div>
        </div>
      </section>
    </div>
  )
}