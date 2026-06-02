// ─── Enums ────────────────────────────────────────────────────────────────────

export type ViaAdministracao = "SUBCUTANEA" | "INTRAMUSCULAR" | "INTRAVENOSA"
export type FormaOral = "COMPRIMIDO" | "CAPSULA" | "XAROPE" | "GOTAS" | "SAQUETA"
export type TipoInsulina = "RAPIDA" | "LENTA" | "INTERMEDIA" | "MISTA"

// ─── Tratamentos (discriminated union) ────────────────────────────────────────

interface TratamentoBase {
  id: number
  nomeMedicamento: string
  dosagem: string
  dataInicio: string // ISO-8601
  dataFim: string // ISO-8601
  frequenciaHoras: number
  observacoes: string
}

export interface MedicamentoOral extends TratamentoBase {
  tipo: "medicamento_oral"
  forma: FormaOral
  tomarComComida: boolean
}

export interface Injecao extends TratamentoBase {
  tipo: "injecao"
  via: ViaAdministracao
  volumeML: number
  necessitaRefrigeracao: boolean
}

export interface InjecaoInsulina extends TratamentoBase {
  tipo: "injecao_insulina"
  via: ViaAdministracao
  volumeML: number
  necessitaRefrigeracao: boolean
  tipoInsulina: TipoInsulina
  unidadesPorDose: number
  glicemiaUltimaMedida: number
}

export type Tratamento = MedicamentoOral | Injecao | InjecaoInsulina

// ─── Horários ─────────────────────────────────────────────────────────────────
// O backend devolve List<LocalDateTime> serializado como array de strings ISO-8601
export type HorarioDia = string

// ─── Notificações ─────────────────────────────────────────────────────────────

export interface Notificacao {
  id: string
  tratamentoId: number
  mensagem: string
  prioridade: 1 | 2 | 3 // 3 = crítica (insulina), 1 = normal
  horario: string
  criadaEm: string
}

// ─── Insulina ─────────────────────────────────────────────────────────────────

export interface AjusteInsulina {
  unidadesRecomendadas: number
  glicemia: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const VIA_LABELS: Record<ViaAdministracao, string> = {
  SUBCUTANEA: "Subcutânea",
  INTRAMUSCULAR: "Intramuscular",
  INTRAVENOSA: "Intravenosa",
}

export const FORMA_LABELS: Record<FormaOral, string> = {
  COMPRIMIDO: "Comprimido",
  CAPSULA: "Cápsula",
  XAROPE: "Xarope",
  GOTAS: "Gotas",
  SAQUETA: "Saqueta",
}

export const INSULINA_LABELS: Record<TipoInsulina, string> = {
  RAPIDA: "Rápida",
  LENTA: "Lenta",
  INTERMEDIA: "Intermédia",
  MISTA: "Mista",
}

export const TIPO_LABELS: Record<Tratamento["tipo"], string> = {
  medicamento_oral: "Medicamento Oral",
  injecao: "Injeção",
  injecao_insulina: "Injeção de Insulina",
}
