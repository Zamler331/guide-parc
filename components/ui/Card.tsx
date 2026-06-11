import type { HTMLAttributes } from "react"

type CardProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean
}

export default function Card({
  className = "",
  interactive = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white shadow-sm ${
        interactive ? "transition active:scale-[0.98]" : ""
      } ${className}`}
      {...props}
    />
  )
}
