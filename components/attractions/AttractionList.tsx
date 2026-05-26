import AttractionCard from "./AttractionCard"

export default function AttractionList({ attractions }: any) {
  return (
    <div className="grid gap-3 p-4">
      {attractions.map((attraction: any) => (
        <AttractionCard
          key={attraction.id}
          attraction={attraction}
        />
      ))}
    </div>
  )
}