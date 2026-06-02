import type {
  AjusteInsulina,
  HorarioDia,
  Notificacao,
  Tratamento,
} from "./types"

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7000"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API ${res.status}: ${text}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ─── Tratamentos ──────────────────────────────────────────────────────────────

export function getTratamentos(): Promise<Tratamento[]> {
  return request("/api/tratamentos")
}

export function getTratamento(id: number): Promise<Tratamento> {
  return request(`/api/tratamentos/${id}`)
}

export function criarTratamento(
  data: Omit<Tratamento, "id">,
): Promise<Tratamento> {
  return request("/api/tratamentos", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function atualizarTratamento(
  id: number,
  data: Tratamento,
): Promise<Tratamento> {
  return request(`/api/tratamentos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export function eliminarTratamento(id: number): Promise<void> {
  return request(`/api/tratamentos/${id}`, { method: "DELETE" })
}

export function getHorariosDia(
  id: number,
  dia: string, // YYYY-MM-DD
): Promise<HorarioDia[]> {
  return request(`/api/tratamentos/${id}/horarios?dia=${dia}`)
}

// ─── Notificações ─────────────────────────────────────────────────────────────

export function getNotificacoesPendentes(): Promise<Notificacao[]> {
  return request("/api/notificacoes/pendentes")
}

export function confirmarNotificacao(id: string): Promise<void> {
  return request(`/api/notificacoes/${id}/confirmar`, { method: "POST" })
}

export function dispararNotificacao(tratId: number): Promise<void> {
  return request(`/api/notificacoes/disparar/${tratId}`, { method: "POST" })
}

// ─── Insulina ─────────────────────────────────────────────────────────────────

export function ajustarInsulina(
  id: number,
  glicemia: number,
): Promise<AjusteInsulina> {
  return request(`/api/insulina/${id}/ajustar`, {
    method: "POST",
    body: JSON.stringify({ glicemia }),
  })
}
