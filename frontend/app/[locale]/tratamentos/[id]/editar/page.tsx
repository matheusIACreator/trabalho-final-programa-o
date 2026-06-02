import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getTratamento } from "@/lib/api"
import { TratamentoForm } from "@/components/TratamentoForm"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export default async function EditarTratamentoPage({ params }: Props) {
  const { id, locale } = await params
  setRequestLocale(locale)

  const tratamentoId = Number(id)
  if (isNaN(tratamentoId)) notFound()

  let tratamento
  try {
    tratamento = await getTratamento(tratamentoId)
  } catch {
    notFound()
  }

  const t = await getTranslations("Form")

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tratamentos"><ChevronLeft className="size-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {tratamento.nomeMedicamento}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("editSubtitle", { id: tratamento.id })}
          </p>
        </div>
      </div>
      <Separator />
      <TratamentoForm tratamento={tratamento} />
    </div>
  )
}
