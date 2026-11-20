import { COLORS } from '../theme'
import type { KpiItem, MatchupCrossData, PlayTrackingPlaceholder } from '../types/nfl'
import { ColumnChart } from '../components/charts'
import { Badge, Card, DataTable, Insight, KpiRow, SectionLabel } from '../components/ui'

function Heatmap({ data }: { data: MatchupCrossData['formationVsCoverage'] }) {
  const formations = [...new Set(data.map((d) => d.formation))]
  const coverages = [...new Set(data.map((d) => d.coverage))]
  const vals = data.filter((d) => d.plays > 0).map((d) => d.yardsPerPlay)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  return (
    <div className="overflow-x-auto">
      <div className="grid gap-1.5 text-center text-xs" style={{ gridTemplateColumns: `110px repeat(${coverages.length}, minmax(70px, 1fr))` }}>
        <span className="text-left text-[10px] uppercase tracking-wider text-[var(--muted)]">Formación ↓ / Cobertura →</span>
        {coverages.map((c) => (
          <span key={c} className="self-end text-[10px] font-semibold uppercase tracking-wider text-nfl-red">
            {c}
          </span>
        ))}
        {formations.map((f) => (
          <div key={f} className="contents">
            <span className="self-center text-left font-semibold text-impact-blue">{f}</span>
            {coverages.map((c) => {
              const cell = data.find((d) => d.formation === f && d.coverage === c)
              if (!cell || cell.plays === 0)
                return (
                  <div key={c} className="rounded border border-dashed border-nfl-blue/60 py-2 text-[var(--muted)]">
                    –
                  </div>
                )
              const t = (cell.yardsPerPlay - min) / (max - min || 1)
              return (
                <div
                  key={c}
                  className="rounded border border-nfl-blue/60 py-2"
                  style={{ background: `rgba(213,159,15,${(0.12 + t * 0.6).toFixed(2)})` }}
                  title={`${cell.plays} jugadas`}
                >
                  <p className="font-display text-xl font-bold leading-none">{cell.yardsPerPlay.toFixed(1)}</p>
                  <p className="text-[10px] text-nfl-white/80">{cell.plays} jug.</p>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-[var(--muted)]">Yardas por jugada de la ofensiva. Más dorado = mejor para el ataque.</p>
    </div>
  )
}

function Reconstructor({ tracking }: { tracking: PlayTrackingPlaceholder }) {
  return (
    <section className="rounded-lg border-2 border-dashed border-unam-gold/70 bg-legacy-blue/80 p-4 shadow-glow">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl font-bold uppercase tracking-wide text-unam-gold">Reconstructor 2D de jugadas</h3>
        <Badge>Próximo paso · {tracking.status === 'pending' ? 'pendiente' : 'listo'}</Badge>
      </header>
      <div className="yard-lines relative flex aspect-[2.2/1] w-full items-center justify-center overflow-hidden rounded border border-unam-blue bg-gradient-to-b from-unam-blue-alt/40 to-gridiron-black">
        <svg viewBox="0 0 120 53.3" className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none">
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={10 + i * 10} x2={10 + i * 10} y1={0} y2={53.3} stroke="#fff" strokeWidth={0.2} />
          ))}
          <rect x={0} y={0} width={10} height={53.3} fill={COLORS.unityRed} opacity={0.4} />
          <rect x={110} y={0} width={10} height={53.3} fill={COLORS.impactBlue} opacity={0.4} />
        </svg>
        <div className="relative text-center">
          <p className="font-display text-2xl font-bold uppercase text-nfl-white">Campo 2D · tracking 10 Hz</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-nfl-white/70">{tracking.note}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Jugada de ejemplo <span className="text-nfl-white">#{tracking.playId}</span>: {tracking.description} ({tracking.frames.length} frames de muestra)
      </p>
    </section>
  )
}

export default function MatchupsView({
  data,
  kpis,
  tracking,
}: {
  data: MatchupCrossData
  kpis: KpiItem[]
  tracking: PlayTrackingPlaceholder
}) {
  return (
    <div className="space-y-4">
      <KpiRow items={kpis} accent="gold" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Formación ofensiva vs. cobertura" subtitle="Dónde gana el ataque según el esquema rival" accent="gold" badge="Cruce 1">
          <Heatmap data={data.formationVsCoverage} />
        </Card>

        <Card title="Protección vs. pass rush" subtitle="Presión y sack según rushers enviados" accent="gold" badge="Cruce 2">
          <ColumnChart
            data={data.protectionVsRush.map((x) => ({ ...x, rushers: `${x.rushers} rushers` }))}
            xKey="rushers"
            series={[
              { key: 'pressurePct', name: '% presión', color: COLORS.nflRed },
              { key: 'sackPct', name: '% sack', color: COLORS.unamGold },
              { key: 'yardsPerPlay', name: 'Yd/jugada ofensiva', color: COLORS.impactBlue },
            ]}
            height={220}
          />
          <DataTable
            rows={data.protectionVsRush}
            columns={[
              { header: 'Rushers', render: (x) => x.rushers },
              { header: 'Jug.', align: 'right', render: (x) => x.plays },
              { header: 'Presión', align: 'right', render: (x) => `${x.pressurePct}%` },
              { header: 'Sack', align: 'right', render: (x) => `${x.sackPct}%` },
              { header: 'Yd/jug', align: 'right', render: (x) => x.yardsPerPlay.toFixed(1) },
            ]}
          />
        </Card>

        <Card title="Play action vs. caja" subtitle="Yardas por jugada según defensores en la caja" accent="gold" badge="Cruce 3">
          <ColumnChart
            data={data.playActionVsBox}
            xKey="box"
            series={[
              { key: 'paYards', name: 'Con play action', color: COLORS.impactBlue },
              { key: 'noPaYards', name: 'Sin play action', color: COLORS.unamBlue },
            ]}
            height={220}
          />
        </Card>

        <Card title="Castigos vs. cobertura" subtitle="Interferencias y holding según el esquema" accent="alert" badge="Cruce 4">
          <ColumnChart
            data={data.penaltiesVsCoverage}
            xKey="coverage"
            series={[
              { key: 'dpiPct', name: '% DPI', color: COLORS.nflRed },
              { key: 'holdingPct', name: '% holding', color: COLORS.legacyRed },
            ]}
            height={220}
          />
        </Card>

        <Card title="Impacto de la presión" subtitle="Ofensiva con y sin presión" accent="gold" badge="Cruce 5">
          <ColumnChart
            data={data.pressureImpact}
            xKey="label"
            series={[
              { key: 'offenseYpp', name: 'Yd/jugada', color: COLORS.impactBlue },
              { key: 'completionPct', name: '% completos', color: COLORS.unamBlue },
              { key: 'sackPct', name: '% sack', color: COLORS.nflRed },
            ]}
            height={200}
          />
        </Card>

        <Card title="Lecturas clave" subtitle="Hallazgos del cruce" accent="gold">
          <SectionLabel>Resumen</SectionLabel>
          <ul className="space-y-2">
            {data.insights.map((t) => (
              <li key={t}>
                <Insight>{t}</Insight>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Reconstructor tracking={tracking} />
    </div>
  )
}
