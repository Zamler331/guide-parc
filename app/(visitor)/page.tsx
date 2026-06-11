import OfflineTodayOpeningCard from "@/components/opening/OfflineTodayOpeningCard"
import { getTodayOpening } from "@/lib/opening-hours"

export default async function HomePage() {
  const opening = await getTodayOpening()

  return (
    <main className="h-screen overflow-hidden bg-blue-700 text-white">
      <section className="relative flex h-full flex-col items-center justify-between px-4 py-5 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-blue-600 to-indigo-950" />

        <OfflineTodayOpeningCard opening={opening} />

        <div className="relative z-10">
          <p className="text-xs font-black uppercase text-yellow-200">
            Guide du parc
          </p>
          <h1 className="mt-2 text-4xl font-black leading-tight drop-shadow-lg">
            Bienvenue a la Recre
          </h1>

          <p className="mt-2 text-base font-bold leading-5 text-blue-50 drop-shadow">
            Preparez votre journee en famille.
          </p>
        </div>

        <img
          src="/home-mascotte.png"
          alt="Mascotte du parc"
          className="relative z-10 -mt-1 max-h-[300px] w-auto object-contain drop-shadow-2xl"
        />

        <div className="relative z-20 -mt-10 grid w-full grid-cols-2 gap-3">
          <HomeButton
            href="/attractions"
            color="bg-pink-500"
            shadow="shadow-pink-900/30"
            label="Attractions"
          />
          <HomeButton
            href="/carte"
            color="bg-emerald-500"
            shadow="shadow-emerald-900/30"
            label="Plan du parc"
          />
          <HomeButton
            href="/programme"
            color="bg-orange-500"
            shadow="shadow-orange-900/30"
            label="Programme"
          />
          <HomeButton
            href="/horaires"
            color="bg-sky-500"
            shadow="shadow-sky-900/30"
            label="Horaires"
          />
        </div>

        <img
          src="/logo-recre.png"
          alt="La Recre des 3 Cures"
          className="relative z-10 h-14 object-contain drop-shadow-lg"
        />
      </section>
    </main>
  )
}

function HomeButton({
  href,
  color,
  shadow,
  label,
}: {
  href: string
  color: string
  shadow: string
  label: string
}) {
  return (
    <a
      href={href}
      className={`${color} ${shadow} flex min-h-24 items-center justify-center rounded-2xl p-3 text-center text-sm font-black leading-tight text-white shadow-xl transition active:scale-95`}
    >
      {label}
    </a>
  )
}
