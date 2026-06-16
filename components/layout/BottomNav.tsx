"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { href: "/", label: "Accueil" },
  { href: "/carte", label: "Carte" },
  { href: "/attractions", label: "Attractions" },
  { href: "/programme", label: "Programme" },
  { href: "/infos", label: "Infos" },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="shrink-0 border-t bg-white px-2 py-2">
      <div className="grid grid-cols-5 gap-1 text-center text-xs">
        {tabs.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href)

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={
                active
                  ? "rounded-xl bg-blue-50 px-2 py-2 font-semibold text-blue-700"
                  : "rounded-xl px-2 py-2 text-gray-500"
              }
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
