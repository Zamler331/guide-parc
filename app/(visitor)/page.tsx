import Link from "next/link"
import { getActiveAlerts } from "@/lib/alerts"
import AlertBanner from "@/components/alerts/AlertBanner"
import OfflineSync from "@/components/offline/OfflineSync"

export default async function HomePage() {
  const alerts = await getActiveAlerts()

  return (
    <main className="h-screen overflow-hidden bg-blue-700 text-white">
      <section className="relative flex h-full flex-col items-center justify-between px-4 py-5 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500 via-blue-600 to-blue-900" />

        <div className="relative z-10">
          <h1 className="text-4xl font-black leading-tight drop-shadow-lg">
            Bienvenue <br />
            à la <span className="text-yellow-300">Récré !</span>
          </h1>

          <p className="mt-2 text-base font-bold text-blue-50 drop-shadow">
            Prépare-toi pour une journée
            <br />
            pleine d’aventures !
          </p>
        </div>

        <img
          src="/home-mascotte.png"
          alt="Mascotte du parc"
          className="relative z-10 -mt-2 max-h-[310px] w-auto object-contain drop-shadow-2xl"
        />

        <div className="relative z-20 -mt-12 grid w-full grid-cols-3 gap-3">
          <HomeButton
            href="/attractions"
            color="bg-pink-500"
            shadow="shadow-pink-800/40"
            icon="🎢"
            label="Attractions"
          />

          <HomeButton
            href="/carte"
            color="bg-green-500"
            shadow="shadow-green-800/40"
            icon="🗺️"
            label="Plan du parc"
          />

          <HomeButton
            href="/programme"
            color="bg-orange-500"
            shadow="shadow-orange-800/40"
            icon="🎭"
            label="Programme"
          />
        </div>

        <img
          src="/logo-recre.png"
          alt="La Récré des 3 Curés"
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
  icon,
  label,
}: {
  href: string
  color: string
  shadow: string
  icon: string
  label: string
}) {
  return (
    <Link
      href={href}
      className={`${color} ${shadow} flex min-h-24 flex-col items-center justify-center rounded-3xl p-3 text-center font-black text-white shadow-xl transition active:scale-95`}
    >
      <span className="text-3xl drop-shadow">{icon}</span>
      <span className="mt-2 text-sm leading-tight drop-shadow">{label}</span>
    </Link>
  )
}