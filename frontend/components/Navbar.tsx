"use client"

import { usePathname } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { Pill } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LanguageToggle } from "@/components/LanguageToggle"
import { ThemeToggle } from "@/components/ThemeToggle"

export function Navbar() {
  const t = useTranslations("nav")
  const pathname = usePathname()

  const NAV_LINKS = [
    { href: "/", label: t("dashboard") },
    { href: "/tratamentos", label: t("tratamentos") },
    { href: "/historico", label: t("historico") },
  ] as const

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="mr-3 flex items-center gap-2 font-semibold">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/15">
            <Pill className="size-4 text-primary" />
          </div>
          <span className="hidden tracking-tight sm:inline">MedTrack</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href)
            return (
              <Button
                key={href}
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "transition-colors duration-150",
                  active
                    ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                <Link href={href}>{label}</Link>
              </Button>
            )
          })}
        </nav>

        {/* Right side — theme + language */}
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <div className="mx-1 h-4 w-px bg-border" />
          <LanguageToggle />
        </div>
      </div>
    </header>
  )
}
