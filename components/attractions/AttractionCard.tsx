import Link from "next/link"

type Attraction = {
  id: string
  name: string
  slug: string
  short_description: string
  image_url: string
  park_areas?: { name: string }
}

export default function AttractionCard({
  attraction,
}: {
  attraction: Attraction
}) {
  return (
    <Link href={`/attractions/${attraction.slug}`}>
      <div className="rounded-xl border p-3 shadow-sm">
        {attraction.image_url && (
          <img
            src={attraction.image_url}
            alt={attraction.name}
            className="mb-2 h-32 w-full rounded-lg object-cover"
          />
        )}

        <h2 className="text-lg font-semibold">{attraction.name}</h2>

        {attraction.park_areas && (
          <p className="text-xs text-gray-500">
            {attraction.park_areas.name}
          </p>
        )}

        <p className="mt-1 text-sm text-gray-600">
          {attraction.short_description}
        </p>
      </div>
    </Link>
  )
}