import OfflineTodayOpeningCard from "@/components/opening/OfflineTodayOpeningCard"
import InstallAppButton from "@/components/pwa/InstallAppButton"
import { getTodayOpening } from "@/lib/opening-hours"

export default async function HomePage() {
  const opening = await getTodayOpening()

  return (
    <main className="h-full overflow-hidden bg-blue-700 text-white">
      <section className="relative flex h-full min-h-0 flex-col items-center gap-[clamp(0.35rem,1.2dvh,1rem)] overflow-hidden px-[clamp(0.75rem,3vw,1rem)] py-[clamp(0.55rem,1.7dvh,1.25rem)] text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-blue-600 to-indigo-950" />

        <OfflineTodayOpeningCard opening={opening} />

        <div className="relative z-10 shrink-0">
          <p className="text-[clamp(0.62rem,1.45dvh,0.75rem)] font-black uppercase leading-tight text-yellow-200">
            Guide du parc
          </p>
          <h1 className="mt-[clamp(0.25rem,0.9dvh,0.5rem)] text-[clamp(1.85rem,5.2dvh,2.5rem)] font-black leading-[1.05] drop-shadow-lg">
            Bienvenue a la Recre !
          </h1>

          <p className="mt-[clamp(0.25rem,0.9dvh,0.5rem)] text-[clamp(0.82rem,2dvh,1rem)] font-bold leading-tight text-blue-50 drop-shadow">
            Preparez votre journee en famille.
          </p>
        </div>

        <InstallAppButton />

        <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center">
          <img
            src="/home-mascotte.png"
            alt="Mascotte du parc"
            className="h-full max-h-[clamp(130px,34dvh,300px)] min-h-0 w-auto object-contain drop-shadow-2xl"
          />
        </div>

        <div className="relative z-20 -mt-[clamp(1.5rem,5dvh,2.5rem)] grid w-full shrink-0 grid-cols-2 gap-[clamp(0.45rem,1.3dvh,0.75rem)]">
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
          className="relative z-10 h-[clamp(2rem,6dvh,3.5rem)] shrink-0 object-contain drop-shadow-lg"
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
      className={`${color} ${shadow} flex h-[clamp(3.25rem,10.5dvh,5rem)] items-center justify-center rounded-2xl p-[clamp(0.55rem,1.8dvh,0.75rem)] text-center text-[clamp(0.78rem,1.9dvh,0.9rem)] font-black leading-tight text-white shadow-xl transition active:scale-95`}
    >
      {label}
    </a>
  )
}
