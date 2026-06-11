import AttractionCard from "./AttractionCard"
import SectionTitle from "@/components/ui/SectionTitle"

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
          <SectionTitle title={zoneName} />

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
