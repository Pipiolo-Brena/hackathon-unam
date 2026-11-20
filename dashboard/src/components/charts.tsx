import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { COLORS } from '../theme'

const tick = { fill: COLORS.muted, fontSize: 11 }
const tooltipStyle = {
  contentStyle: {
    background: COLORS.legacyBlue,
    border: `1px solid ${COLORS.unamGold}`,
    borderRadius: 6,
    color: COLORS.white,
    fontSize: 12,
  },
  labelStyle: { color: COLORS.unamGold },
  itemStyle: { color: COLORS.white },
  cursor: { fill: 'rgba(255,255,255,0.05)' },
}

export interface SeriesDef {
  key: string
  name: string
  color: string
}

/** Barras verticales con una o más series */
export function ColumnChart<T extends object>({
  data,
  xKey,
  series,
  height = 200,
}: {
  data: T[]
  xKey: keyof T & string
  series: SeriesDef[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={COLORS.grid} vertical={false} />
        <XAxis dataKey={(d: T) => d[xKey] as string} tick={tick} axisLine={false} tickLine={false} interval={0} />
        <YAxis tick={tick} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[3, 3, 0, 0]} maxBarSize={36} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Barras horizontales de una serie; permite resaltar barras según una función de color */
export function HBarChart<T extends object>({
  data,
  labelKey,
  valueKey,
  name,
  color,
  colorFn,
  height = 220,
  labelWidth = 110,
}: {
  data: T[]
  labelKey: keyof T & string
  valueKey: keyof T & string
  name: string
  color: string
  colorFn?: (row: T) => string
  height?: number
  labelWidth?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={COLORS.grid} horizontal={false} />
        <XAxis type="number" tick={tick} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey={(d: T) => d[labelKey] as string} tick={tick} axisLine={false} tickLine={false} width={labelWidth} interval={0} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey={(d: T) => d[valueKey] as number} name={name} fill={color} radius={[0, 3, 3, 0]} maxBarSize={20}>
          {data.map((row, i) => (
            <Cell key={i} fill={colorFn ? colorFn(row) : color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
