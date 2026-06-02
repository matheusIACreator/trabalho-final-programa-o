"use client"

import { useNotificacoes } from "@/hooks/useNotificacoes"
import { NotificacaoModal } from "@/components/NotificacaoModal"

export function NotificacoesProvider() {
  const { fila, removerDaFila } = useNotificacoes()
  const atual = fila[0]

  if (!atual) return null

  return <NotificacaoModal notificacao={atual} onClose={removerDaFila} />
}
