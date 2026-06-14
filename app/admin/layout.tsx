import Link from "next/link"

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: "Home" },
  { href: "/admin/attractions", label: "Attractions", icon: "Ride" },
  { href: "/admin/zones", label: "Zones", icon: "Zone" },
  { href: "/admin/map", label: "Carte", icon: "Map" },
  { href: "/admin/programme", label: "Programme", icon: "Show" },
  { href: "/admin/infos", label: "Infos", icon: "Info" },
  { href: "/admin/alerts", label: "Alertes", icon: "Alert" },
  { href: "/admin/opening-hours", label: "Horaires", icon: "Time" },
  { href: "/admin/analytics", label: "Statistiques", icon: "Stats" },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        <aside className="hidden w-72 shrink-0 border-r bg-white p-5 md:block">
          <div className="mb-8">
            <p className="text-sm text-gray-500">Interface admin</p>
            <h1 className="text-2xl font-black">Guide Parc</h1>
          </div>

          <nav className="space-y-2">
            {adminLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b bg-white/90 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Administration
                </p>
                <p className="font-bold">Gestion du contenu</p>
              </div>

              <Link
                href="/"
                className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Voir l'app
              </Link>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto md:hidden">
              {adminLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full bg-gray-100 px-3 py-2 text-xs font-semibold"
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
