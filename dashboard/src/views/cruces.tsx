/** Ventana CRUCES (Ofensiva vs. Defensiva) · identidad Oro UNAM + Azul UNAM */
import { ColumnChart, ScatterPlot } from '../components/charts'
import { FootballLoader, Goalpost } from '../components/NflMotifs'
import { Badge, EmptyState, ErrorState, Insight, KpiStrip, MetricList, SectionLabel, SourceNote, WideCard, WindowHeader } from '../components/ui'
import { useAsync } from '../hooks/useAsync'
import { crossMatrix, ruleRows } from '../lib/derive'
import { fmt, FORMATION_LABEL, PASS_RESULT_LABEL, TAG_LABEL } from '../lib/format'
import { describeError, fetchPlayTracking } from '../services/api'
import { COLORS } from '../theme'
import type { FeaturedPlay, TrackingEntity } from '../types/nfl'
import { pctFormat, shortCluster } from './common'
import type { ViewProps } from './common'

const GOLD = COLORS.unamGold
const UNAM = COLORS.unamBlue

function Heatmap({ plays }: { plays: FeaturedPlay[] }) {
  const { rows, cols, cells } = crossMatrix(plays)
  const values = cells.filter((c) => c.n > 0).map((c) => c.yds ?? 0)
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (!plays.length) return <EmptyState title="Sin jugadas para estos filtros" />
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[560px] gap-1.5 text-center text-xs" style={{ gridTemplateColumns: `120px repeat(${cols.length}, minmax(70px, 1fr))` }}>
        <span className="self-end text-left text-[10px] font-bold uppercase tracking-wider text-ink-muted">Formación ↓ · Cobertura →</span>
        {cols.map((c) => (
          <span key={c} className="self-end text-[11px] font-bold uppercase tracking-wider text-nfl-red">
            {c}
          </span>
        ))}
        {rows.map((r) => (
          <div key={r} className="contents">
            <span className="self-center text-left text-sm font-bold text-impact-blue">{FORMATION_LABEL[r] ?? r}</span>
            {cols.map((c) => {
              const cell = cells.find((x) => x.row === r && x.col === c)
              if (!cell || cell.n === 0)
                return (
                  <div key={c} className="rounded-md border border-dashed border-field-line py-3 text-ink-muted">
                    –
                  </div>
                )
              const t = ((cell.yds ?? 0) - min) / (max - min || 1)
              return (
                <div
                  key={c}
                  title={`${cell.n} jugadas · ${fmt.num(cell.yds)} yd`}
                  className="rounded-md border border-unam-gold/40 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-gold"
                  style={{ background: `rgba(213,159,15,${(0.1 + t * 0.65).toFixed(2)})` }}
                >
                  <p className="font-display text-xl font-bold leading-none text-legacy-blue">{fmt.num(cell.yds)}</p>
                  <p className="text-[10px] text-legacy-blue/70">{cell.n} jug.</p>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────── Reconstructor 2D (contenedor reservado) ───────────── */

function SnapPreview({ entities, possession }: { entities: TrackingEntity[]; possession: string }) {
  return (
    <svg viewBox="0 0 120 53.3" className="h-full w-full" role="img" aria-label="Posiciones al snap">
      {entities.map((e, i) => {
        const ball = e.nflId === null
        const offense = e.team === possession
        return (
          <circle
            key={`${e.nflId ?? 'ball'}-${i}`}
            cx={e.x}
            cy={53.3 - e.y}
            r={ball ? 0.7 : 1.1}
            fill={ball ? '#7A4A1E' : offense ? COLORS.impactBlue : COLORS.nflRed}
            stroke={COLORS.white}
            strokeWidth={0.25}
          >
            <title>{ball ? 'Balón' : `${e.displayName} (#${e.jerseyNumber ?? '–'}) · ${e.pff_role ?? ''}`}</title>
          </circle>
        )
      })}
    </svg>
  )
}

function Reconstructor({ play, plays, onSelect }: { play: FeaturedPlay | null; plays: FeaturedPlay[]; onSelect: (p: FeaturedPlay) => void }) {
  const key = play ? `${play.gameId}-${play.playId}` : 'none'
  const tracking = useAsync(() => fetchPlayTracking(play!.gameId, play!.playId), key, Boolean(play))
  const snap = tracking.data?.frames.find((f) => f.frameId === play?.snap_frame) ?? tracking.data?.frames[0]
  const events = tracking.data?.frames.filter((f) => f.event).map((f) => `${f.event} (${f.frameId})`) ?? []
  // La jugada puede venir del Copiloto aunque no esté en la selección filtrada
  const options = play && !plays.some((p) => p.gameId === play.gameId && p.playId === play.playId) ? [play, ...plays] : plays
  return (
    <section id="reconstructor" className="scroll-mt-40 rounded-2xl border-2 border-dashed border-unam-gold bg-nfl-white p-5 shadow-gold">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Goalpost size={30} />
          <div>
            <h3 className="font-display text-2xl font-bold uppercase leading-none tracking-wide text-unam-blue">Reconstructor 2D de jugadas</h3>
            <p className="text-xs text-ink-muted">GET api/plays/{'{gameId}'}/{'{playId}'}/tracking · contenedor reservado para la siguiente fase</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge>Próximo paso</Badge>
          <select
            aria-label="Jugada a reconstruir"
            value={play ? `${play.gameId}-${play.playId}` : ''}
            onChange={(e) => {
              const p = options.find((x) => `${x.gameId}-${x.playId}` === e.target.value)
              if (p) onSelect(p)
            }}
            className="h-9 max-w-[320px] rounded-lg border border-field-line bg-nfl-white px-2 text-sm text-legacy-blue focus:border-unam-gold focus:outline-none"
          >
            {!play && <option value="">Elige una jugada…</option>}
            {options.map((p) => (
              <option key={`${p.gameId}-${p.playId}`} value={`${p.gameId}-${p.playId}`}>
                S{p.week} {p.possessionTeam} vs {p.defensiveTeam} · {PASS_RESULT_LABEL[p.passResult]} {p.playResult} yd
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(260px,1fr)]">
        <div className="relative aspect-[120/53.3] w-full overflow-hidden rounded-xl border border-unam-blue/30 bg-[#EAF4EC]">
          <svg viewBox="0 0 120 53.3" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
            <rect x="0" y="0" width="10" height="53.3" fill={COLORS.nflBlue} opacity={0.12} />
            <rect x="110" y="0" width="10" height="53.3" fill={GOLD} opacity={0.2} />
            {Array.from({ length: 11 }, (_, i) => (
              <line key={i} x1={10 + i * 10} x2={10 + i * 10} y1="0" y2="53.3" stroke="#FFFFFF" strokeWidth={0.35} />
            ))}
          </svg>
          {play && snap ? (
            <div className="absolute inset-0 animate-fade-up">
              <SnapPreview entities={snap.entities} possession={play.possessionTeam} />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {tracking.loading ? (
                <FootballLoader label="Cargando tracking…" />
              ) : tracking.error ? (
                <ErrorState {...describeError(tracking.error)} onRetry={tracking.reload} />
              ) : (
                <p className="font-display text-xl font-bold uppercase text-unam-blue/60">Selecciona una jugada</p>
              )}
            </div>
          )}
          <span className="absolute bottom-2 left-2 rounded bg-nfl-white/85 px-2 py-0.5 text-[10px] font-semibold text-legacy-blue">
            Vista previa estática del snap · ataque →
          </span>
        </div>

        <aside className="rounded-xl bg-field-mist p-4">
          {play ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                S{play.week} · Q{play.quarter} · {play.down}.º y {play.yardsToGo}
              </p>
              <p className="mt-1 text-sm leading-snug text-legacy-blue">{play.playDescription}</p>
              <div className="mt-3">
                <MetricList
                  items={[
                    { label: 'Separación', value: play.sep_target_arrival_yd === null ? '–' : `${play.sep_target_arrival_yd.toFixed(2)} yd`, hint: play.target_name ?? undefined },
                    { label: 'SOE', value: fmt.signed(play.SOE, 2), hint: 'yd sobre lo esperado' },
                    { label: 'Quiebre', value: play.hip_flip_deg === null ? '–' : `${play.hip_flip_deg.toFixed(0)}°`, hint: play.cov_def_name ?? undefined },
                    { label: 'T. lanzar', value: play.time_to_throw_s === null ? '–' : `${play.time_to_throw_s.toFixed(1)} s` },
                  ]}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                <Badge tone="neutral">{shortCluster(play.cluster_label)}</Badge>
                {play.tags.map((t) => (
                  <Badge key={t}>{TAG_LABEL[t]}</Badge>
                ))}
              </div>
              {tracking.data && (
                <p className="mt-3 text-[11px] text-ink-muted">
                  {tracking.data.frames.length} frames · {snap?.entities.length ?? 0} entidades · eventos: {events.join(', ') || '–'}
                </p>
              )}
            </>
          ) : (
            <EmptyState title="Sin jugada seleccionada" detail="Usa «Ver 2D» en cualquier tabla o la recomendación del Copiloto." />
          )}
        </aside>
      </div>
    </section>
  )
}

/* ───────────── Ventana ───────────── */

export function CrucesView({
  overview,
  research,
  plays,
  selectedPlay,
  onSelectPlay,
}: ViewProps & { selectedPlay: FeaturedPlay | null; onSelectPlay: (p: FeaturedPlay) => void }) {
  const pa = overview.reglas_play_action['1']
  const noPa = overview.reglas_play_action['0']
  const longPocket = overview.reglas_tiempo_bolsa['>4']
  const cover0 = overview.reglas_cobertura['Cover-0']
  const formations = ruleRows(overview.reglas_formacion, FORMATION_LABEL)
  const coverages = ruleRows(overview.reglas_cobertura)
  const bestFormation = [...formations].sort((a, b) => b.yds - a.yds)[0]
  // Red Zone es situacional (campo corto): no compite con los esquemas de campo abierto
  const bestCoverage = coverages.filter((c) => c.key !== 'Red Zone').sort((a, b) => a.yds - b.yds)[0]
  const clusters = research.clusters.clusters.map((c) => ({
    label: shortCluster(c.etiqueta),
    rush: c.centroide_real.n_pass_rush,
    presion: c.centroide_real.presion * 100,
    sack: c.tasa_sack * 100,
    yds: c.centroide_real.playResult,
    n: c.n,
  }))
  const paRows = [
    { label: 'Presión %', con: pa.presion * 100, sin: noPa.presion * 100 },
    { label: 'Explosivas %', con: pa.explosiva * 100, sin: noPa.explosiva * 100 },
    { label: 'Trampa %', con: pa.trampa * 100, sin: noPa.trampa * 100 },
  ]
  const trapByCoverage = coverages
    .map((c) => ({
      label: c.label,
      presion: c.presion * 100,
      trampa: (research.trampa_presion.por_cobertura[c.key]?.tasa_sobre_presion ?? 0) * 100,
      n: c.n,
    }))
    .filter((c) => c.trampa > 0)

  return (
    <>
      <WindowHeader
        accent="gold"
        eyebrow="Cruces · Ofensiva vs. Defensiva"
        title="Duelo táctico"
        goalpost
        description="Formaciones contra coberturas, protección contra pass rush y el efecto del play action."
      />
      <KpiStrip
        accent="gold"
        caption="Temporada completa · api/overview"
        items={[
          { label: 'Play action', value: fmt.signed(pa.yds - noPa.yds), hint: 'yd por jugada vs. sin PA' },
          { label: 'Presión con 4+ s', value: fmt.rate(longPocket?.presion ?? null, 0), hint: 'de las jugadas' },
          { label: 'Presión vs. Cover-0', value: fmt.rate(cover0?.presion ?? null, 0), hint: `${fmt.num(cover0?.yds ?? null)} yd permitidas` },
          { label: 'Trampa de presión', value: fmt.rate(overview.kpis.tasa_trampa_presion), hint: 'de todas las jugadas' },
        ]}
      />
      <div className="stagger space-y-5">
        <WideCard
          accent="gold"
          title="Formación × cobertura"
          subtitle="api/plays · yardas por jugada de la selección filtrada (más oro = mejor para el ataque)"
          aside={
            <>
              <SectionLabel>Referencia de temporada</SectionLabel>
              <MetricList
                items={[
                  { label: 'Formación top', value: bestFormation?.label ?? '–', hint: bestFormation ? `${bestFormation.yds.toFixed(2)} yd` : undefined },
                  { label: 'Cobertura top', value: bestCoverage?.label ?? '–', hint: bestCoverage ? `${bestCoverage.yds.toFixed(2)} yd permitidas (sin Red Zone)` : undefined },
                ]}
              />
              <Insight accent="gold">Usa los filtros de equipo o cobertura para ver cómo cambia el duelo en la selección.</Insight>
            </>
          }
        >
          <Heatmap plays={plays} />
        </WideCard>

        <WideCard
          accent="gold"
          title="Protección vs. pass rush"
          subtitle="api/research-insights · rushers enviados y presión por arquetipo (tamaño = jugadas)"
          aside={
            <ul className="space-y-2">
              {clusters.map((c) => (
                <li key={c.label} className="flex items-center justify-between rounded-lg border border-field-line bg-nfl-white px-3 py-2 text-sm">
                  <span className="font-semibold text-legacy-blue">{c.label}</span>
                  <span className="text-xs text-ink-muted">
                    sacks {c.sack.toFixed(1)}% · {c.yds.toFixed(1)} yd
                  </span>
                </li>
              ))}
            </ul>
          }
        >
          <ScatterPlot
            data={clusters}
            labelKey="label"
            x={{ key: 'rush', name: 'Rushers (prom.)', format: (v) => v.toFixed(1) }}
            y={{ key: 'presion', name: 'Presión %', format: pctFormat }}
            size={{ key: 'n', name: 'Jugadas' }}
            color={GOLD}
            colorFn={(r) => (r.presion > 50 ? COLORS.nflRed : UNAM)}
            height={260}
          />
        </WideCard>

        <WideCard
          accent="gold"
          title="Play action vs. presión"
          subtitle="api/overview · reglas_play_action"
          aside={
            <Insight accent="gold">
              El play action casi no cambia la presión ({fmt.rate(pa.presion, 0)} vs. {fmt.rate(noPa.presion, 0)}) y aun así eleva las explosivas de{' '}
              {fmt.rate(noPa.explosiva, 0)} a {fmt.rate(pa.explosiva, 0)}.
            </Insight>
          }
        >
          <ColumnChart
            data={paRows}
            xKey="label"
            accent={GOLD}
            series={[
              { key: 'con', name: 'Con play action', color: GOLD, format: pctFormat },
              { key: 'sin', name: 'Sin play action', color: UNAM, format: pctFormat },
            ]}
            yFormat={pctFormat}
            height={240}
          />
        </WideCard>

        <WideCard
          accent="gold"
          title="Esquema vs. Trampa de Presión"
          subtitle="Presión que genera cada esquema y % de esa presión que termina en trampa"
          aside={<SourceNote>Presión: api/overview · reglas_cobertura. Trampa: api/research-insights · trampa_presion.por_cobertura.</SourceNote>}
        >
          <ColumnChart
            data={trapByCoverage}
            xKey="label"
            accent={GOLD}
            series={[
              { key: 'presion', name: 'Presión %', color: COLORS.nflRed, format: pctFormat },
              { key: 'trampa', name: 'Trampa sobre presión %', color: GOLD, format: pctFormat },
            ]}
            yFormat={pctFormat}
            height={260}
            extra={(r) => `${fmt.int(r.n as number)} jugadas`}
          />
        </WideCard>

        <Reconstructor play={selectedPlay} plays={plays} onSelect={onSelectPlay} />
      </div>
    </>
  )
}
