export default function ShowCard({ show }: { show: any }) {
  return (
    <div className="rounded-xl border p-4 shadow-sm">
      <h2 className="text-lg font-semibold">{show.title}</h2>

      <p className="text-sm text-gray-500">
        {show.start_time} - {show.end_time}
      </p>

      <p className="mt-2 text-gray-600">{show.description}</p>
    </div>
  )
}