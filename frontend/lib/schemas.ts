import { z } from "zod"

// ─── Enums ────────────────────────────────────────────────────────────────────

export const ViaAdministracaoEnum = z.enum([
  "SUBCUTANEA",
  "INTRAMUSCULAR",
  "INTRAVENOSA",
])

export const FormaOralEnum = z.enum([
  "COMPRIMIDO",
  "CAPSULA",
  "XAROPE",
  "GOTAS",
  "SAQUETA",
])

export const TipoInsulinaEnum = z.enum([
  "RAPIDA",
  "LENTA",
  "INTERMEDIA",
  "MISTA",
])

// ─── Campos base (partilhados) ────────────────────────────────────────────────

const baseFields = {
  nomeMedicamento: z.string().min(1, "Nome obrigatório"),
  dosagem: z.string().min(1, "Dosagem obrigatória"),
  dataInicio: z.date({ error: "Data de início obrigatória" }),
  dataFim: z.date({ error: "Data de fim obrigatória" }),
  frequenciaHoras: z
    .number({ error: "Deve ser um número" })
    .int()
    .min(1, "Mínimo 1 hora")
    .max(168, "Máximo 168 horas"),
  observacoes: z.string().default(""),
}

// ─── Schemas por tipo ─────────────────────────────────────────────────────────

export const MedicamentoOralSchema = z
  .object({
    tipo: z.literal("medicamento_oral"),
    ...baseFields,
    forma: FormaOralEnum,
    tomarComComida: z.boolean().default(false),
  })
  .refine((d) => d.dataFim >= d.dataInicio, {
    message: "Data de fim deve ser após a data de início",
    path: ["dataFim"],
  })

export const InjecaoSchema = z
  .object({
    tipo: z.literal("injecao"),
    ...baseFields,
    via: ViaAdministracaoEnum,
    volumeML: z.number({ error: "Deve ser um número" }).positive("Deve ser positivo"),
    necessitaRefrigeracao: z.boolean().default(false),
  })
  .refine((d) => d.dataFim >= d.dataInicio, {
    message: "Data de fim deve ser após a data de início",
    path: ["dataFim"],
  })

export const InjecaoInsulinaSchema = z
  .object({
    tipo: z.literal("injecao_insulina"),
    ...baseFields,
    via: ViaAdministracaoEnum,
    volumeML: z.number({ error: "Deve ser um número" }).positive("Deve ser positivo"),
    necessitaRefrigeracao: z.boolean().default(false),
    tipoInsulina: TipoInsulinaEnum,
    unidadesPorDose: z
      .number({ error: "Deve ser um número" })
      .int()
      .positive("Deve ser positivo"),
    glicemiaUltimaMedida: z.number().min(0).default(0),
  })
  .refine((d) => d.dataFim >= d.dataInicio, {
    message: "Data de fim deve ser após a data de início",
    path: ["dataFim"],
  })

export const TratamentoSchema = z.discriminatedUnion("tipo", [
  MedicamentoOralSchema,
  InjecaoSchema,
  InjecaoInsulinaSchema,
])

export type TratamentoFormValues = z.infer<typeof TratamentoSchema>
