/** Bloques reutilizados por las ventanas de Ofensiva, Defensiva y Cruces */
import { useMemo, useState } from 'react'
import { ColumnChart, HBarChart } from '../components/charts'
import { FieldStrip } from '../components/NflMotifs'
import type { FieldMarker } from '../components/NflMotifs'
import { Badge, DataTable, EmptyState, Insight, KpiStrip, MetricList, Segmented, SectionLabel, SourceNote, WideCard } from '../components/ui'
import type { KpiItem } from '../components/ui'
import { groupPlays, parsePenalties, summarizePlays } from '../lib/derive'
import { fmt, PASS_RESULT_LABEL, TAG_LABEL } from '../lib/format'
import { teamInfo } from '../lib/nflTeams'
import { ACCENTS, COLORS } from '../theme'
import type { Accent } from '../theme'
import type {
  CoachFilters,
  FeaturedPlay,
  OverviewResponse,
  RankingRow,
  ResearchInsightsResponse,
  SeasonKpis,
} from '../types/nfl'

export interface ViewProps {
  overview: OverviewResponse
  research: ResearchInsightsResponse
  plays: FeaturedPlay[]
  allPlays: FeaturedPlay[]
  filters: CoachFilters
  loadingPlays: boolean
  onOpenPlay: (gameId: number, playId: number) => void
}

export const shortCluster = (label: string) => label.split(/ \(| \//)[0]
export const pctFormat = (v: number) => `${v.toFixed(0)}%`
export const ydFormat = (v: number) => `${v.toFixed(1)} yd`

/* ───────────── KPI de la selección vs. temporada ───────────── */

export function FilteredKpis({ side, plays, kpis }: { side: 'offense' | 'defense'; plays: FeaturedPlay[]; kpis: SeasonKpis }) {
  const s = summarizePlays(plays)
  const better = (value: number | null, base: number, higherIsBetter: boolean): KpiItem['tone'] =>
    value === null ? 'neutral' : value === base ? 'neutral' : value > base === higherIsBetter ? 'good' : 'bad'
  const items: KpiItem[] =
    side === 'offense'
      ? [
          { label: 'Jugadas', value: fmt.int(s.n), hint: 'destacadas en la selección' },
          { label: 'Yardas por jugada', value: fmt.num(s.yardsPerPlay), baseline: fmt.num(kpis.yardas_promedio), tone: better(s.yardsPerPlay, kpis.yardas_promedio, true) },
          { label: 'Completos', value: fmt.rate(s.completionPct, 0), baseline: fmt.rate(kpis.tasa_completo, 0), tone: better(s.completionPct, kpis.tasa_completo, true) },
          { label: 'Explosivas (15+)', value: fmt.rate(s.explosivePct, 0), baseline: fmt.rate(kpis.tasa_explosiva, 0), tone: better(s.explosivePct, kpis.tasa_explosiva, true) },
          { label: 'Presión sufrida', value: fmt.rate(s.pressurePct, 0), baseline: fmt.rate(kpis.tasa_presion, 0), tone: better(s.pressurePct, kpis.tasa_presion, false) },
          { label: 'Tiempo al lanzar', value: s.timeToThrow === null ? '–' : `${s.timeToThrow.toFixed(2)} s`, baseline: `${kpis.tiempo_lanzar_promedio_s.toFixed(2)} s` },
        ]
      : [
          { label: 'Jugadas', value: fmt.int(s.n), hint: 'destacadas en la selección' },
          { label: 'Yardas permitidas', value: fmt.num(s.yardsPerPlay), baseline: fmt.num(kpis.yardas_promedio), tone: better(s.yardsPerPlay, kpis.yardas_promedio, false) },
          { label: 'Presión generada', value: fmt.rate(s.pressurePct, 0), baseline: fmt.rate(kpis.tasa_presion, 0), tone: better(s.pressurePct, kpis.tasa_presion, true) },
          { label: 'Sacks', value: fmt.rate(s.sackPct, 0), baseline: fmt.rate(kpis.tasa_sack, 1), tone: better(s.sackPct, kpis.tasa_sack, true) },
          { label: 'Separación permitida', value: s.separation === null ? '–' : `${s.separation.toFixed(1)} yd`, baseline: `${kpis.sep_objetivo_promedio_yd.toFixed(1)} yd`, tone: better(s.separation, kpis.sep_objetivo_promedio_yd, false) },
          { label: 'Quiebre de cadera', value: s.hipFlip === null ? '–' : `${s.hipFlip.toFixed(0)}°`, baseline: `${kpis.hip_flip_promedio_deg.toFixed(0)}°` },
        ]
  return (
    <KpiStrip
      accent={side}
      items={items}
      caption={`Selección filtrada (jugadas destacadas) frente a la temporada completa (${fmt.int(kpis.jugadas)} jugadas)`}
    />
  )
}

/* ───────────── Tabla de jugadas ───────────── */

const RESULT_TONE: Record<string, 'blue' | 'neutral' | 'red' | 'gold'> = { C: 'blue', I: 'neutral', S: 'red', IN: 'red', R: 'gold' }

export function PlaysTable({ plays, onOpenPlay, maxHeight = '420px' }: { plays: FeaturedPlay[]; onOpenPlay: ViewProps['onOpenPlay']; maxHeight?: string }) {
  if (!plays.length) return <EmptyState title="Sin jugadas para estos filtros" detail="Prueba con otro partido, cuarto o cobertura." />
  return (
    <DataTable
      rows={plays}
      rowKey={(p) => `${p.gameId}-${p.playId}`}
      maxHeight={maxHeight}
      initialSort={{ key: 'yds', dir: 'desc' }}
      columns={[
        { key: 'sem', header: 'Sem.', render: (p) => `S${p.week} · Q${p.quarter}`, sortValue: (p) => p.week * 10 + p.quarter },
        { key: 'down', header: 'Down', render: (p) => `${p.down}.º y ${p.yardsToGo}`, sortValue: (p) => p.down },
        {
          key: 'match',
          header: 'Ataque vs. Def.',
          render: (p) => (
            <span className="font-semibold">
              <span className="text-impact-blue">{p.possessionTeam}</span> <span className="text-ink-muted">vs</span>{' '}
              <span className="text-nfl-red">{p.defensiveTeam}</span>
            </span>
          ),
          sortValue: (p) => p.possessionTeam,
        },
        { key: 'res', header: 'Resultado', render: (p) => <Badge tone={RESULT_TONE[p.passResult]}>{PASS_RESULT_LABEL[p.passResult]}</Badge>, sortValue: (p) => p.passResult },
        { key: 'yds', header: 'Yardas', align: 'right', render: (p) => <span className="font-semibold">{p.playResult}</span>, sortValue: (p) => p.playResult },
        { key: 'cov', header: 'Cobertura', render: (p) => p.pff_passCoverage ?? '–', sortValue: (p) => p.pff_passCoverage ?? '' },
        { key: 'pres', header: 'Presión', render: (p) => (p.presion ? <span className="font-semibold text-nfl-red">Sí</span> : 'No'), sortValue: (p) => p.presion },
        { key: 'soe', header: 'SOE', align: 'right', render: (p) => fmt.signed(p.SOE, 2), sortValue: (p) => p.SOE },
        { key: 'tags', header: 'Etiquetas', render: (p) => <span className="text-xs text-ink-muted">{p.tags.map((t) => TAG_LABEL[t]).join(', ')}</span> },
        {
          key: 'ver',
          header: '',
          render: (p) => (
            <button
              onClick={() => onOpenPlay(p.gameId, p.playId)}
              className="rounded-md border border-unam-gold px-2 py-0.5 text-xs font-semibold text-legacy-blue transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FBF3DD]"
              title={p.playDescription}
            >
              Ver 2D
            </button>
          ),
        },
      ]}
    />
  )
}

/* ───────────── Dónde ocurre la acción (franja de campo) ───────────── */

const RESULT_COLOR: Record<string, string> = {
  C: COLORS.impactBlue,
  I: '#8A9BB0',
  S: COLORS.nflRed,
  IN: COLORS.legacyRed,
  R: COLORS.unamGold,
}

export function FieldActionCard({ plays, side }: { plays: FeaturedPlay[]; side: 'offense' | 'defense' }) {
  const accent: Accent = side
  const markers: FieldMarker[] = plays.map((p, i) => ({
    key: `${p.gameId}-${p.playId}`,
    yardline: 100 - p.yds_to_endzone,
    lane: plays.length > 1 ? (i % 12) / 11 : 0.5,
    gain: p.playResult,
    color: side === 'offense' ? RESULT_COLOR[p.passResult] : p.presion ? COLORS.nflRed : COLORS.nflBlue,
    title: `${p.possessionTeam} vs ${p.defensiveTeam} · ${PASS_RESULT_LABEL[p.passResult]} · ${p.playResult} yd\n${p.playDescription}`,
  }))
  const zones = groupPlays(plays, (p) => p.zona_campo)
  const legend =
    side === 'offense'
      ? Object.entries(PASS_RESULT_LABEL).map(([k, v]) => ({ label: v, color: RESULT_COLOR[k] }))
      : [
          { label: 'Con presión', color: COLORS.nflRed },
          { label: 'Sin presión', color: COLORS.nflBlue },
        ]
  return (
    <WideCard
      accent={accent}
      title={side === 'offense' ? 'Mapa de la acción en el campo' : 'Mapa de la acción defensiva'}
      subtitle="Punto = línea de golpeo · flecha = yardas ganadas (ataque hacia la derecha)"
      badge={<Badge tone={side === 'offense' ? 'blue' : 'red'}>{plays.length} jugadas</Badge>}
      aside={
        <>
          <SectionLabel>Por zona del campo</SectionLabel>
          {zones.length ? (
            <DataTable
              rows={zones}
              rowKey={(z) => z.label}
              columns={[
                { key: 'z', header: 'Zona', render: (z) => z.label },
                { key: 'n', header: 'n', align: 'right', render: (z) => z.n, sortValue: (z) => z.n },
                { key: 'y', header: 'Yd', align: 'right', render: (z) => fmt.num(z.yds), sortValue: (z) => z.yds },
                { key: 'p', header: 'Presión', align: 'right', render: (z) => fmt.rate(z.presion, 0), sortValue: (z) => z.presion },
              ]}
            />
          ) : (
            <EmptyState title="Sin jugadas" />
          )}
        </>
      }
    >
      {plays.length ? <FieldStrip markers={markers} accent={ACCENTS[accent].main} /> : <EmptyState title="Sin jugadas para estos filtros" />}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-muted">
        {legend.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
      <SourceNote>api/plays · yds_to_endzone y playResult de cada jugada destacada. La API aún no expone agregados de temporada por zona del campo.</SourceNote>
    </WideCard>
  )
}

/* ───────────── Arquetipos K-Means ───────────── */

export function ClusterCard({ research, focus }: { research: ResearchInsightsResponse; focus: 'offense' | 'defense' }) {
  const meta = research.clusters
  const rows = meta.clusters.map((c) => ({
    label: shortCluster(c.etiqueta),
    full: c.etiqueta,
    n: c.n,
    pct: c.pct,
    yds: c.centroide_real.playResult,
    presion: c.centroide_real.presion * 100,
    sack: c.tasa_sack * 100,
    explosiva: c.tasa_explosiva * 100,
    trampa: c.tasa_trampa * 100,
    box: c.centroide_real.defendersInBox,
    rush: c.centroide_real.n_pass_rush,
    t: c.centroide_real.time_event_s,
  }))
  const a = ACCENTS[focus]
  return (
    <WideCard
      accent={focus}
      title="Arquetipos de jugada (K-Means)"
      subtitle="api/research-insights · 4 grupos con centroides reales"
      aside={
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r.full} className="rounded-lg border border-field-line bg-nfl-white px-3 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card">
              <p className="text-sm font-semibold text-legacy-blue">{r.full}</p>
              <p className="text-xs text-ink-muted">
                {fmt.int(r.n)} jugadas ({r.pct.toFixed(1)}%) · {r.yds.toFixed(1)} yd ·{' '}
                {focus === 'offense' ? `${r.t.toFixed(1)} s en bolsa` : `${r.box.toFixed(1)} en caja · ${r.rush.toFixed(1)} rushers`}
              </p>
            </li>
          ))}
        </ul>
      }
    >
      <ColumnChart
        data={rows}
        xKey="label"
        accent={a.main}
        series={[
          { key: 'explosiva', name: 'Explosivas %', color: COLORS.impactBlue, format: pctFormat },
          { key: 'presion', name: 'Presión %', color: COLORS.nflRed, format: pctFormat },
          { key: 'sack', name: 'Sacks %', color: COLORS.legacyBlue, format: pctFormat },
          { key: 'trampa', name: 'Trampa %', color: COLORS.unamGold, format: pctFormat },
        ]}
        yFormat={pctFormat}
        height={260}
        extra={(r) => `${fmt.int(r.n as number)} jugadas · ${(r.yds as number).toFixed(1)} yd promedio`}
      />
      <SourceNote>
        Varianza explicada {meta.varianza_explicada_pct.toFixed(1)}% · silhouette {meta.silhouette_muestra.toFixed(2)} · estabilidad{' '}
        {meta.estabilidad_semillas.toFixed(2)}. Un silhouette cercano a 0 indica grupos poco separados: úsalos como perfiles, no como categorías rígidas.
      </SourceNote>
    </WideCard>
  )
}

/* ───────────── Clasificación de jugadores (rankings) ───────────── */

export interface RankingSet {
  id: string
  label: string
  rows: RankingRow[]
  metric: string
  format: (v: number) => string
  note?: string
}

export function RankingWindow({ sets, accent, highlightTeam, minPlays }: { sets: RankingSet[]; accent: Accent; highlightTeam: string; minPlays: number }) {
  const [active, setActive] = useState(sets[0].id)
  const set = sets.find((s) => s.id === active) ?? sets[0]
  const a = ACCENTS[accent]
  const rows = useMemo(() => set.rows.map((r, i) => ({ ...r, rank: i + 1, label: r.displayName })), [set])
  const positions = useMemo(() => {
    const m = new Map<string, number>()
    rows.forEach((r) => m.set(r.officialPosition, (m.get(r.officialPosition) ?? 0) + 1))
    return [...m.entries()].sort((x, y) => y[1] - x[1])
  }, [rows])
  const leader = rows[0]
  return (
    <>
      <WideCard
        accent={accent}
        title={set.label}
        subtitle={`api/research-insights · top ${rows.length} con al menos ${minPlays} jugadas`}
        badge={
          sets.length > 1 ? (
            <Segmented accent={accent} value={active} onChange={setActive} options={sets.map((s) => ({ value: s.id, label: s.label }))} />
          ) : undefined
        }
        aside={
          <>
            {leader && (
              <div className={`rounded-lg border ${a.border} bg-nfl-white p-3`}>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Líder</p>
                <p className="font-display text-2xl font-bold leading-tight text-legacy-blue">{leader.displayName}</p>
                <p className="text-xs text-ink-muted">
                  {leader.officialPosition} · {teamInfo(leader.team)?.name ?? leader.team} · {leader.n} jugadas
                </p>
                <p className={`mt-1 font-display text-3xl font-bold ${a.text}`}>{set.format(leader.valor)}</p>
              </div>
            )}
            <SectionLabel>Posiciones en el top</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {positions.map(([pos, n]) => (
                <Badge key={pos} tone="neutral">
                  {pos} · {n}
                </Badge>
              ))}
            </div>
            {set.note && <Insight accent={accent}>{set.note}</Insight>}
          </>
        }
      >
        <HBarChart
          data={rows}
          labelKey="label"
          valueKey="valor"
          name={set.metric}
          color={a.main}
          colorFn={(r) => (highlightTeam && r.team === highlightTeam ? COLORS.unamGold : a.main)}
          format={set.format}
          labelWidth={150}
          extra={(r) => `${r.officialPosition as string} · ${r.team as string} · ${r.n as number} jugadas`}
        />
        {highlightTeam && <SourceNote>En oro: jugadores de {highlightTeam} (filtro de equipo).</SourceNote>}
      </WideCard>

      <WideCard accent={accent} title="Tabla completa" subtitle="Ordena con clic en cada columna">
        <DataTable
          rows={rows}
          rowKey={(r) => r.nflId}
          initialSort={{ key: 'rank', dir: 'asc' }}
          isSelected={(r) => Boolean(highlightTeam) && r.team === highlightTeam}
          columns={[
            { key: 'rank', header: '#', render: (r) => r.rank, sortValue: (r) => r.rank },
            { key: 'name', header: 'Jugador', render: (r) => <span className="font-semibold">{r.displayName}</span>, sortValue: (r) => r.displayName },
            { key: 'pos', header: 'Pos.', render: (r) => r.officialPosition, sortValue: (r) => r.officialPosition },
            {
              key: 'team',
              header: 'Equipo',
              render: (r) => (
                <span>
                  {r.team} <span className="text-[10px] text-ink-muted">{teamInfo(r.team)?.conference}</span>
                </span>
              ),
              sortValue: (r) => r.team,
            },
            { key: 'n', header: 'Jugadas', align: 'right', render: (r) => r.n, sortValue: (r) => r.n },
            { key: 'v', header: set.metric, align: 'right', render: (r) => <span className={`font-semibold ${a.text}`}>{set.format(r.valor)}</span>, sortValue: (r) => r.valor },
            { key: 'sep', header: 'Separación', align: 'right', render: (r) => `${r.sep_objetivo.toFixed(2)} yd`, sortValue: (r) => r.sep_objetivo },
            { key: 'yds', header: 'Yd/jugada', align: 'right', render: (r) => r.yds.toFixed(1), sortValue: (r) => r.yds },
          ]}
        />
        <SourceNote>
          Estatura, peso y edad de cada jugador (players.csv) aún no se exponen en la API, por eso este ranking no cruza perfil físico con rendimiento.
        </SourceNote>
      </WideCard>
    </>
  )
}

/* ───────────── Castigos ───────────── */

export function PenaltyWindow({ side, plays }: { side: 'ofensiva' | 'defensiva'; plays: FeaturedPlay[] }) {
  const accent: Accent = 'alert'
  const all = parsePenalties(plays)
  const list = all.filter((p) => p.side === side)
  const byFoul = Object.entries(
    list.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.foul]: (acc[p.foul] ?? 0) + 1 }), {}),
  ).map(([label, n]) => ({ label, n }))
  const accepted = list.filter((p) => p.status === 'aceptada')
  return (
    <WideCard
      accent={accent}
      title={side === 'ofensiva' ? 'Castigos del ataque' : 'Castigos de la defensa'}
      subtitle="Extraídos del texto de cada jugada destacada"
      badge={<Badge tone="red">{list.length} castigos</Badge>}
      aside={
        <>
          <MetricList
            items={[
              { label: 'Castigos', value: fmt.int(list.length), hint: `en ${plays.length} jugadas` },
              { label: 'Aceptados', value: fmt.int(accepted.length) },
              { label: 'Declinados', value: fmt.int(list.filter((p) => p.status === 'declinada').length) },
              { label: 'Yardas aceptadas', value: fmt.int(accepted.reduce((s, p) => s + (p.yards ?? 0), 0)) },
            ]}
          />
          <Insight accent="alert">
            {side === 'ofensiva'
              ? 'Un castigo del ataque se atribuye cuando el equipo sancionado es el que tiene el balón.'
              : 'Un castigo defensivo se atribuye cuando el equipo sancionado es el que defiende.'}
          </Insight>
        </>
      }
    >
      {list.length ? (
        <>
          <HBarChart data={byFoul} labelKey="label" valueKey="n" name="Castigos" color={COLORS.unityRed} labelWidth={170} format={(v) => String(Math.round(v))} />
          <SectionLabel>Detalle</SectionLabel>
          <DataTable
            rows={list}
            rowKey={(p) => `${p.gameId}-${p.playId}-${p.foul}-${p.player ?? ''}`}
            columns={[
              { key: 'team', header: 'Equipo', render: (p) => <span className="font-semibold text-legacy-red">{p.team}</span>, sortValue: (p) => p.team },
              { key: 'player', header: 'Jugador', render: (p) => p.player ?? '–', sortValue: (p) => p.player ?? '' },
              { key: 'foul', header: 'Falta', render: (p) => p.foul, sortValue: (p) => p.foul },
              {
                key: 'status',
                header: 'Estado',
                render: (p) => <Badge tone={p.status === 'aceptada' ? 'red' : 'neutral'}>{p.status}</Badge>,
                sortValue: (p) => p.status,
              },
              { key: 'yd', header: 'Yardas', align: 'right', render: (p) => (p.yards === null ? '–' : p.yards), sortValue: (p) => p.yards },
            ]}
          />
        </>
      ) : (
        <EmptyState
          title={`Sin castigos ${side === 'ofensiva' ? 'ofensivos' : 'defensivos'} en la selección`}
          detail={`Hay ${all.length} castigo(s) en total en estas jugadas. Prueba quitando filtros.`}
        />
      )}
      <SourceNote>
        La API no expone foulName, foulNFLId ni penaltyYards de plays.csv; estos castigos salen de playDescription y solo cubren las jugadas destacadas.
      </SourceNote>
    </WideCard>
  )
}
