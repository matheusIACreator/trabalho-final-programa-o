import { setRequestLocale } from "next-intl/server"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { useTranslations } from "next-intl"
import { TratamentoForm } from "@/components/TratamentoForm"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface Props { params: Promise<{ locale: string }> }

function PageContent() {
  const t = useTranslations("Form")
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/tratamentos"><ChevronLeft className="size-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("novoTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("novoSubtitle")}</p>
        </div>
      </div>
      <Separator />
      <TratamentoForm />
    </div>
  )
}

export default async function NovoTratamentoPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <PageContent />
}
