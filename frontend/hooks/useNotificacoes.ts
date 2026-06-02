"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getNotificacoesPendentes } from "@/lib/api"
import type { Notificacao } from "@/lib/types"

const POLL_INTERVAL = 5000

export function useNotificacoes() {
  const [fila, setFila] = useState<Notificacao[]>([])
  const vistos = useRef<Set<string>>(new Set())

  const poll = useCallback(async () => {
    try {
      const pendentes = await getNotificacoesPendentes()
      const novos = pendentes.filter((n) => !vistos.current.has(n.id))
      if (novos.length > 0) {
        novos.forEach((n) => vistos.current.add(n.id))
        try {
          await new Audio("/alarme.mp3").play()
        } catch {
          // autoplay bloqueado ou ficheiro não presente
        }
        setFila((prev) => [...prev, ...novos])
      }
    } catch {
      // ignora erros de rede silenciosamente
    }
  }, [])

  useEffect(() => {
    poll()
    const id = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [poll])

  const removerDaFila = useCallback((id: string) => {
    setFila((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return { fila, removerDaFila }
}
