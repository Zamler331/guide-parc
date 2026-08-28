"use client"

import OfflineTodayOpeningCard from "@/components/opening/OfflineTodayOpeningCard"
import InstallAppButton from "@/components/pwa/InstallAppButton"
import { useAppearance } from "@/components/appearance/AppearanceContext"
import {
  FontChoice,
  HOME_BUTTONS,
  HomeButtonKey,
  HomeElementAppearance,
} from "@/lib/appearance-defaults"

function getFontFamily(choice: FontChoice) {
  switch (choice) {
    case "rounded":
      return "var(--font-heading), ui-rounded, system-ui, sans-serif"
    case "serif":
      return "Georgia, Cambria, 'Times New Roman', serif"
    case "mono":
      return "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    default:
      return "var(--font-body), system-ui, sans-serif"
  }
}

function elementStyle(element: HomeElementAppearance) {
  return {
    transform: `translate(${element.offsetX}px, ${element.offsetY}px) scale(${element.scale})`,
    transformOrigin: "center",
  }
}

export default function HomeScreen({ opening }: { opening: any }) {
  const appearance = useAppearance()
  const home = appearance.home

  return (
    <main
      className="h-full overflow-hidden text-white"
      style={{
        background: home.backgroundTo,
        fontFamily: getFontFamily(home.typography.bodyFont),
      }}
    >
      <section className="relative flex h-full min-h-0 flex-col items-center overflow-hidden px-[clamp(0.75rem,3vw,1rem)] py-[clamp(0.5rem,1.4dvh,1rem)] text-center">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, ${home.backgroundFrom}, ${home.backgroundVia}, ${home.backgroundTo})`,
          }}
        />

        <OfflineTodayOpeningCard opening={opening} />

        {home.layout.heading.visible && (
        <div
          className="relative z-10 mt-[clamp(0.35rem,1.1dvh,0.75rem)] shrink-0"
          style={elementStyle(home.layout.heading)}
        >
          <p
            className="text-[clamp(0.62rem,1.45dvh,0.75rem)] font-black uppercase leading-tight"
            style={{ color: home.eyebrowColor }}
          >
            {home.eyebrowText}
          </p>
          <h1
            className="mt-[clamp(0.25rem,0.9dvh,0.5rem)] text-[clamp(1.85rem,5.2dvh,2.5rem)] font-black leading-[1.05] drop-shadow-lg"
            style={{
              color: home.titleColor,
              fontFamily: getFontFamily(home.typography.headingFont),
            }}
          >
            {home.title}
          </h1>

          <p
            className="mt-[clamp(0.25rem,0.9dvh,0.5rem)] text-[clamp(0.82rem,2dvh,1rem)] font-bold leading-tight drop-shadow"
            style={{ color: home.subtitleColor }}
          >
            {home.subtitle}
          </p>
        </div>
        )}

        {home.layout.installButton.visible && (
        <div
          className="relative z-30 mt-[clamp(0.4rem,1.2dvh,0.85rem)] w-full shrink-0"
          style={elementStyle(home.layout.installButton)}
        >
          <InstallAppButton />
        </div>
        )}

        {home.layout.mascot.visible && (
        <div
          className="relative z-10 -mt-[clamp(1.2rem,3.8dvh,2.25rem)] flex min-h-0 w-full flex-1 items-center justify-center"
          style={elementStyle(home.layout.mascot)}
        >
          <div className="absolute bottom-[4%] h-[32%] w-[86%] rounded-[50%] bg-indigo-950/24 blur-xl" />
          <img
            src={home.mascotImageUrl}
            alt="Mascotte du parc"
            className="relative z-10 h-full max-h-[clamp(310px,58dvh,520px)] min-h-0 w-auto object-contain drop-shadow-2xl"
          />
        </div>
        )}

        {home.layout.buttons.visible && (
        <div
          className="relative z-30 -mt-[clamp(3rem,8dvh,4.25rem)] grid w-full shrink-0 grid-cols-2 gap-[clamp(0.45rem,1.3dvh,0.75rem)]"
          style={elementStyle(home.layout.buttons)}
        >
          {HOME_BUTTONS.map((button) => (
            <HomeButton
              key={button.key}
              href={button.href}
              label={home.buttons[button.key].label || button.label}
              appearanceKey={button.key}
            />
          ))}
        </div>
        )}

        {home.layout.logo.visible && (
        <div
          className="relative z-20 mt-[clamp(0.25rem,0.8dvh,0.55rem)] flex min-h-[clamp(2rem,5.2dvh,3.05rem)] shrink-0 items-center justify-center"
          style={elementStyle(home.layout.logo)}
        >
          <div
            className="absolute inset-x-3 top-1/2 h-8 -translate-y-1/2 rounded-full blur-lg"
            style={{ background: home.logoGlowColor }}
          />
          <div className="relative [mask-image:radial-gradient(ellipse_at_center,black_38%,rgba(0,0,0,0)_70%,transparent_88%)]">
            <img
              src={home.logoImageUrl}
              alt="La Recre des 3 Cures"
              className="h-[clamp(2.2rem,6dvh,3.55rem)] object-contain drop-shadow-[0_10px_18px_rgba(15,23,42,0.35)]"
            />
          </div>
        </div>
        )}
      </section>
    </main>
  )
}

function HomeButton({
  href,
  label,
  appearanceKey,
}: {
  href: string
  label: string
  appearanceKey: HomeButtonKey
}) {
  const { home } = useAppearance()
  const button = home.buttons[appearanceKey]

  return (
    <a
      href={href}
      className="flex h-[clamp(3.15rem,9.2dvh,4.45rem)] items-center justify-center rounded-2xl border border-white/30 p-[clamp(0.55rem,1.8dvh,0.75rem)] text-center text-[clamp(0.78rem,1.9dvh,0.9rem)] font-black leading-tight shadow-xl transition active:scale-95"
      style={{
        backgroundColor: button.backgroundColor,
        color: button.textColor,
        boxShadow: `0 20px 25px -5px ${button.shadowColor}, 0 8px 10px -6px ${button.shadowColor}`,
      }}
    >
      {label}
    </a>
  )
}
