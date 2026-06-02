import { setRequestLocale } from "next-intl/server"
import { TratamentosClient } from "./TratamentosClient"

interface Props { params: Promise<{ locale: string }> }

export default async function TratamentosPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  return <TratamentosClient />
}
