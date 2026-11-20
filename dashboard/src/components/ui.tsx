import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { ACCENT_CLASS } from '../theme'
import type { Accent } from '../theme'
import type { KpiItem, Tone } from '../types/nfl'

/* ───── Modo Coach / Broadcast ───── */
export type ViewMode = 'coach' | 'broadcast'
export const ModeContext = createContext<ViewMode>('coach')
export const useMode = () => useContext(ModeContext)

/** Contenido de detalle (tablas, estadística) que se oculta en Modo Broadcast */
export function CoachOnly({ children }: { children: ReactNode }) {
  return useMode() === 'coach' ? <>{children}</> : null
}

/* ───── Tarjeta de módulo ───── */
interface CardProps {
  title: string
  subtitle?: string
  accent?: Accent
  badge?: string
  className?: string
  children: ReactNode
}
export function Card({ title, subtitle, accent = 'offense', badge, className = '', children }: CardProps) {
  const mode = useMode()
  const a = ACCENT_CLASS[accent]
  return (
    <section
      className={`flex flex-col rounded-lg border border-nfl-blue/70 border-t-2 ${a.border} bg-legacy-blue shadow-card ${
        mode === 'broadcast' ? 'p-6' : 'p-4'
      } ${className}`}
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3
            className={`font-display font-bold uppercase tracking-wide ${a.text} ${
              mode === 'broadcast' ? 'text-2xl' : 'text-lg'
            }`}
          >
            {title}
          </h3>
          {subtitle && <p className="mt-0.5 text-xs text-[var(--muted)]">{subtitle}</p>}
        </div>
        {badge && <Badge>{badge}</Badge>}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  )
}

export function Badge({ children, tone = 'gold' }: { children: ReactNode; tone?: 'gold' | 'red' | 'blue' }) {
  const styles = {
    gold: 'border-unam-gold/60 bg-unam-gold/10 text-unam-gold',
    red: 'border-unity-red bg-legacy-red text-nfl-white',
    blue: 'border-impact-blue/60 bg-impact-blue/10 text-impact-blue',
  }[tone]
  return (
    <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles}`}>
      {children}
    </span>
  )
}

/* ───── KPI ───── */
const TONE_TEXT: Record<Tone, string> = {
  neutral: 'text-[var(--muted)]',
  good: 'text-emerald-400',
  warn: 'text-unam-gold-bright',
  bad: 'text-nfl-red',
}
export function KpiCard({ kpi, accent }: { kpi: KpiItem; accent: Accent }) {
  const mode = useMode()
  const a = ACCENT_CLASS[accent]
  return (
    <div className="relative overflow-hidden rounded-lg border border-nfl-blue/70 bg-legacy-blue p-4 shadow-card">
      <span className={`absolute inset-y-0 left-0 w-1 ${a.bg}`} />
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">{kpi.label}</p>
      <p className={`font-display font-bold leading-none ${mode === 'broadcast' ? 'mt-2 text-6xl' : 'mt-1 text-4xl'}`}>
        {kpi.value}
      </p>
      {(kpi.hint || kpi.delta) && (
        <p className={`mt-2 text-xs ${TONE_TEXT[kpi.tone ?? 'neutral']}`}>
          {kpi.delta && <span className="mr-1 font-semibold">{kpi.delta}</span>}
          <span className="text-[var(--muted)]">{kpi.hint}</span>
        </p>
      )}
    </div>
  )
}

export function KpiRow({ items, accent }: { items: KpiItem[]; accent: Accent }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((k) => (
        <KpiCard key={k.label} kpi={k} accent={accent} />
      ))}
    </div>
  )
}

/* ───── Tabla de datos ───── */
export interface Column<T> {
  header: string
  render: (row: T) => ReactNode
  align?: 'left' | 'right'
}
export function DataTable<T>({ rows, columns }: { rows: T[]; columns: Column<T>[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-nfl-blue text-[10px] uppercase tracking-wider text-[var(--muted)]">
            {columns.map((c) => (
              <th key={c.header} className={`px-2 py-1.5 font-semibold ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-nfl-blue/40 last:border-0 hover:bg-nfl-blue/20">
              {columns.map((c) => (
                <td key={c.header} className={`px-2 py-1.5 tabular-nums ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Insight({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 rounded border-l-2 border-unam-gold bg-unam-gold/5 px-3 py-2 text-xs text-nfl-white/90">
      {children}
    </p>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="mb-1 mt-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] first:mt-0">{children}</p>
}

/* ───── Mini estadística ───── */
export function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="rounded border border-nfl-blue/60 bg-gridiron-black/40 px-2 py-1.5">
          <p className="font-display text-xl font-bold leading-none">{s.value}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-[var(--muted)]">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
