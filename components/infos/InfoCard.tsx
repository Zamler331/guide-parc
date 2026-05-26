export default function InfoCard({ info }: { info: any }) {
  return (
    <div className="rounded-xl border p-4 shadow-sm">
      <h2 className="text-lg font-semibold">
        {info.icon && <span className="mr-2">{info.icon}</span>}
        {info.title}
      </h2>

      <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
        {info.content}
      </p>
    </div>
  )
}