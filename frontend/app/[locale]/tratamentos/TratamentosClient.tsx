"use client"

import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { toast } from "sonner"
import { eliminarTratamento, getTratamentos } from "@/lib/api"
import type { Tratamento } from "@/lib/types"
import { FORMA_LABELS, INSULINA_LABELS, TIPO_LABELS, VIA_LABELS } from "@/lib/types"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Filtro = "todos" | Tratamento["tipo"]

const TIPO_BADGE: Record<Tratamento["tipo"], string> = {
  medicamento_oral: "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30",
  injecao: "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30",
  injecao_insulina: "bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30",
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function TratamentoDetalhes({ t: trat, tx }: { t: Tratamento; tx: ReturnType<typeof useTranslations> }) {
  if (trat.tipo === "medicamento_oral") return (
    <><span>{FORMA_LABELS[trat.forma]}</span><span>{trat.tomarComComida ? tx("withFood") : tx("noFood")}</span></>
  )
  if (trat.tipo === "injecao") return (
    <><span>{VIA_LABELS[trat.via]}</span><span>{trat.volumeML} mL{trat.necessitaRefrigeracao ? ` · ${tx("refrigeration")}` : ""}</span></>
  )
  return (
    <><span>Insulina {INSULINA_LABELS[trat.tipoInsulina]} · {trat.unidadesPorDose} UI/dose</span><span>{VIA_LABELS[trat.via]}{trat.necessitaRefrigeracao ? ` · ${tx("refrigeration")}` : ""}</span></>
  )
}

function CardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-2/3" /><Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-2/3" />
      </CardContent>
      <CardFooter className="gap-2 pt-3">
        <Skeleton className="h-9 flex-1" /><Skeleton className="h-9 flex-1" />
      </CardFooter>
    </Card>
  )
}

export function TratamentosClient() {
  const t = useTranslations("Tratamentos")
  const [tratamentos, setTratamentos] = useState<Tratamento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Filtro>("todos")

  const FILTROS: { label: string; value: Filtro }[] = [
    { label: t("filterAll"), value: "todos" },
    { label: t("filterOral"), value: "medicamento_oral" },
    { label: t("filterInjecao"), value: "injecao" },
    { label: t("filterInsulina"), value: "injecao_insulina" },
  ]

  const carregar = useCallback(async () => {
    setLoading(true)
    try { setTratamentos(await getTratamentos()) }
    catch { toast.error(t("errorLoad")) }
    finally { setLoading(false) }
  }, [t])

  useEffect(() => { carregar() }, [carregar])

  async function handleEliminar(id: number, nome: string) {
    try {
      await eliminarTratamento(id)
      setTratamentos((prev) => prev.filter((x) => x.id !== id))
      toast.success(t("deletedToast", { name: nome }))
    } catch { toast.error(t("errorDelete")) }
  }

  const lista = filtro === "todos" ? tratamentos : tratamentos.filter((x) => x.tipo === filtro)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? t("loading") : t("registered", { count: tratamentos.length })}
          </p>
        </div>
        <Button asChild>
          <Link href="/tratamentos/novo"><Plus className="size-4" />{t("new")}</Link>
        </Button>
      </div>

      <Separator />

      <div className="flex flex-wrap items-center gap-2">
        {FILTROS.map(({ label, value }) => (
          <Button key={value} variant={filtro === value ? "secondary" : "ghost"} size="sm"
            onClick={() => setFiltro(value)} className={cn(filtro === value && "font-medium")}>
            {label}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={carregar} disabled={loading} className="ml-auto text-muted-foreground">
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          <span className="hidden sm:inline">{t("refresh")}</span>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />) :
         lista.length === 0 ? (
          <div className="col-span-full flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
            <p className="text-lg">{filtro === "todos" ? t("emptyAll") : t("emptyFiltered")}</p>
            {filtro === "todos" && (
              <Button asChild variant="outline" size="sm">
                <Link href="/tratamentos/novo"><Plus className="size-4" />{t("createFirst")}</Link>
              </Button>
            )}
          </div>
        ) : lista.map((trat) => (
          <Card key={trat.id} className="flex flex-col transition-colors hover:border-border hover:bg-card/80">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-tight">{trat.nomeMedicamento}</CardTitle>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", TIPO_BADGE[trat.tipo])}>
                  {TIPO_LABELS[trat.tipo]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{trat.dosagem}</p>
            </CardHeader>
            <CardContent className="flex-1 space-y-1.5 text-sm text-muted-foreground">
              <TratamentoDetalhes t={trat} tx={t} />
              <p className="text-xs">{t("everyHours", { hours: trat.frequenciaHoras })}{trat.observacoes ? ` · ${trat.observacoes}` : ""}</p>
              <p className="text-xs">{fmtDate(trat.dataInicio)} → {fmtDate(trat.dataFim)}</p>
            </CardContent>
            <CardFooter className="gap-2 pt-3">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href={`/tratamentos/${trat.id}/editar`}><Pencil className="size-3.5" />{t("edit")}</Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm"
                    className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="size-3.5" />{t("delete")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("deleteDesc", { name: trat.nomeMedicamento })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("deleteCancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleEliminar(trat.id, trat.nomeMedicamento)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {t("deleteConfirm")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
