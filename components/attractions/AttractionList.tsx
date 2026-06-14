import AttractionCard from "./AttractionCard"

export default function AttractionList({
  attractions,
  opening,
}: {
  attractions: any[]
  opening: any
}) {
  const grouped = attractions.reduce((acc: any, attraction: any) => {
    const zoneName = attraction.park_areas?.name || "Autres attractions"

    if (!acc[zoneName]) acc[zoneName] = []
    acc[zoneName].push(attraction)

    return acc
  }, {})

  return (
    <div className="space-y-6 px-4 pb-6">
      {Object.entries(grouped).map(([zoneName, items]: any) => (
        <section key={zoneName}>
          <div className="mb-3 rounded-2xl border border-white/80 bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-3 text-white shadow-sm">
            <p className="text-[11px] font-black uppercase text-white/75">
              Zone du parc
            </p>
            <h2 className="text-2xl font-black leading-tight">
              {zoneName}
            </h2>
            <p className="mt-1 text-xs font-bold text-white/80">
              {items.length} attraction{items.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid gap-4">
            {items.map((attraction: any) => (
              <AttractionCard
                key={attraction.id}
                attraction={attraction}
                opening={opening}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
