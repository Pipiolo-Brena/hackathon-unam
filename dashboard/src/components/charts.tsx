import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import type { TooltipContentProps } from 'recharts'
import { CHART, COLORS } from '../theme'

export type ValueFormat = (v: number) => string
const defaultFormat: ValueFormat = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(2))

/* ───────────── Tooltip enriquecido ───────────── */

interface RichTooltipProps {
  active?: boolean
  payload?: TooltipContentProps<number, string>['payload']
  label?: ReactNode
  formats?: Record<string, ValueFormat>
  /** Líneas extra a partir de la fila de datos (p. ej. "n = 200 jugadas") */
  extra?: (row: Record<string, unknown>) => ReactNode
  accent?: string
}

export function RichTooltip({ active, payload, label, formats = {}, extra, accent = COLORS.nflBlue }: RichTooltipProps) {
  if (!active || !payload?.length) return null
  const row = (payload[0]?.payload ?? {}) as Record<string, unknown>
  return (
    <div className="min-w-[180px] animate-fade-up rounded-lg border border-field-line bg-nfl-white px-3 py-2 text-xs shadow-lift">
      <p className="mb-1.5 border-b pb-1 font-display text-sm font-bold uppercase tracking-wide text-legacy-blue" style={{ borderColor: accent }}>
        {label ?? String(row.label ?? '')}
      </p>
      <ul className="space-y-1">
        {payload.map((item) => {
          const key = typeof item.dataKey === 'string' ? item.dataKey : String(item.name)
          const format = formats[key] ?? formats[String(item.name)] ?? defaultFormat
          const v = typeof item.value === 'number' ? item.value : Number(item.value)
          return (
            <li key={key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-ink-muted">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color ?? item.fill ?? accent }} />
                {item.name}
              </span>
              <span className="font-semibold tabular-nums text-legacy-blue">
                {Number.isNaN(v) ? '–' : format(v)}
              </span>
            </li>
          )
        })}
      </ul>
      {extra && <div className="mt-1.5 border-t border-field-line pt-1 text-[11px] text-ink-muted">{extra(row)}</div>}
    </div>
  )
}

export interface SeriesDef {
  key: string
  name: string
  color: string
  format?: ValueFormat
}

const formatsOf = (series: SeriesDef[]) => Object.fromEntries(series.filter((s) => s.format).map((s) => [s.key, s.format!]))

const legendStyle = { fontSize: 12, color: COLORS.legacyBlue, paddingTop: 4 }

/* ───────────── Columnas (una o varias series) ───────────── */

export function ColumnChart<T extends object>({
  data,
  xKey,
  series,
  height = 240,
  yFormat,
  extra,
  accent,
}: {
  data: T[]
  xKey: keyof T & string
  series: SeriesDef[]
  height?: number
  yFormat?: ValueFormat
  extra?: (row: Record<string, unknown>) => ReactNode
  accent?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey={(d: T) => d[xKey] as string} tick={CHART.tick} axisLine={{ stroke: CHART.axis }} tickLine={false} interval={0} />
        <YAxis tick={CHART.tickMuted} axisLine={false} tickLine={false} width={44} tickFormatter={yFormat} />
        <Tooltip
          cursor={{ fill: CHART.cursor }}
          content={(p) => <RichTooltip active={p.active} payload={p.payload} label={p.label} formats={formatsOf(series)} extra={extra} accent={accent} />}
        />
        {series.length > 1 && <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />}
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={44} animationDuration={600} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ───────────── Barras horizontales ───────────── */

export function HBarChart<T extends object>({
  data,
  labelKey,
  valueKey,
  name,
  color,
  colorFn,
  format,
  height,
  labelWidth = 120,
  extra,
}: {
  data: T[]
  labelKey: keyof T & string
  valueKey: keyof T & string
  name: string
  color: string
  colorFn?: (row: T) => string
  format?: ValueFormat
  height?: number
  labelWidth?: number
  extra?: (row: Record<string, unknown>) => ReactNode
}) {
  return (
    <ResponsiveContainer width="100%" height={height ?? Math.max(120, data.length * 34 + 24)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART.grid} horizontal={false} />
        <XAxis type="number" tick={CHART.tickMuted} axisLine={false} tickLine={false} tickFormatter={format} />
        <YAxis
          type="category"
          dataKey={(d: T) => d[labelKey] as string}
          tick={CHART.tick}
          axisLine={{ stroke: CHART.axis }}
          tickLine={false}
          width={labelWidth}
          interval={0}
        />
        <Tooltip
          cursor={{ fill: CHART.cursor }}
          content={(p) => (
            <RichTooltip active={p.active} payload={p.payload} label={p.label} formats={format ? { [name]: format } : {}} extra={extra} accent={color} />
          )}
        />
        <Bar dataKey={(d: T) => d[valueKey] as number} name={name} fill={color} radius={[0, 4, 4, 0]} maxBarSize={22} animationDuration={600}>
          {data.map((row, i) => (
            <Cell key={i} fill={colorFn ? colorFn(row) : color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/* ───────────── Combinado: barras + líneas con doble eje ───────────── */

export function ComboChart<T extends object>({
  data,
  xKey,
  bars = [],
  lines = [],
  height = 280,
  leftFormat,
  rightFormat,
  extra,
}: {
  data: T[]
  xKey: keyof T & string
  bars?: (SeriesDef & { axis?: 'left' | 'right' })[]
  lines?: (SeriesDef & { axis?: 'left' | 'right' })[]
  height?: number
  leftFormat?: ValueFormat
  rightFormat?: ValueFormat
  extra?: (row: Record<string, unknown>) => ReactNode
}) {
  const all = [...bars, ...lines]
  const hasRight = all.some((s) => s.axis === 'right')
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey={(d: T) => d[xKey] as string} tick={CHART.tick} axisLine={{ stroke: CHART.axis }} tickLine={false} />
        <YAxis yAxisId="left" tick={CHART.tickMuted} axisLine={false} tickLine={false} width={44} tickFormatter={leftFormat} />
        {hasRight && (
          <YAxis yAxisId="right" orientation="right" tick={CHART.tickMuted} axisLine={false} tickLine={false} width={44} tickFormatter={rightFormat} />
        )}
        <Tooltip
          cursor={{ fill: CHART.cursor }}
          content={(p) => <RichTooltip active={p.active} payload={p.payload} label={p.label} formats={formatsOf(all)} extra={extra} />}
        />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        {bars.map((s) => (
          <Bar key={s.key} yAxisId={s.axis ?? 'left'} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={36} animationDuration={600} />
        ))}
        {lines.map((s) => (
          <Line
            key={s.key}
            yAxisId={s.axis ?? 'left'}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2.5}
            dot={{ r: 3, fill: COLORS.white, strokeWidth: 2 }}
            activeDot={{ r: 5 }}
            animationDuration={700}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

/* ───────────── Dispersión ───────────── */

export function ScatterPlot<T extends object>({
  data,
  x,
  y,
  size,
  labelKey,
  color,
  colorFn,
  height = 280,
}: {
  data: T[]
  x: { key: keyof T & string; name: string; format?: ValueFormat }
  y: { key: keyof T & string; name: string; format?: ValueFormat }
  size?: { key: keyof T & string; name: string }
  labelKey: keyof T & string
  color: string
  colorFn?: (row: T) => string
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 12, right: 72, left: 0, bottom: 8 }}>
        <CartesianGrid stroke={CHART.grid} />
        <XAxis
          type="number"
          dataKey={(d: T) => d[x.key] as number}
          name={x.name}
          tick={CHART.tickMuted}
          axisLine={{ stroke: CHART.axis }}
          tickLine={false}
          tickFormatter={x.format}
          domain={['auto', 'auto']}
          label={{ value: x.name, position: 'insideBottom', offset: -4, fill: COLORS.muted, fontSize: 11 }}
        />
        <YAxis
          type="number"
          dataKey={(d: T) => d[y.key] as number}
          name={y.name}
          tick={CHART.tickMuted}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={y.format}
          domain={['auto', 'auto']}
        />
        {size && <ZAxis type="number" dataKey={(d: T) => d[size.key] as number} name={size.name} range={[60, 420]} />}
        <Tooltip
          cursor={{ strokeDasharray: '4 4', stroke: CHART.axis }}
          content={(p) => (
            <RichTooltip
              active={p.active}
              payload={p.payload}
              label={String(((p.payload?.[0]?.payload ?? {}) as Record<string, unknown>)[labelKey] ?? '')}
              formats={{ [x.name]: x.format ?? defaultFormat, [y.name]: y.format ?? defaultFormat }}
              accent={color}
            />
          )}
        />
        <Scatter data={data} fill={color} animationDuration={600}>
          {data.map((row, i) => (
            <Cell key={i} fill={colorFn ? colorFn(row) : color} fillOpacity={0.85} stroke={COLORS.white} strokeWidth={1.5} />
          ))}
          <LabelList dataKey={(d: T) => d[labelKey] as string} position="right" offset={10} fill={COLORS.legacyBlue} fontSize={11} fontWeight={600} />
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}

/* ───────────── Radar comparativo (valores normalizados 0-100) ───────────── */

export function RadarCompare({
  data,
  a,
  b,
  height = 300,
}: {
  data: { metric: string; a: number; b: number }[]
  a: { name: string; color: string }
  b: { name: string; color: string }
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={CHART.grid} />
        <PolarAngleAxis dataKey="metric" tick={{ fill: COLORS.legacyBlue, fontSize: 11 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name={a.name} dataKey="a" stroke={a.color} fill={a.color} fillOpacity={0.25} strokeWidth={2} animationDuration={600} />
        <Radar name={b.name} dataKey="b" stroke={b.color} fill={b.color} fillOpacity={0.2} strokeWidth={2} animationDuration={600} />
        <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
        <Tooltip content={(p) => <RichTooltip active={p.active} payload={p.payload} label={p.label} formats={{ a: (v) => `${v.toFixed(0)} pctl`, b: (v) => `${v.toFixed(0)} pctl` }} />} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
