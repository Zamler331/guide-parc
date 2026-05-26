function getStyle(type: string) {
  switch (type) {
    case "warning":
      return "bg-orange-100 text-orange-800"
    case "danger":
      return "bg-red-100 text-red-800"
    case "success":
      return "bg-green-100 text-green-800"
    default:
      return "bg-blue-100 text-blue-800"
  }
}

export default function AlertBanner({ alerts }: { alerts: any[] }) {
  if (!alerts || alerts.length === 0) return null

  return (
    <div className="space-y-2 px-4 pt-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-xl px-4 py-3 text-sm font-medium ${getStyle(
            alert.type
          )}`}
        >
          <p className="font-semibold">{alert.title}</p>
          <p>{alert.message}</p>
        </div>
      ))}
    </div>
  )
}