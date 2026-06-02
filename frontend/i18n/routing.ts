import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["pt", "en"],
  defaultLocale: "pt",
  localePrefix: "as-needed", // PT sem prefixo, EN com /en
})
