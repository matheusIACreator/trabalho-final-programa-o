"use client"

import { AlertTriangle, Bell, BellRing } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { confirmarNotificacao } from "@/lib/api"
import type { Notificacao } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

interface Props {
  notificacao: Notificacao
  onClose: (id: string) => void
}

const PRIORITY_CONFIG = {
  3: { Icon: AlertTriangle, iconClass: "text-red-600 dark:text-red-400", badgeClass: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30", labelKey: "labelCritical" as const },
  2: { Icon: BellRing,      iconClass: "text-amber-600 dark:text-yellow-400", badgeClass: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/30", labelKey: "labelUrgent" as const },
  1: { Icon: Bell,          iconClass: "text-sky-600 dark:text-blue-400", badgeClass: "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30", labelKey: "labelNormal" as const },
} as const

export function NotificacaoModal({ notificacao, onClose }: Props) {
  const t = useTranslations("Notifications")
  const config = PRIORITY_CONFIG[notificacao.prioridade]
  const { Icon, iconClass, badgeClass } = config

  const hora = new Date(notificacao.horario).toLocaleTimeString("pt-PT", {
    hour: "2-digit", minute: "2-digit",
  })

  async function handleConfirmar() {
    try {
      await confirmarNotificacao(notificacao.id)
      const historico = JSON.parse(localStorage.getItem("notificacoes_historico") ?? "[]")
      historico.push({ ...notificacao, confirmadaEm: new Date().toISOString() })
      localStorage.setItem("notificacoes_historico", JSON.stringify(historico))
      toast.success(t("toastTaken"))
    } catch {
      toast.error(t("toastError"))
    }
    onClose(notificacao.id)
  }

  function handleAdiar() { onClose(notificacao.id) }

  return (
    <Dialog open onOpenChange={handleAdiar}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            <Icon className={`size-5 ${iconClass}`} />
            <span>{t("title")}</span>
            <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
              {t(config.labelKey)}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm leading-relaxed">{notificacao.mensagem}</p>
          <p className="text-xs text-muted-foreground">{t("scheduledAt", { time: hora })}</p>
        </div>
        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button variant="outline" onClick={handleAdiar} className="flex-1 sm:flex-none">
            {t("snooze")}
          </Button>
          <Button onClick={handleConfirmar} className="flex-1 sm:flex-none">
            {t("take")} ✓
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
