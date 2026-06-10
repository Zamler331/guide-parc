import AlertForm from "@/components/alerts/AlertForm"
import { getAlerts } from "@/lib/alerts"
import AlertActions from "@/components/alerts/AlertActions"

function getBadgeStyle(type: string) {
  switch (type) {
    case "warning":
      return "bg-orange-100 text-orange-700"
    case "danger":
      return "bg-red-100 text-red-700"
    case "success":
      return "bg-green-100 text-green-700"
    default:
      return "bg-blue-100 text-blue-700"
  }
}

export default async function AdminAlertsPage() {
  const alerts = await getAlerts()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Alertes 🚨</h1>
        <p className="mt-1 text-gray-500">
          Messages exceptionnels affichés sur l’accueil visiteur.
        </p>
      </div>

      <AlertForm />

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-3xl bg-white p-5 text-gray-500 shadow-sm">
            Aucune alerte pour le moment.
          </div>
        ) : (
          alerts.map((alert: any) => (
            <div key={alert.id} className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold">{alert.title}</h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getBadgeStyle(
                        alert.type
                      )}`}
                    >
                      {alert.type || "info"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        alert.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {alert.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">{alert.message}</p>

                  <p className="mt-3 text-xs text-gray-400">
                    Début : {alert.starts_at || "immédiat"} · Fin :{" "}
                    {alert.ends_at || "aucune"}
                  </p>
                </div>

                <AlertActions alert={alert} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}