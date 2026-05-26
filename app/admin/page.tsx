export default function AdminPage() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">Admin ⚙️</h1>

      <div className="mt-4 space-y-3">
        <a href="/admin/attractions" className="block rounded-xl bg-gray-100 p-4">
          🎢 Gérer les attractions
        </a>

        <a href="/admin/map" className="block rounded-xl bg-gray-100 p-4">
          🗺️ Gérer la carte
        </a>

        <a href="/admin/programme" className="block rounded-xl bg-gray-100 p-4">
          🎭 Gérer le programme
        </a>

        <a href="/admin/infos" className="block rounded-xl bg-gray-100 p-4">
          ℹ️ Gérer les infos
        </a>

        <a href="/admin/alerts" className="block rounded-xl bg-gray-100 p-4">
          🚨 Gérer les alertes
        </a>
      </div>
    </main>
  )
}