import type { ButtonHTMLAttributes } from "react"

export default function PrimaryButton({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`min-h-12 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-sm transition active:scale-[0.98] ${className}`}
      {...props}
    />
  )
}
