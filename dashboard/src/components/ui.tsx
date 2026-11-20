import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ACCENTS, COLORS } from '../theme'
import type { Accent } from '../theme'
import { Football, Goalpost, YardRuler } from './NflMotifs'

/* ───────────── Encabezado de ventana ───────────── */

export function WindowHeader({
  accent,
  eyebrow,
  title,
  description,
  goalpost = false,
  right,
}: {
  accent: Accent
  eyebrow: string
  title: string
  description?: string
  goalpost?: boolean
  right?: ReactNode
}) {
  const a = ACCENTS[accent]
  return (
    <header className="mb-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className={`mt-1 h-12 w-1.5 shrink-0 rounded-full ${a.bg}`} />
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.22em] ${a.text}`}>{eyebrow}</p>
            <h2 className="flex items-center gap-2 font-display text-4xl font-bold uppercase leading-none tracking-wide text-legacy-blue">
              {title}
              {goalpost && <Goalpost size={30} />}
            </h2>
            {description && <p className="mt-1.5 max-w-3xl text-sm text-ink-muted">{description}</p>}
          </div>
        </div>
        {right}
      </div>
      <YardRuler color={a.secondary} className="mt-3" />
    </header>
  )
}

/* ───────────── Franja KPI horizontal ───────────── */

export interface KpiItem {
  label: string
  value: string
  hint?: string
  baseline?: string // valor de temporada para comparar
  tone?: 'neutral' | 'good' | 'bad'
}

export function KpiStrip({ items, accent, caption }: { items: KpiItem[]; accent: Accent; caption?: string }) {
  const a = ACCENTS[accent]
  return (
    <section className="mb-5">
      {caption && <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{caption}</p>}
      <div className="kpi-grid overflow-hidden rounded-xl border border-field-line shadow-card">
        {items.map((k) => (
          <div key={k.label} className="group relative bg-nfl-white px-5 py-4 transition-all duration-300 hover:bg-field-mist">
            <span className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${a.bg}`} />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{k.label}</p>
            <p className={`mt-1 whitespace-nowrap font-display text-4xl font-bold leading-none ${a.text}`}>{k.value}</p>
            <p className="mt-1.5 text-xs text-ink-muted">
              {k.baseline && (
                <span
                  className={`mr-1 font-semibold ${
                    k.tone === 'good' ? 'text-emerald-700' : k.tone === 'bad' ? 'text-nfl-red' : 'text-legacy-blue'
                  }`}
                >
                  Temp. {k.baseline}
                </span>
              )}
              {k.hint}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ───────────── Tarjetas ───────────── */

export function Badge({ children, tone = 'gold' }: { children: ReactNode; tone?: 'gold' | 'red' | 'blue' | 'neutral' }) {
  const styles = {
    gold: 'border-unam-gold bg-[#FBF3DD] text-legacy-blue',
    red: 'border-unity-red/40 bg-[#FCE8E8] text-legacy-red',
    blue: 'border-impact-blue/40 bg-[#E6F1FD] text-nfl-blue',
    neutral: 'border-field-line bg-field-mist text-ink-muted',
  }[tone]
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles}`}>
      {children}
    </span>
  )
}

interface CardShellProps {
  accent: Accent
  title: string
  subtitle?: string
  badge?: ReactNode
  className?: string
  children: ReactNode
}

function CardShell({ accent, title, subtitle, badge, className = '', children }: CardShellProps) {
  const a = ACCENTS[accent]
  return (
    <section
      className={`rounded-xl border border-field-line bg-nfl-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${a.ring} ${className}`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-field-line px-5 py-3">
        <div className="flex items-start gap-2.5">
          <span className={`mt-1 h-4 w-1 rounded-full ${a.bg}`} />
          <div>
            <h3 className="font-display text-xl font-bold uppercase leading-tight tracking-wide text-legacy-blue">{title}</h3>
            {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
          </div>
        </div>
        {badge}
      </header>
      {children}
    </section>
  )
}

/** Tarjeta ancha: gráfica a la izquierda, métricas e insights a la derecha */
export function WideCard({ aside, children, ...shell }: Omit<CardShellProps, 'children'> & { children: ReactNode; aside?: ReactNode }) {
  return (
    <CardShell {...shell}>
      <div className={aside ? 'cq-split' : ''}>
        <div className="min-w-0 p-5">{children}</div>
        {aside && <aside className="min-w-0 bg-field-mist/60 p-5">{aside}</aside>}
      </div>
    </CardShell>
  )
}

export function Card(props: CardShellProps) {
  return (
    <CardShell {...props}>
      <div className="p-5">{props.children}</div>
    </CardShell>
  )
}

/* ───────────── Contenido de tarjetas ───────────── */

export function MetricList({ items }: { items: { label: string; value: string; hint?: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
      {items.map((m) => (
        <div key={m.label}>
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{m.label}</dt>
          <dd className="font-display text-2xl font-bold leading-tight text-legacy-blue">{m.value}</dd>
          {m.hint && <dd className="text-[11px] text-ink-muted">{m.hint}</dd>}
        </div>
      ))}
    </dl>
  )
}

export function Insight({ children, accent = 'gold' }: { children: ReactNode; accent?: Accent }) {
  const a = ACCENTS[accent]
  return (
    <p className={`mt-3 rounded-md border-l-4 ${a.border} ${a.bgSoft} px-3 py-2 text-sm leading-snug text-legacy-blue`}>{children}</p>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wider text-ink-muted first:mt-0">{children}</p>
}

/** Indica de qué endpoint viene el dato y si está filtrado */
export function SourceNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-snug text-ink-muted">
      <span aria-hidden="true" className="mt-[3px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-unam-gold" />
      <span>{children}</span>
    </p>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accent,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  accent: Accent
}) {
  const a = ACCENTS[accent]
  return (
    <div role="tablist" className="inline-flex flex-wrap gap-1 rounded-lg border border-field-line bg-field-mist p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1 text-xs font-semibold transition-all duration-300 ${
            o.value === value ? `${a.bg} text-nfl-white shadow-sm` : 'text-ink-muted hover:bg-nfl-white hover:text-legacy-blue'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ───────────── Tablas ───────────── */

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  /** valor para ordenar; si falta, la columna no es ordenable */
  sortValue?: (row: T) => number | string | null
  align?: 'left' | 'right'
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  initialSort,
  onRowClick,
  isSelected,
  maxHeight,
}: {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string | number
  initialSort?: { key: string; dir: 'asc' | 'desc' }
  onRowClick?: (row: T) => void
  isSelected?: (row: T) => boolean
  maxHeight?: string
}) {
  const [sort, setSort] = useState(initialSort ?? null)
  const sorted = useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col?.sortValue) return rows
    const get = col.sortValue
    return [...rows].sort((a, b) => {
      const va = get(a)
      const vb = get(b)
      if (va === null) return 1
      if (vb === null) return -1
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'es')
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [rows, columns, sort])

  const toggle = (key: string) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }))

  return (
    <div className="overflow-auto rounded-lg border border-field-line" style={maxHeight ? { maxHeight } : undefined}>
      <table className="w-full text-[13px]">
        <thead className="sticky top-0 z-[1] bg-field-mist">
          <tr className="text-[11px] uppercase tracking-wider text-ink-muted">
            {columns.map((c) => {
              const active = sort?.key === c.key
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={`whitespace-nowrap px-2.5 py-2 font-bold ${c.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {c.sortValue ? (
                    <button
                      onClick={() => toggle(c.key)}
                      className={`inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-legacy-blue ${
                        active ? 'text-legacy-blue' : ''
                      }`}
                    >
                      {c.header}
                      <span aria-hidden="true" className={active ? 'text-unam-gold' : 'opacity-30'}>
                        {active && sort.dir === 'asc' ? '▲' : '▼'}
                      </span>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const selected = isSelected?.(row) ?? false
            return (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-t border-field-line transition-colors duration-200 ${onRowClick ? 'cursor-pointer' : ''} ${
                  selected ? 'bg-[#FBF3DD]' : 'hover:bg-field-mist'
                }`}
              >
                {columns.map((c) => (
                  <td key={c.key} className={`whitespace-nowrap px-2.5 py-2 tabular-nums ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ───────────── Estados: carga, error, vacío ───────────── */

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />
}

export function WindowSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando datos">
      <div className="mb-5 flex items-center gap-3">
        <Skeleton className="h-12 w-1.5" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-72" />
        </div>
      </div>
      <Skeleton className="mb-5 h-24 w-full rounded-xl" />
      <div className="space-y-5">
        {[0, 1].map((i) => (
          <div key={i} className="grid gap-0 overflow-hidden rounded-xl border border-field-line bg-nfl-white lg:grid-cols-[1.7fr_1fr]">
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-52 w-full" />
            </div>
            <div className="space-y-3 bg-field-mist/60 p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Football size={26} color={COLORS.nflBlue} spinning />
      </div>
    </div>
  )
}

export function ErrorState({ title, detail, onRetry }: { title: string; detail?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="mx-auto my-10 max-w-xl animate-fade-up rounded-xl border border-unity-red/30 bg-nfl-white p-6 text-center shadow-card">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FCE8E8]">
        <Football size={26} color={COLORS.unityRed} />
      </div>
      <h3 className="font-display text-2xl font-bold uppercase text-legacy-red">{title}</h3>
      {detail && <p className="mt-2 break-words font-mono text-xs text-ink-muted">{detail}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-nfl-blue px-4 py-2 text-sm font-semibold text-nfl-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-unam-blue"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-field-line bg-field-mist/60 px-4 py-8 text-center">
      <Football size={22} color="#9AAABB" />
      <p className="mt-2 text-sm font-semibold text-legacy-blue">{title}</p>
      {detail && <p className="mt-1 max-w-md text-xs text-ink-muted">{detail}</p>}
    </div>
  )
}
