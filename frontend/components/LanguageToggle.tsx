"use client"

import { useLocale } from "next-intl"
import { useRouter, usePathname } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function toggle() {
    router.replace(pathname, { locale: locale === "pt" ? "en" : "pt" })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className="h-7 rounded-full px-3 text-xs font-medium"
      title={locale === "pt" ? "Switch to English" : "Mudar para Português"}
    >
      {locale === "pt" ? "PT" : "EN"}
      <span className="text-muted-foreground">|</span>
      {locale === "pt" ? "EN" : "PT"}
    </Button>
  )
}
