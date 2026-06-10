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
    <div className="space-y-6 p-4">
      {Object.entries(grouped).map(([zoneName, items]: any) => (
        <section key={zoneName}>
          <h2 className="mb-3 text-xl font-black text-gray-900">
            📍 {zoneName}
          </h2>

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