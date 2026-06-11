import type { ReactNode } from "react"

type PageHeaderProps = {
  title: string
  subtitle?: string
  eyebrow?: string
  action?: ReactNode
  tone?: "blue" | "dark" | "green" | "orange" | "pink"
}

const tones = {
  blue: "from-sky-500 to-blue-700",
  dark: "from-slate-800 to-slate-950",
  green: "from-emerald-500 to-green-700",
  orange: "from-amber-400 to-orange-600",
  pink: "from-pink-500 to-rose-600",
}

export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
  tone = "dark",
}: PageHeaderProps) {
  return (
    <section className={`bg-gradient-to-br ${tones[tone]} px-4 pb-7 pt-5 text-white`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          {eyebrow && (
            <p className="text-xs font-black uppercase text-white/75">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-1 text-3xl font-black leading-tight">{title}</h1>
          {subtitle && (
            <p className="mt-2 max-w-sm text-sm font-semibold leading-5 text-white/80">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
    </section>
  )
}
