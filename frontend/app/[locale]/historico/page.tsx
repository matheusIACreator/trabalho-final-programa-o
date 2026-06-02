import { setRequestLocale } from "next-intl/server"
import { HistoricoClient } from "./HistoricoClient"

interface Props { params: Promise<{ locale: string }> }

export default async function HistoricoPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <HistoricoClient />
}
