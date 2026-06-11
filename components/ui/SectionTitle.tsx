type SectionTitleProps = {
  title: string
  subtitle?: string
}

export default function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-3">
      <h2 className="text-xl font-black leading-tight text-slate-950">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm font-medium leading-5 text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  )
}
