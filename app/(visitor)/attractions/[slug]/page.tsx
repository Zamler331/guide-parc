import { getAttractionBySlug } from "@/lib/attractions"
import { notFound } from "next/navigation"

export default async function AttractionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const attraction = await getAttractionBySlug(slug)

  if (!attraction) return notFound()

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">{attraction.name}</h1>

      {attraction.park_areas && (
        <p className="text-sm text-gray-500">
          {attraction.park_areas.name}
        </p>
      )}

      {attraction.image_url && (
        <img
          src={attraction.image_url}
          alt={attraction.name}
          className="mt-4 w-full rounded-xl object-cover"
        />
      )}

      <p className="mt-4 text-gray-700">
        {attraction.description}
      </p>

      <div className="mt-6 space-y-2 text-sm">
        {attraction.min_height && (
          <p>🎯 Taille minimum : {attraction.min_height} cm</p>
        )}

        {attraction.is_family && <p>👨‍👩‍👧‍👦 Familiale</p>}
        {attraction.is_thrill && <p>🎢 Sensations fortes</p>}
        {attraction.is_kids && <p>🧒 Enfants</p>}
        {attraction.is_accessible_pmr && <p>♿ Accessible PMR</p>}
      </div>
    </main>
  )
}