"use client"

import { useCallback, useEffect, useState } from "react"
import { format, isBefore, isSameDay } from "date-fns"
import { pt as dateFnsPT } from "date-fns/locale"
import { enUS } from "date-fns/locale"
import { CalendarDays, Clock, RefreshCw } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { toast } from "sonner"
import { getHorariosDia, getTratamentos } from "@/lib/api"
import type { Tratamento } from "@/lib/types"
import { FORMA_LABELS, INSULINA_LABELS, TIPO_LABELS, VIA_LABELS } from "@/lib/types"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface ScheduleItem {
  horario: Date
  tratamento: Tratamento
}

const TIPO_COLOR: Record<Tratamento["tipo"], string> = {
  medicamento_oral: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  injecao: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  injecao_insulina: "bg-violet-500/15 text-violet-400 border-violet-500/30",
}

const TIPO_DOT: Record<Tratamento["tipo"], string> = {
  medicamento_oral: "bg-blue-400",
  injecao: "bg-orange-400",
  injecao_insulina: "bg-violet-400",
}

function toDateStr(d: Date): string {
  return format(d, "yyyy-MM-dd")
}

function infoLine(t: Tratamento): string {
  switch (t.tipo) {
    case "medicamento_oral":
      return `${FORMA_LABELS[t.forma]}${t.tomarComComida ? " · Com comida" : ""}`
    case "injecao":
      return `${VIA_LABELS[t.via]} · ${t.volumeML} mL`
    case "injecao_insulina":
      return `Insulina ${INSULINA_LABELS[t.tipoInsulina]} · ${t.unidadesPorDose} UI`
  }
}

async function fetchItemsForDate(tratamentos: Tratamento[], dateStr: string): Promise<ScheduleItem[]> {
  const results = await Promise.allSettled(
    tratamentos.map(async (t) => {
      const hs = await getHorariosDia(t.id, dateStr)
      return hs.map((h) => ({ horario: new Date(h), tratamento: t }))
    }),
  )
  const items: ScheduleItem[] = []
  for (const r of results) if (r.status === "fulfilled") items.push(...r.value)
  return items.sort((a, b) => a.horario.getTime() - b.horario.getTime())
}

function TimelineSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-14 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function TimelineItem({ item, isNext, isPast }: { item: ScheduleItem; isNext: boolean; isPast: boolean }) {
  const t = useTranslations("Dashboard")
  const { tratamento, horario } = item
  return (
    <div className={cn(
      "relative flex items-start gap-3 rounded-lg border p-3 transition-colors",
      isNext && "border-primary/40 bg-primary/5",
      isPast && "opacity-50",
      !isNext && !isPast && "border-border/50",
    )}>
      <div className={cn(
        "flex w-14 shrink-0 flex-col items-center justify-center rounded-md py-2 text-center",
        isNext ? "bg-primary text-primary-foreground" : "bg-muted",
      )}>
        <span className="text-xs font-bold leading-none">{format(horario, "HH:mm")}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 shrink-0 rounded-full", TIPO_DOT[tratamento.tipo])} />
          <p className={cn("truncate text-sm font-medium", isPast && "line-through")}>{tratamento.nomeMedicamento}</p>
          <span className={cn("ml-auto shrink-0 rounded-full border px-2 py-0.5 text-xs", TIPO_COLOR[tratamento.tipo])}>
            {TIPO_LABELS[tratamento.tipo]}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{tratamento.dosagem} · {infoLine(tratamento)}</p>
        {isNext && (
          <span className="mt-1 inline-block rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
            {t("nextDose")}
          </span>
        )}
      </div>
    </div>
  )
}

function DayItemList({ items, loading, date }: { items: ScheduleItem[]; loading: boolean; date: Date }) {
  const t = useTranslations("Dashboard")
  const locale = useLocale()
  const dateFnsLocale = locale === "en" ? enUS : dateFnsPT

  if (loading) return <TimelineSkeleton />
  if (items.length === 0) {
    const label = isSameDay(date, new Date()) ? t("today").toLowerCase() : format(date, "d 'de' MMMM", { locale: dateFnsLocale })
    return <p className="py-6 text-center text-sm text-muted-foreground">{t("noDosesToday")} ({label})</p>
  }
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg border border-border/50 p-2.5">
          <span className="w-12 shrink-0 rounded-md bg-muted py-1.5 text-center text-xs font-bold">
            {format(item.horario, "HH:mm")}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.tratamento.nomeMedicamento}</p>
            <p className="text-xs text-muted-foreground">{item.tratamento.dosagem} · {infoLine(item.tratamento)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function DashboardClient() {
  const t = useTranslations("Dashboard")
  const locale = useLocale()
  const dateFnsLocale = locale === "en" ? enUS : dateFnsPT

  const [tratamentos, setTratamentos] = useState<Tratamento[]>([])
  const [todayItems, setTodayItems] = useState<ScheduleItem[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedItems, setSelectedItems] = useState<ScheduleItem[]>([])
  const [loadingToday, setLoadingToday] = useState(true)
  const [loadingSelected, setLoadingSelected] = useState(false)

  const now = new Date()
  const todayStr = toDateStr(now)
  const nextIndex = todayItems.findIndex((i) => !isBefore(i.horario, now))

  const carregar = useCallback(async () => {
    setLoadingToday(true)
    try {
      const ts = await getTratamentos()
      setTratamentos(ts)
      const items = await fetchItemsForDate(ts, todayStr)
      setTodayItems(items)
      setSelectedItems(items)
    } catch {
      toast.error(t("errorLoad"))
    } finally {
      setLoadingToday(false)
    }
  }, [todayStr, t])

  useEffect(() => { carregar() }, [carregar])

  async function handleSelectDate(date: Date | undefined) {
    if (!date) return
    setSelectedDate(date)
    const dateStr = toDateStr(date)
    if (dateStr === todayStr) { setSelectedItems(todayItems); return }
    setLoadingSelected(true)
    try {
      setSelectedItems(await fetchItemsForDate(tratamentos, dateStr))
    } catch {
      toast.error(t("errorDay"))
    } finally {
      setLoadingSelected(false)
    }
  }

  const pastCount = todayItems.filter((i) => isBefore(i.horario, now)).length
  const futureCount = todayItems.length - pastCount

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground capitalize">
            {format(now, "EEEE, d 'de' MMMM 'de' yyyy", { locale: dateFnsLocale })}
          </p>
        </div>
        <button onClick={carregar} disabled={loadingToday}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50">
          <RefreshCw className={cn("size-3.5", loadingToday && "animate-spin")} />
          {t("refresh")}
        </button>
      </div>

      {!loadingToday && todayItems.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t("statsTotal"), value: todayItems.length, valueClass: "text-foreground", bg: "bg-muted/40" },
            { label: t("statsTaken"), value: pastCount, valueClass: "text-muted-foreground", bg: "bg-muted/20" },
            { label: t("statsPending"), value: futureCount, valueClass: "text-primary", bg: "bg-primary/8" },
          ].map(({ label, value, valueClass, bg }) => (
            <Card key={label} className={cn("border-border/50 transition-colors", bg)}>
              <CardContent className="flex flex-col items-center justify-center gap-0.5 p-4">
                <p className={cn("text-3xl font-bold tabular-nums", valueClass)}>{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Separator />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <h2 className="font-semibold">{t("todayDoses")}</h2>
            {!loadingToday && (
              <span className="ml-auto text-xs text-muted-foreground">
                {t("doses", { count: todayItems.length })}
              </span>
            )}
          </div>
          {loadingToday ? <TimelineSkeleton /> : todayItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/50 py-12 text-center text-sm text-muted-foreground">
              {tratamentos.length === 0 ? t("noTreatments") : t("noDosesToday")}
            </div>
          ) : (
            <div className="space-y-2">
              {todayItems.map((item, i) => (
                <TimelineItem key={i} item={item}
                  isNext={i === nextIndex}
                  isPast={isBefore(item.horario, now) && i !== nextIndex}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            <h2 className="font-semibold">{t("calendar")}</h2>
          </div>
          <Card>
            <CardContent className="flex justify-center p-3">
              <Calendar mode="single" selected={selectedDate} onSelect={handleSelectDate}
                locale={dateFnsLocale} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isSameDay(selectedDate, now) ? t("today") : format(selectedDate, "d 'de' MMMM", { locale: dateFnsLocale })}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <DayItemList items={selectedItems} loading={loadingSelected} date={selectedDate} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
