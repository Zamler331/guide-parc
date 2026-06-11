import Card from "@/components/ui/Card"

export default function InfoCard({ info }: { info: any }) {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-black leading-tight text-slate-950">
        {info.icon && <span className="mr-2">{info.icon}</span>}
        {info.title}
      </h2>

      <p className="mt-2 whitespace-pre-line text-sm font-medium leading-5 text-slate-600">
        {info.content}
      </p>
    </Card>
  )
}
