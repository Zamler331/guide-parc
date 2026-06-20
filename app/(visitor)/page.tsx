import OfflineTodayOpeningCard from "@/components/opening/OfflineTodayOpeningCard"
import InstallAppButton from "@/components/pwa/InstallAppButton"
import { getTodayOpening } from "@/lib/opening-hours"

export default async function HomePage() {
  const opening = await getTodayOpening({ fast: true })

  return (
    <main className="h-full overflow-hidden bg-blue-700 text-white">
      <section className="relative flex h-full min-h-0 flex-col items-center overflow-hidden px-[clamp(0.75rem,3vw,1rem)] py-[clamp(0.5rem,1.4dvh,1rem)] text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-blue-600 to-indigo-950" />

        <OfflineTodayOpeningCard opening={opening} />

        <div className="relative z-10 mt-[clamp(0.35rem,1.1dvh,0.75rem)] shrink-0">
          <p className="text-[clamp(0.62rem,1.45dvh,0.75rem)] font-black uppercase leading-tight text-yellow-200">
            Guide du parc
          </p>
          <h1 className="mt-[clamp(0.25rem,0.9dvh,0.5rem)] text-[clamp(1.85rem,5.2dvh,2.5rem)] font-black leading-[1.05] drop-shadow-lg">
            Bienvenue à la Récré !
          </h1>

          <p className="mt-[clamp(0.25rem,0.9dvh,0.5rem)] text-[clamp(0.82rem,2dvh,1rem)] font-bold leading-tight text-blue-50 drop-shadow">
            Préparez votre journée en famille.
          </p>
        </div>

        <div className="relative z-30 mt-[clamp(0.4rem,1.2dvh,0.85rem)] w-full shrink-0">
          <InstallAppButton />
        </div>

        <div className="relative z-10 -mt-[clamp(1.2rem,3.8dvh,2.25rem)] flex min-h-0 w-full flex-1 items-center justify-center">
          <div className="absolute bottom-[4%] h-[32%] w-[86%] rounded-[50%] bg-indigo-950/24 blur-xl" />
          <img
            src="/home-mascotte.png"
            alt="Mascotte du parc"
            className="relative z-10 h-full max-h-[clamp(310px,58dvh,520px)] min-h-0 w-auto scale-[1.08] object-contain drop-shadow-2xl"
          />
        </div>

        <div className="relative z-30 -mt-[clamp(3rem,8dvh,4.25rem)] grid w-full shrink-0 grid-cols-2 gap-[clamp(0.45rem,1.3dvh,0.75rem)]">
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

        <div className="relative z-20 mt-[clamp(0.25rem,0.8dvh,0.55rem)] flex min-h-[clamp(2rem,5.2dvh,3.05rem)] shrink-0 items-center justify-center">
          <div className="absolute inset-x-3 top-1/2 h-8 -translate-y-1/2 rounded-full bg-white/16 blur-lg" />
          <div className="relative [mask-image:radial-gradient(ellipse_at_center,black_38%,rgba(0,0,0,0)_70%,transparent_88%)]">
            <img
              src="/logo-recre.png"
              alt="La Recre des 3 Cures"
              className="h-[clamp(2.2rem,6dvh,3.55rem)] object-contain drop-shadow-[0_10px_18px_rgba(15,23,42,0.35)]"
            />
          </div>
        </div>
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
      className={`${color} ${shadow} flex h-[clamp(3.15rem,9.2dvh,4.45rem)] items-center justify-center rounded-2xl border border-white/30 p-[clamp(0.55rem,1.8dvh,0.75rem)] text-center text-[clamp(0.78rem,1.9dvh,0.9rem)] font-black leading-tight text-white shadow-xl transition active:scale-95`}
    >
      {label}
    </a>
  )
}
