import { useState } from 'react'
import { ACCENT_HEX, COLORS } from '../../theme'
import type { Accent } from '../../theme'
import type {
  FieldZoneRow,
  PassMapCell,
  PenaltySection,
  PlayMixRow,
  PlayerClassification,
} from '../../types/nfl'
import { HBarChart, ColumnChart } from '../charts'
import { Badge, CoachOnly, DataTable, Insight, SectionLabel } from '../ui'

const pct = (v: number | undefined) => (v === undefined ? '–' : `${v.toFixed(0)}%`)

/* ───── Mezcla de jugadas: barras de yardas + tabla ───── */
export function PlayMixBlock({
  title,
  rows,
  accent,
  showCompletion = true,
}: {
  title: string
  rows: PlayMixRow[]
  accent: Accent
  showCompletion?: boolean
}) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <HBarChart
        data={rows}
        labelKey="label"
        valueKey="yardsPerPlay"
        name="Yardas por jugada"
        color={ACCENT_HEX[accent]}
        height={Math.max(90, rows.length * 30 + 20)}
        labelWidth={120}
      />
      <CoachOnly>
        <DataTable
          rows={rows}
          columns={[
            { header: 'Tipo', render: (r) => r.label },
            { header: 'Jugadas', align: 'right', render: (r) => r.plays },
            { header: 'Yd/jug', align: 'right', render: (r) => r.yardsPerPlay.toFixed(1) },
            ...(showCompletion ? [{ header: 'Comp.', align: 'right' as const, render: (r: PlayMixRow) => pct(r.completionPct) }] : []),
            { header: 'Éxito', align: 'right', render: (r) => pct(r.successRate) },
          ]}
        />
      </CoachOnly>
    </div>
  )
}

/* ───── Zonas del campo ───── */
export function FieldZonesBlock({ rows, accent, metricLabel }: { rows: FieldZoneRow[]; accent: Accent; metricLabel: string }) {
  return (
    <div>
      <SectionLabel>Zona del campo · {metricLabel}</SectionLabel>
      <div className="yard-lines rounded">
        <HBarChart
          data={rows}
          labelKey="zone"
          valueKey="yardsPerPlay"
          name={metricLabel}
          color={ACCENT_HEX[accent]}
          colorFn={(r) => (r.yardsPerPlay < 5 ? COLORS.unityRed : ACCENT_HEX[accent])}
          height={230}
          labelWidth={130}
        />
      </div>
    </div>
  )
}

/* ───── Mapa de pases profundidad x dirección ───── */
const DIR_LABEL = { left: 'Izquierda', middle: 'Centro', right: 'Derecha' } as const
export function PassMapBlock({ cells, accent }: { cells: PassMapCell[]; accent: Accent }) {
  const maxY = Math.max(...cells.map((c) => c.yardsPerAttempt))
  const hex = ACCENT_HEX[accent]
  const rowOf = (depth: 'deep' | 'short') => (['left', 'middle', 'right'] as const).map((d) => cells.find((c) => c.depth === depth && c.direction === d))
  return (
    <div>
      <SectionLabel>Mapa de pases (intensidad = yardas por intento)</SectionLabel>
      <div className="grid grid-cols-[auto_repeat(3,1fr)] gap-1.5 text-center text-xs">
        <span />
        {(['left', 'middle', 'right'] as const).map((d) => (
          <span key={d} className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
            {DIR_LABEL[d]}
          </span>
        ))}
        {(['deep', 'short'] as const).map((depth) => (
          <div key={depth} className="contents">
            <span className="self-center text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] [writing-mode:vertical-rl] rotate-180">
              {depth === 'deep' ? 'Profundo' : 'Corto'}
            </span>
            {rowOf(depth).map((c, i) =>
              c ? (
                <div
                  key={i}
                  className="rounded border border-nfl-blue/60 p-2"
                  style={{ background: `${hex}${Math.round(25 + (c.yardsPerAttempt / maxY) * 120).toString(16).padStart(2, '0')}` }}
                >
                  <p className="font-display text-xl font-bold leading-none">{c.completionPct.toFixed(0)}%</p>
                  <p className="text-[10px] text-nfl-white/80">
                    {c.attempts} int · {c.yardsPerAttempt.toFixed(1)} yd
                  </p>
                  {c.interceptions > 0 && <p className="text-[10px] font-semibold text-unam-gold-bright">{c.interceptions} INT</p>}
                </div>
              ) : (
                <div key={i} />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───── Clasificación de jugadores ───── */
export function PlayerClassificationBlock({ data, accent }: { data: PlayerClassification; accent: Accent }) {
  const [active, setActive] = useState(0)
  const group = data.groups[active]
  const hex = ACCENT_HEX[accent]
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {data.groups.map((g, i) => (
          <button
            key={g.id}
            onClick={() => setActive(i)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              i === active
                ? 'border-unam-gold bg-unam-gold/15 text-unam-gold'
                : 'border-nfl-blue text-[var(--muted)] hover:border-unam-blue hover:text-nfl-white'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <p className="mb-2 text-xs text-[var(--muted)]">
        Métrica: <span className="font-semibold text-nfl-white">{group.metricLabel}</span>{' '}
        ({group.metricHigherIsBetter ? 'más alto es mejor' : 'más bajo es mejor'}) · n = {group.sampleSize} · mín. {group.minSnaps} snaps
      </p>

      <SectionLabel>Jugadores destacados en este partido</SectionLabel>
      <DataTable
        rows={group.topPlayers}
        columns={[
          { header: 'Jugador', render: (p) => <span className="font-semibold">{p.name}</span> },
          { header: 'Eq.', render: (p) => <Badge tone="blue">{p.team}</Badge> },
          { header: 'Pos', render: (p) => p.position },
          { header: group.metricLabel, align: 'right', render: (p) => <span className="font-semibold text-unam-gold-bright">{p.performance.toFixed(1)}</span> },
          { header: 'Est.', align: 'right', render: (p) => `${p.heightIn}"` },
          { header: 'Peso', align: 'right', render: (p) => `${p.weightLb}` },
          { header: 'Vel.', align: 'right', render: (p) => p.topSpeedYds.toFixed(1) },
        ]}
      />

      <SectionLabel>Correlación de Spearman con el rendimiento (dorado = p &lt; 0.05)</SectionLabel>
      <HBarChart
        data={group.correlations}
        labelKey="feature"
        valueKey="rho"
        name="ρ"
        color={hex}
        colorFn={(c) => (c.pValue < 0.05 ? COLORS.unamGold : hex)}
        height={Math.max(120, group.correlations.length * 30 + 20)}
        labelWidth={130}
      />

      <CoachOnly>
        <SectionLabel>Perfil: 25% mejor vs. 25% peor</SectionLabel>
        <DataTable
          rows={group.profile}
          columns={[
            { header: 'Atributo', render: (r) => r.feature },
            { header: 'Mejor 25%', align: 'right', render: (r) => <span className="text-emerald-400">{r.top25}</span> },
            { header: 'Peor 25%', align: 'right', render: (r) => <span className="text-nfl-red">{r.bottom25}</span> },
          ]}
        />
        <SectionLabel>Estadística descriptiva del grupo</SectionLabel>
        <DataTable
          rows={group.descriptive}
          columns={[
            { header: 'Atributo', render: (r) => r.feature },
            { header: 'Media', align: 'right', render: (r) => r.mean },
            { header: 'Desv.', align: 'right', render: (r) => r.std },
            { header: 'Mín', align: 'right', render: (r) => r.min },
            { header: 'Máx', align: 'right', render: (r) => r.max },
          ]}
        />
        <p className="mt-2 text-[10px] text-[var(--muted)]">{data.caveat}</p>
      </CoachOnly>
      <Insight>{group.insight}</Insight>
    </div>
  )
}

/* ───── Castigos ───── */
export function PenaltiesBlock({ data }: { data: PenaltySection }) {
  return (
    <div>
      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        {[
          { l: 'Castigos', v: String(data.total) },
          { l: '% jugadas', v: `${data.ratePct.toFixed(1)}%` },
          { l: 'Yardas netas', v: `${data.netYards > 0 ? '+' : ''}${data.netYards}` },
        ].map((x) => (
          <div key={x.l} className="rounded border border-unity-red/60 bg-legacy-red/60 py-2">
            <p className="font-display text-2xl font-bold leading-none">{x.v}</p>
            <p className="text-[10px] uppercase tracking-wider text-nfl-white/70">{x.l}</p>
          </div>
        ))}
      </div>
      <DataTable
        rows={data.rows}
        columns={[
          { header: 'Falta', render: (r) => r.foul },
          { header: 'Cant.', align: 'right', render: (r) => r.count },
          { header: 'Yd prom.', align: 'right', render: (r) => r.avgYards.toFixed(1) },
          { header: 'Pos.', align: 'right', render: (r) => <Badge tone="red">{r.topPosition}</Badge> },
        ]}
      />
      <SectionLabel>Tasa de castigos por down (%)</SectionLabel>
      <ColumnChart
        data={data.byDown.map((d) => ({ down: `${d.down}.º`, ratePct: d.ratePct }))}
        xKey="down"
        series={[{ key: 'ratePct', name: '% jugadas', color: COLORS.unityRed }]}
        height={130}
      />
      <Insight>{data.note}</Insight>
    </div>
  )
}
