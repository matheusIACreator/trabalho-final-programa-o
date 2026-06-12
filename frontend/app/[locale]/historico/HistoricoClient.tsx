"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { AlertTriangle, Bell, BellRing, ClipboardList, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import type { Notificacao } from "@/lib/types"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type NotificacaoHistorico = Notificacao & { confirmadaEm: string }

const PRIO_CONFIG = {
  3: { Icon: AlertTriangle, badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30", dot: "bg-red-500", labelKey: "filterCritical" as const },
  2: { Icon: BellRing,      badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/30", dot: "bg-amber-500", labelKey: "filterUrgent" as const },
  1: { Icon: Bell,          badge: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30", dot: "bg-sky-500", labelKey: "filterNormal" as const },
} as const

type Filtro = "todas" | 1 | 2 | 3
const LS_KEY = "notificacoes_historico"

function lerHistorico(): NotificacaoHistorico[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as NotificacaoHistorico[] }
  catch { return [] }
}

export function HistoricoClient() {
  const t = useTranslations("Historico")
  const [historico, setHistorico] = useState<NotificacaoHistorico[]>([])
  const [filtro, setFiltro] = useState<Filtro>("todas")
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setHistorico(lerHistorico().reverse()); setMounted(true) }, [])

  function handleLimpar() {
    localStorage.removeItem(LS_KEY)
    setHistorico([])
    toast.success(t("clearToast"))
  }

  const FILTROS: { label: string; value: Filtro }[] = [
    { label: t("filterAll"), value: "todas" },
    { label: t("filterCritical"), value: 3 },
    { label: t("filterUrgent"), value: 2 },
    { label: t("filterNormal"), value: 1 },
  ]

  const lista = filtro === "todas" ? historico : historico.filter((n) => n.prioridade === filtro)

  function fmtDatetime(iso: string) {
    return format(new Date(iso), "dd/MM/yyyy HH:mm")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {mounted ? t("count", { count: historico.length }) : t("loading")}
          </p>
        </div>
        {historico.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="size-4" />{t("clearBtn")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("clearTitle")}</AlertDialogTitle>
                <AlertDialogDescription>{t("clearDesc", { count: historico.length })}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("clearCancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleLimpar}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t("clearConfirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Separator />

      {historico.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {FILTROS.map(({ label, value }) => (
            <Button key={String(value)} variant={filtro === value ? "secondary" : "ghost"} size="sm"
              onClick={() => setFiltro(value)} className={cn(filtro === value && "font-medium")}>
              {label}
            </Button>
          ))}
        </div>
      )}

      {!mounted ? null : lista.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
          <ClipboardList className="size-10 opacity-30" />
          <p className="text-lg">{filtro === "todas" ? t("emptyMain") : t("emptyFiltered", { type: FILTROS.find((f) => f.value === filtro)?.label ?? "" })}</p>
          <p className="text-sm">{t("emptyHint")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lista.map((n) => {
            const cfg = PRIO_CONFIG[n.prioridade]
            const { Icon } = cfg
            return (
              <Card key={n.id} className="border-border/50">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={cn("mt-0.5 shrink-0 rounded-full p-2", cfg.badge.split(" ").slice(0,1).join(" "))}>
                    <Icon className={cn("size-4", cfg.badge.split(" ")[1])} />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium leading-snug">{n.mensagem}</p>
                      <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-xs", cfg.badge)}>
                        {t(cfg.labelKey)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{t("scheduled", { date: fmtDatetime(n.horario) })}</span>
                      <span>{t("confirmed", { date: fmtDatetime(n.confirmadaEm) })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
