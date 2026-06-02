import { setRequestLocale } from "next-intl/server"
import { DashboardClient } from "./DashboardClient"

interface Props { params: Promise<{ locale: string }> }

export default async function Page({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <DashboardClient />
}
