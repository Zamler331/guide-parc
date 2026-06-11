import type { HTMLAttributes } from "react"

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "green" | "red" | "orange" | "blue" | "gray"
}

const tones = {
  default: "bg-slate-100 text-slate-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  orange: "bg-orange-100 text-orange-700",
  blue: "bg-blue-100 text-blue-700",
  gray: "bg-gray-100 text-gray-600",
}

export default function Badge({
  tone = "default",
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ${tones[tone]} ${className}`}
      {...props}
    />
  )
}
