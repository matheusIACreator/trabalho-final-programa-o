"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, Calculator } from "lucide-react"
import { ajustarInsulina, criarTratamento, atualizarTratamento } from "@/lib/api"
import { TratamentoSchema, type TratamentoFormValues } from "@/lib/schemas"
import type { Tratamento } from "@/lib/types"
import { VIA_LABELS, FORMA_LABELS, INSULINA_LABELS } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDate(iso: string) { return new Date(iso) }

function toISO(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00`
}

function tratamentoToForm(t: Tratamento): TratamentoFormValues {
  const base = {
    nomeMedicamento: t.nomeMedicamento, dosagem: t.dosagem,
    dataInicio: toDate(t.dataInicio), dataFim: toDate(t.dataFim),
    frequenciaHoras: t.frequenciaHoras, observacoes: t.observacoes ?? "",
  }
  switch (t.tipo) {
    case "medicamento_oral":
      return { tipo: "medicamento_oral", ...base, forma: t.forma, tomarComComida: t.tomarComComida }
    case "injecao":
      return { tipo: "injecao", ...base, via: t.via, volumeML: t.volumeML, necessitaRefrigeracao: t.necessitaRefrigeracao }
    case "injecao_insulina":
      return { tipo: "injecao_insulina", ...base, via: t.via, volumeML: t.volumeML, necessitaRefrigeracao: t.necessitaRefrigeracao, tipoInsulina: t.tipoInsulina, unidadesPorDose: t.unidadesPorDose, glicemiaUltimaMedida: t.glicemiaUltimaMedida }
  }
}

function formToPayload(v: TratamentoFormValues) {
  const base = {
    nomeMedicamento: v.nomeMedicamento, dosagem: v.dosagem,
    dataInicio: toISO(v.dataInicio), dataFim: toISO(v.dataFim),
    frequenciaHoras: v.frequenciaHoras, observacoes: v.observacoes ?? "",
  }
  switch (v.tipo) {
    case "medicamento_oral":
      return { tipo: "medicamento_oral" as const, ...base, forma: v.forma, tomarComComida: v.tomarComComida }
    case "injecao":
      return { tipo: "injecao" as const, ...base, via: v.via, volumeML: v.volumeML, necessitaRefrigeracao: v.necessitaRefrigeracao }
    case "injecao_insulina":
      return { tipo: "injecao_insulina" as const, ...base, via: v.via, volumeML: v.volumeML, necessitaRefrigeracao: v.necessitaRefrigeracao, tipoInsulina: v.tipoInsulina, unidadesPorDose: v.unidadesPorDose, glicemiaUltimaMedida: v.glicemiaUltimaMedida }
  }
}

// ─── Modal de ajuste de insulina ──────────────────────────────────────────────

function AjusteInsulinaModal({ tratamentoId, open, onClose }: { tratamentoId: number; open: boolean; onClose: () => void }) {
  const t = useTranslations("Form")
  const [glicemia, setGlicemia] = useState("")
  const [resultado, setResultado] = useState<{ unidadesRecomendadas: number; glicemia: number } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCalcular() {
    const g = Number(glicemia)
    if (!g || g <= 0) { toast.error(t("toastCalcInvalid")); return }
    setLoading(true)
    try { setResultado(await ajustarInsulina(tratamentoId, g)) }
    catch { toast.error(t("toastCalcError")) }
    finally { setLoading(false) }
  }

  function handleClose() { setGlicemia(""); setResultado(null); onClose() }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="size-5 text-violet-400" />
            {t("calcTitle")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("calcGlicemia")}</label>
            <Input type="number" min={0} placeholder={t("calcPlaceholder")} value={glicemia}
              onChange={(e) => { setGlicemia(e.target.value); setResultado(null) }} />
          </div>
          {resultado && (
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-4 text-center">
              <p className="text-sm text-muted-foreground">{t("calcRecommended")}</p>
              <p className="text-3xl font-bold text-violet-400">{resultado.unidadesRecomendadas} UI</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("calcFor", { value: resultado.glicemia })}</p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>{t("close")}</Button>
          <Button onClick={handleCalcular} disabled={loading || !glicemia}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {t("calculate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

const DEFAULT_VALUES: TratamentoFormValues = {
  tipo: "medicamento_oral",
  nomeMedicamento: "", dosagem: "", frequenciaHoras: 8, observacoes: "",
  dataInicio: undefined as unknown as Date,
  dataFim: undefined as unknown as Date,
  forma: "COMPRIMIDO", tomarComComida: false,
}

export function TratamentoForm({ tratamento }: { tratamento?: Tratamento }) {
  const t = useTranslations("Form")
  const router = useRouter()
  const [ajusteOpen, setAjusteOpen] = useState(false)

  const form = useForm<TratamentoFormValues>({
    resolver: zodResolver(TratamentoSchema) as Resolver<TratamentoFormValues>,
    defaultValues: tratamento ? tratamentoToForm(tratamento) : DEFAULT_VALUES,
  })

  const tipo = form.watch("tipo")
  const isSubmitting = form.formState.isSubmitting

  function handleTipoChange(novoTipo: string) {
    const cur = form.getValues()
    const base = { nomeMedicamento: cur.nomeMedicamento, dosagem: cur.dosagem, dataInicio: cur.dataInicio, dataFim: cur.dataFim, frequenciaHoras: cur.frequenciaHoras, observacoes: cur.observacoes }
    const tp = novoTipo as TratamentoFormValues["tipo"]
    if (tp === "medicamento_oral") form.reset({ tipo: tp, ...base, forma: "COMPRIMIDO", tomarComComida: false })
    else if (tp === "injecao") form.reset({ tipo: tp, ...base, via: "SUBCUTANEA", volumeML: 1, necessitaRefrigeracao: false })
    else form.reset({ tipo: tp, ...base, via: "SUBCUTANEA", volumeML: 0.3, necessitaRefrigeracao: true, tipoInsulina: "RAPIDA", unidadesPorDose: 8, glicemiaUltimaMedida: 0 })
  }

  async function onSubmit(values: TratamentoFormValues) {
    const payload = formToPayload(values)
    try {
      if (tratamento) {
        await atualizarTratamento(tratamento.id, { ...payload, id: tratamento.id } as Tratamento)
        toast.success(t("toastUpdated"))
      } else {
        await criarTratamento(payload)
        toast.success(t("toastCreated"))
      }
      router.push("/tratamentos")
      router.refresh()
    } catch { toast.error(t("toastError")) }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as Parameters<typeof form.handleSubmit>[0])} className="space-y-6">

          <FormField control={form.control} name="tipo" render={({ field }) => (
            <FormItem>
              <FormLabel>{t("tipoLabel")}</FormLabel>
              <Select value={field.value} onValueChange={handleTipoChange} disabled={!!tratamento}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="medicamento_oral">{t("tipoOral")}</SelectItem>
                  <SelectItem value="injecao">{t("tipoInjecao")}</SelectItem>
                  <SelectItem value="injecao_insulina">{t("tipoInsulina")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="nomeMedicamento" render={({ field }) => (
              <FormItem><FormLabel>{t("nome")}</FormLabel>
                <FormControl><Input placeholder={t("nomePlaceholder")} {...field} /></FormControl>
                <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="dosagem" render={({ field }) => (
              <FormItem><FormLabel>{t("dosagem")}</FormLabel>
                <FormControl><Input placeholder={t("dosagemPlaceholder")} {...field} /></FormControl>
                <FormMessage /></FormItem>
            )} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField control={form.control} name="dataInicio" render={({ field }) => (
              <FormItem><FormLabel>{t("dataInicio")}</FormLabel>
                <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="dataFim" render={({ field }) => (
              <FormItem><FormLabel>{t("dataFim")}</FormLabel>
                <FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl>
                <FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="frequenciaHoras" render={({ field }) => (
              <FormItem><FormLabel>{t("frequencia")}</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={168} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                </FormControl>
                <FormMessage /></FormItem>
            )} />
          </div>

          <FormField control={form.control} name="observacoes" render={({ field }) => (
            <FormItem><FormLabel>{t("observacoes")}</FormLabel>
              <FormControl><Input placeholder={t("observacoesPlaceholder")} {...field} /></FormControl>
              <FormMessage /></FormItem>
          )} />

          <Separator />

          {tipo === "medicamento_oral" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="forma" render={({ field }) => (
                <FormItem><FormLabel>{t("forma")}</FormLabel>
                  <Select value={field.value as string} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{Object.entries(FORMA_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="tomarComComida" render={({ field }) => (
                <FormItem className="flex flex-col justify-end">
                  <FormLabel>{t("tomarComComida")}</FormLabel>
                  <div className="flex h-10 items-center">
                    <FormControl><Switch checked={field.value as boolean} onCheckedChange={field.onChange} /></FormControl>
                  </div>
                </FormItem>
              )} />
            </div>
          )}

          {(tipo === "injecao" || tipo === "injecao_insulina") && (
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField control={form.control} name="via" render={({ field }) => (
                <FormItem><FormLabel>{t("via")}</FormLabel>
                  <Select value={field.value as string} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{Object.entries(VIA_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="volumeML" render={({ field }) => (
                <FormItem><FormLabel>{t("volume")}</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" min={0.1} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                  </FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="necessitaRefrigeracao" render={({ field }) => (
                <FormItem className="flex flex-col justify-end">
                  <FormLabel>{t("refrigeracao")}</FormLabel>
                  <div className="flex h-10 items-center">
                    <FormControl><Switch checked={field.value as boolean} onCheckedChange={field.onChange} /></FormControl>
                  </div>
                </FormItem>
              )} />
            </div>
          )}

          {tipo === "injecao_insulina" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="tipoInsulina" render={({ field }) => (
                  <FormItem><FormLabel>{t("tipoInsulinaLabel")}</FormLabel>
                    <Select value={field.value as string} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{Object.entries(INSULINA_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="unidadesPorDose" render={({ field }) => (
                  <FormItem><FormLabel>{t("unidades")}</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                    </FormControl><FormMessage /></FormItem>
                )} />
              </div>
              {tratamento && (
                <Button type="button" variant="outline"
                  className="w-full border-violet-500/30 text-violet-400 hover:bg-violet-500/10 hover:text-violet-400"
                  onClick={() => setAjusteOpen(true)}>
                  <Calculator className="size-4" />{t("calcBtn")}
                </Button>
              )}
            </>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()} disabled={isSubmitting}>
              {t("cancel")}
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {tratamento ? t("save") : t("create")}
            </Button>
          </div>
        </form>
      </Form>

      {tratamento?.tipo === "injecao_insulina" && (
        <AjusteInsulinaModal tratamentoId={tratamento.id} open={ajusteOpen} onClose={() => setAjusteOpen(false)} />
      )}
    </>
  )
}
