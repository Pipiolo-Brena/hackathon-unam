/** Motivos gráficos NFL como SVG inline. Uso sutil: divisores, íconos y barras de progreso. */
import { COLORS } from '../theme'

/* ───── Regla de yardaje: 10 | 20 | 30 | 40 | 50 | 40 | 30 | 20 | 10 ───── */
const YARD_NUMBERS = [10, 20, 30, 40, 50, 40, 30, 20, 10]

export function YardRuler({ color = COLORS.nflBlue, className = '' }: { color?: string; className?: string }) {
  return (
    <svg
      role="separator"
      aria-hidden="true"
      className={`block h-7 w-full ${className}`}
      // Sin viewBox: las coordenadas en % no deforman el texto
    >
      <line x1="0" x2="100%" y1="20" y2="20" stroke={color} strokeOpacity={0.25} strokeWidth={1} />
      {Array.from({ length: 41 }, (_, i) => {
        const x = `${(i / 40) * 100}%`
        const major = i % 4 === 0
        return (
          <line
            key={i}
            x1={x}
            x2={x}
            y1={major ? 12 : 16}
            y2={24}
            stroke={color}
            strokeOpacity={major ? 0.45 : 0.22}
            strokeWidth={major ? 1.5 : 1}
          />
        )
      })}
      {YARD_NUMBERS.map((n, i) => (
        <text
          key={i}
          x={`${((i + 1) / 10) * 100}%`}
          y="9"
          textAnchor="middle"
          fontSize="9"
          fontWeight={700}
          letterSpacing="0.08em"
          fill={color}
          fillOpacity={n === 50 ? 0.7 : 0.4}
          fontFamily="'Barlow Condensed', 'Arial Narrow', sans-serif"
        >
          {n}
        </text>
      ))}
    </svg>
  )
}

/* ───── Escuadra de gol de campo ───── */
export function Goalpost({ size = 28, color = COLORS.unamGold, className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d="M6 3v13h20V3" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 16v13" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M11 29h10" stroke={color} strokeWidth={2.2} strokeLinecap="round" opacity={0.6} />
    </svg>
  )
}

/* ───── Balón estilizado (carga y estados activos) ───── */
export function Football({
  size = 20,
  color = COLORS.legacyBlue,
  laces = COLORS.white,
  spinning = false,
  className = '',
}: {
  size?: number
  color?: string
  laces?: string
  spinning?: boolean
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={`${spinning ? 'animate-ball-spin' : ''} ${className}`}
    >
      <g transform="rotate(-40 16 16)">
        <ellipse cx="16" cy="16" rx="14" ry="8.5" fill={color} />
        <path d="M4.5 13.2c1.2-.6 1.2 6.2 0 5.6M27.5 13.2c-1.2-.6-1.2 6.2 0 5.6" stroke={laces} strokeWidth={1.1} fill="none" opacity={0.7} />
        <path d="M10.5 16h11" stroke={laces} strokeWidth={1.4} strokeLinecap="round" />
        {[12.5, 14.8, 17.2, 19.5].map((x) => (
          <path key={x} d={`M${x} 14.4v3.2`} stroke={laces} strokeWidth={1.2} strokeLinecap="round" />
        ))}
      </g>
    </svg>
  )
}

/** Indicador de carga con balón girando */
export function FootballLoader({ label = 'Cargando…', color = COLORS.nflBlue }: { label?: string; color?: string }) {
  return (
    <div role="status" className="flex items-center gap-2 text-sm text-ink-muted">
      <Football size={22} color={color} spinning />
      <span>{label}</span>
    </div>
  )
}

/* ───── Cadenas de primer down como barra de progreso ───── */
export function FirstDownChains({
  value,
  max = 1,
  label,
  display,
  color = COLORS.impactBlue,
  marker = COLORS.unamGold,
}: {
  value: number | null
  max?: number
  label: string
  display?: string
  color?: string
  marker?: string
}) {
  const ratio = value === null ? 0 : Math.max(0, Math.min(1, value / max))
  const pct = `${(ratio * 100).toFixed(1)}%`
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{label}</span>
        <span className="font-display text-lg font-bold leading-none text-legacy-blue">{display ?? '–'}</span>
      </div>
      <div
        className="relative h-5 w-full"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
      >
        {/* postes y cadena */}
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <line x1="2" x2="99.5%" y1="10" y2="10" stroke={COLORS.line} strokeWidth={4} strokeDasharray="5 3" />
          <line x1="1" x2="1" y1="1" y2="19" stroke={COLORS.legacyBlue} strokeWidth={2} strokeLinecap="round" />
          <line x1="99.6%" x2="99.6%" y1="1" y2="19" stroke={COLORS.legacyBlue} strokeWidth={2} strokeLinecap="round" />
        </svg>
        {/* avance */}
        <div
          className="absolute left-[2px] top-[7px] h-1.5 rounded-full transition-all duration-700 ease-out"
          style={{ width: `calc(${pct} - 2px)`, background: color }}
        />
        {/* marcador de down */}
        <div
          className="absolute top-0.5 h-4 w-2 -translate-x-1/2 rounded-sm border border-legacy-blue transition-all duration-700 ease-out"
          style={{ left: pct, background: marker }}
        />
      </div>
    </div>
  )
}

/** Etiqueta "1ST & 10" para encabezados de bloques con cadenas */
export function DownTag({ text = '1ST & 10' }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-legacy-blue px-1.5 py-0.5 font-display text-[11px] font-bold tracking-wider text-nfl-white">
      <span className="h-1.5 w-1.5 rounded-full bg-unam-gold" />
      {text}
    </span>
  )
}

/* ───── Franja de campo con marcadores (dónde ocurre la acción) ───── */
export interface FieldMarker {
  key: string
  /** yardas desde la propia zona de anotación (0-100) */
  yardline: number
  /** 0-1, posición vertical relativa */
  lane: number
  /** yardas ganadas (dibuja la trayectoria hasta el final de la jugada) */
  gain?: number
  color: string
  title: string
}

export function FieldStrip({ markers, accent = COLORS.impactBlue }: { markers: FieldMarker[]; accent?: string }) {
  return (
    <svg viewBox="0 0 120 32" className="block h-auto w-full rounded-md" role="img" aria-label="Posición de las jugadas en el campo">
      <rect x="0" y="0" width="120" height="32" fill="#EAF4EC" />
      <rect x="0" y="0" width="10" height="32" fill={COLORS.nflBlue} opacity={0.14} />
      <rect x="110" y="0" width="10" height="32" fill={accent} opacity={0.18} />
      {Array.from({ length: 11 }, (_, i) => (
        <line key={i} x1={10 + i * 10} x2={10 + i * 10} y1="0" y2="32" stroke="#FFFFFF" strokeWidth={0.5} />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <text key={i} x={20 + i * 10} y="30" textAnchor="middle" fontSize="3" fill={COLORS.legacyBlue} opacity={0.45} fontWeight={700}>
          {[10, 20, 30, 40, 50, 40, 30, 20, 10][i]}
        </text>
      ))}
      <text x="5" y="17" textAnchor="middle" fontSize="2.6" fill={COLORS.nflBlue} transform="rotate(-90 5 16)" fontWeight={700}>
        PROPIA
      </text>
      <text x="115" y="17" textAnchor="middle" fontSize="2.6" fill={COLORS.nflBlue} transform="rotate(90 115 16)" fontWeight={700}>
        RIVAL
      </text>
      {markers.map((m) => {
        const x = 10 + Math.max(0, Math.min(100, m.yardline))
        const y = 3 + m.lane * 22
        const end = m.gain === undefined ? x : Math.max(0, Math.min(120, x + m.gain))
        return (
          <g key={m.key}>
            <title>{m.title}</title>
            {end !== x && <line x1={x} x2={end} y1={y} y2={y} stroke={m.color} strokeWidth={0.6} strokeOpacity={0.55} strokeLinecap="round" />}
            {end !== x && <path d={`M${end} ${y - 0.9} L${end + (end > x ? 1.2 : -1.2)} ${y} L${end} ${y + 0.9} Z`} fill={m.color} fillOpacity={0.75} />}
            <circle cx={x} cy={y} r={1.3} fill={m.color} stroke="#FFFFFF" strokeWidth={0.35} />
          </g>
        )
      })}
    </svg>
  )
}
