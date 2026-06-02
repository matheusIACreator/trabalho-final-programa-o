import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/Navbar"
import { NotificacoesProvider } from "@/components/NotificacoesProvider"
import { Toaster } from "@/components/ui/sonner"

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider defaultTheme="dark" enableSystem={false}>
        <Navbar />
        <main className="page-enter mx-auto max-w-7xl px-4 py-6 sm:px-6">
          {children}
        </main>
        <NotificacoesProvider />
        <Toaster richColors position="bottom-right" />
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
