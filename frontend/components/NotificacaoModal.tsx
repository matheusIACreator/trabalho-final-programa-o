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
  3: { Icon: AlertTriangle, iconClass: "text-red-400", badgeClass: "bg-red-500/15 text-red-400 border border-red-500/30", labelKey: "labelCritical" as const },
  2: { Icon: BellRing,      iconClass: "text-yellow-400", badgeClass: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30", labelKey: "labelUrgent" as const },
  1: { Icon: Bell,          iconClass: "text-blue-400", badgeClass: "bg-blue-500/15 text-blue-400 border border-blue-500/30", labelKey: "labelNormal" as const },
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
          <DialogTitle className="flex items-center gap-2">
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
