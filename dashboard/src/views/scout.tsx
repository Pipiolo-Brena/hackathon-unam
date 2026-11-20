/** MODO SCOUT · promedios de jugadores y equipos por conferencia · identidad Oro UNAM + Azul UNAM */
import { useMemo, useState } from 'react'
import { ColumnChart, RadarCompare } from '../components/charts'
import FieldReplay from '../components/FieldReplay'
import { Badge, DataTable, EmptyState, MetricList, Segmented, SectionLabel, SourceNote, WideCard, WindowHeader } from '../components/ui'
import type { Column } from '../components/ui'
import { buildScoutPlayers, buildScoutTeams, GROUP_LABEL, mean } from '../lib/derive'
import { fmt } from '../lib/format'
import { NFL_TEAMS, teamInfo } from '../lib/nflTeams'
import { COLORS } from '../theme'
import type { Conference, FeaturedPlay, PositionGroup, ResearchInsightsResponse, ScoutPlayer, ScoutTeam } from '../types/nfl'

type ConfFilter = 'all' | Conference
type Entity = 'players' | 'teams'

const A_COLOR = COLORS.unamBlue
const B_COLOR = COLORS.unamGold
const inputCls =
  'h-9 rounded-lg border border-field-line bg-nfl-white px-2.5 text-sm text-legacy-blue transition-all duration-300 hover:border-unam-blue/50 focus:border-unam-gold focus:outline-none focus:ring-2 focus:ring-unam-gold/30'

/* ───────────── Métricas comparables ───────────── */

interface MetricDef<T> {
  label: string
  get: (x: T) => number | null
  format: (v: number) => string
}

const yd = (v: number) => `${v.toFixed(2)} yd`
const deg = (v: number) => `${v.toFixed(1)}°`

const PLAYER_METRICS: MetricDef<ScoutPlayer>[] = [
  { label: 'Jugadas', get: (p) => p.plays, format: (v) => String(Math.round(v)) },
  { label: 'Separación', get: (p) => p.separation, format: yd },
  { label: 'Yd/jugada', get: (p) => p.yards, format: (v) => v.toFixed(2) },
  { label: 'SOE', get: (p) => p.soe, format: (v) => `${fmt.signed(v, 2)} yd` },
  { label: 'Quiebre inducido', get: (p) => p.hipFlipInduced, format: deg },
  { label: 'Quiebre defensivo', get: (p) => p.hipFlip, format: deg },
]

const TEAM_METRICS: MetricDef<ScoutTeam>[] = [
  { label: 'Jugadores top', get: (t) => t.players, format: (v) => String(Math.round(v)) },
  { label: 'Separación rec.', get: (t) => t.avgSeparation, format: yd },
  { label: 'Yd/jugada rec.', get: (t) => t.avgYards, format: (v) => v.toFixed(2) },
  { label: 'SOE rec.', get: (t) => t.avgSoe, format: (v) => `${fmt.signed(v, 2)} yd` },
  { label: 'Quiebre inducido', get: (t) => t.avgHipFlipInduced, format: deg },
  { label: 'Quiebre def.', get: (t) => t.avgHipFlipAllowed, format: deg },
  { label: 'Sep. permitida', get: (t) => t.avgSeparationAllowed, format: yd },
  { label: 'Jugadas destacadas', get: (t) => t.featuredPlays, format: (v) => String(Math.round(v)) },
]

/** Percentil 0-100 del valor dentro del grupo de referencia */
function percentile(pool: number[], v: number | null): number {
  if (v === null || !pool.length) return 0
  const below = pool.filter((x) => x < v).length
  const equal = pool.filter((x) => x === v).length
  return ((below + 0.5 * equal) / pool.length) * 100
}

function radarData<T>(metrics: MetricDef<T>[], pool: T[], a: T, b: T) {
  return metrics.map((m) => {
    const values = pool.map(m.get).filter((x): x is number => x !== null)
    return { metric: m.label, a: percentile(values, m.get(a)), b: percentile(values, m.get(b)) }
  })
}

const toggle = <K,>(list: K[], id: K): K[] => (list.includes(id) ? list.filter((x) => x !== id) : list.length < 2 ? [...list, id] : [list[1], id])

/* ───────────── Tarjetas horizontales ───────────── */

function ConfBadge({ c }: { c: Conference | null }) {
  if (!c) return null
  return <Badge tone={c === 'AFC' ? 'red' : 'blue'}>{c}</Badge>
}

function PlayerCard({ p, color }: { p: ScoutPlayer; color: string }) {
  return (
    <article className="flex animate-fade-up items-stretch overflow-hidden rounded-xl border border-field-line bg-nfl-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <span className="w-1.5 shrink-0" style={{ background: color }} />
      <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2 p-4">
        <div className="min-w-[160px]">
          <p className="font-display text-2xl font-bold leading-tight text-legacy-blue">{p.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            {p.position} · {NFL_TEAMS[p.team]?.name ?? p.team} <ConfBadge c={p.conference} />
          </p>
        </div>
        {PLAYER_METRICS.map((m) => {
          const v = m.get(p)
          return (
            <div key={m.label}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{m.label}</p>
              <p className="font-display text-xl font-bold text-legacy-blue">{v === null ? '–' : m.format(v)}</p>
            </div>
          )
        })}
      </div>
    </article>
  )
}

function TeamCard({ t, color }: { t: ScoutTeam; color: string }) {
  return (
    <article className="flex animate-fade-up items-stretch overflow-hidden rounded-xl border border-field-line bg-nfl-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <span className="w-1.5 shrink-0" style={{ background: color }} />
      <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2 p-4">
        <div className="min-w-[160px]">
          <p className="font-display text-2xl font-bold leading-tight text-legacy-blue">{t.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            {t.division ?? t.team} <ConfBadge c={t.conference} />
          </p>
        </div>
        {TEAM_METRICS.map((m) => {
          const v = m.get(t)
          return (
            <div key={m.label}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{m.label}</p>
              <p className="font-display text-xl font-bold text-legacy-blue">{v === null ? '–' : m.format(v)}</p>
            </div>
          )
        })}
      </div>
    </article>
  )
}

/* ───────────── Vista ───────────── */

export function ScoutView({
  research,
  allPlays,
  selectedPlay,
  onSelectPlay,
}: {
  research: ResearchInsightsResponse
  allPlays: FeaturedPlay[]
  selectedPlay: FeaturedPlay | null
  onSelectPlay: (p: FeaturedPlay) => void
}) {
  const [conf, setConf] = useState<ConfFilter>('all')
  const [team, setTeam] = useState('')
  const [group, setGroup] = useState<PositionGroup | ''>('')
  const [query, setQuery] = useState('')
  const [entity, setEntity] = useState<Entity>('players')
  const [selPlayers, setSelPlayers] = useState<number[]>([])
  const [selTeams, setSelTeams] = useState<string[]>([])

  const players = useMemo(() => buildScoutPlayers(research.rankings), [research])
  const teams = useMemo(() => buildScoutTeams(players, allPlays, research.trampa_presion), [players, allPlays, research])

  const q = query.trim().toLowerCase()
  const byGroupAndQuery = players.filter((p) => (!group || p.group === group) && (!q || p.name.toLowerCase().includes(q) || p.team.toLowerCase() === q))
  const filteredPlayers = byGroupAndQuery.filter((p) => (conf === 'all' || p.conference === conf) && (!team || p.team === team))
  const filteredTeams = teams.filter(
    (t) =>
      (conf === 'all' || t.conference === conf) &&
      (!team || t.team === team) &&
      (!group || players.some((p) => p.team === t.team && p.group === group)) &&
      (!q || t.name.toLowerCase().includes(q) || t.team.toLowerCase() === q || players.some((p) => p.team === t.team && p.name.toLowerCase().includes(q))),
  )

  const teamOptions = teams.filter((t) => conf === 'all' || t.conference === conf)
  const groups = [...new Set(players.map((p) => p.group).filter((g): g is PositionGroup => g !== null))]

  // Panorama AFC vs. NFC: respeta grupo y búsqueda, no la conferencia
  const confRows = (['AFC', 'NFC'] as const).map((c) => {
    const ps = byGroupAndQuery.filter((p) => p.conference === c)
    const rec = ps.filter((p) => p.side === 'ofensiva')
    const def = ps.filter((p) => p.side === 'defensiva')
    return {
      label: c,
      teams: new Set(ps.map((p) => p.team)).size,
      players: ps.length,
      separation: mean(rec.map((p) => p.separation)),
      yards: mean(rec.map((p) => p.yards)),
      soe: mean(rec.map((p) => p.soe)),
      hipInduced: mean(rec.map((p) => p.hipFlipInduced)),
      hipDef: mean(def.map((p) => p.hipFlip)),
      sepAllowed: mean(def.map((p) => p.separation)),
    }
  })
  const confChart = [
    { metric: 'Separación rec. (yd)', AFC: confRows[0].separation ?? 0, NFC: confRows[1].separation ?? 0 },
    { metric: 'Yd/jugada rec.', AFC: confRows[0].yards ?? 0, NFC: confRows[1].yards ?? 0 },
    { metric: 'SOE rec. (yd)', AFC: confRows[0].soe ?? 0, NFC: confRows[1].soe ?? 0 },
    { metric: 'Sep. permitida (yd)', AFC: confRows[0].sepAllowed ?? 0, NFC: confRows[1].sepAllowed ?? 0 },
  ]

  const pickedPlayers = selPlayers.map((id) => players.find((p) => p.nflId === id)).filter((p): p is ScoutPlayer => Boolean(p))
  const pickedTeams = selTeams.map((id) => teams.find((t) => t.team === id)).filter((t): t is ScoutTeam => Boolean(t))

  const playerColumns: Column<ScoutPlayer>[] = [
    {
      key: 'sel',
      header: '',
      render: (p) => (
        <span
          aria-hidden="true"
          className={`inline-block h-3.5 w-3.5 rounded border ${selPlayers.includes(p.nflId) ? 'border-unam-gold bg-unam-gold' : 'border-field-line'}`}
        />
      ),
    },
    { key: 'name', header: 'Jugador', render: (p) => <span className="font-semibold">{p.name}</span>, sortValue: (p) => p.name },
    { key: 'team', header: 'Equipo', render: (p) => p.team, sortValue: (p) => p.team },
    { key: 'conf', header: 'Conf.', render: (p) => <ConfBadge c={p.conference} />, sortValue: (p) => p.conference },
    { key: 'pos', header: 'Pos.', render: (p) => p.position, sortValue: (p) => p.position },
    { key: 'n', header: 'Jugadas', align: 'right', render: (p) => p.plays, sortValue: (p) => p.plays },
    { key: 'sep', header: 'Separación', align: 'right', render: (p) => `${p.separation.toFixed(2)} yd`, sortValue: (p) => p.separation },
    { key: 'yds', header: 'Yd/jugada', align: 'right', render: (p) => p.yards.toFixed(2), sortValue: (p) => p.yards },
    { key: 'soe', header: 'SOE', align: 'right', render: (p) => fmt.signed(p.soe, 2), sortValue: (p) => p.soe },
    { key: 'hi', header: 'Quiebre ind.', align: 'right', render: (p) => (p.hipFlipInduced === null ? '–' : deg(p.hipFlipInduced)), sortValue: (p) => p.hipFlipInduced },
    { key: 'hd', header: 'Quiebre def.', align: 'right', render: (p) => (p.hipFlip === null ? '–' : deg(p.hipFlip)), sortValue: (p) => p.hipFlip },
  ]

  const teamColumns: Column<ScoutTeam>[] = [
    {
      key: 'sel',
      header: '',
      render: (t) => (
        <span aria-hidden="true" className={`inline-block h-3.5 w-3.5 rounded border ${selTeams.includes(t.team) ? 'border-unam-gold bg-unam-gold' : 'border-field-line'}`} />
      ),
    },
    { key: 'team', header: 'Equipo', render: (t) => <span className="font-semibold">{t.name}</span>, sortValue: (t) => t.name },
    { key: 'conf', header: 'Conf.', render: (t) => <ConfBadge c={t.conference} />, sortValue: (t) => t.conference },
    { key: 'div', header: 'División', render: (t) => t.division ?? '–', sortValue: (t) => t.division },
    { key: 'pl', header: 'Jugadores top', align: 'right', render: (t) => t.players, sortValue: (t) => t.players },
    { key: 'sep', header: 'Sep. rec.', align: 'right', render: (t) => fmt.num(t.avgSeparation, 2), sortValue: (t) => t.avgSeparation },
    { key: 'soe', header: 'SOE rec.', align: 'right', render: (t) => fmt.signed(t.avgSoe, 2), sortValue: (t) => t.avgSoe },
    { key: 'hd', header: 'Quiebre def.', align: 'right', render: (t) => (t.avgHipFlipAllowed === null ? '–' : deg(t.avgHipFlipAllowed)), sortValue: (t) => t.avgHipFlipAllowed },
    { key: 'sa', header: 'Sep. permitida', align: 'right', render: (t) => fmt.num(t.avgSeparationAllowed, 2), sortValue: (t) => t.avgSeparationAllowed },
    { key: 'fp', header: 'Jug. destacadas', align: 'right', render: (t) => t.featuredPlays, sortValue: (t) => t.featuredPlays },
    { key: 'tr', header: 'Trampa', align: 'right', render: (t) => fmt.rate(t.trapRate, 0), sortValue: (t) => t.trapRate },
  ]

  const compareReady = entity === 'players' ? pickedPlayers.length === 2 : pickedTeams.length === 2

  // Jugadas del reconstructor: las de los jugadores o equipos elegidos; si no hay, las de los filtros Scout
  const scope = useMemo(() => {
    if (entity === 'players' && selPlayers.length) {
      const list = allPlays.filter((p) => (p.target_nflId !== null && selPlayers.includes(p.target_nflId)) || (p.cov_def_nflId !== null && selPlayers.includes(p.cov_def_nflId)))
      return { plays: list.length ? list : allPlays, label: list.length ? `Jugadas con ${pickedPlayers.map((p) => p.name).join(' y ')} como objetivo o defensor` : 'Los jugadores elegidos no aparecen en las jugadas destacadas: se muestran todas' }
    }
    if (entity === 'teams' && selTeams.length) {
      return { plays: allPlays.filter((p) => selTeams.includes(p.possessionTeam) || selTeams.includes(p.defensiveTeam)), label: `Jugadas de ${selTeams.join(' y ')}` }
    }
    const list = allPlays.filter(
      (p) =>
        (!team || p.possessionTeam === team || p.defensiveTeam === team) &&
        (conf === 'all' || teamInfo(p.possessionTeam)?.conference === conf || teamInfo(p.defensiveTeam)?.conference === conf),
    )
    return { plays: list, label: team || conf !== 'all' ? 'Jugadas según los filtros de equipo y conferencia' : 'Todas las jugadas destacadas con tracking' }
  }, [allPlays, entity, selPlayers, selTeams, pickedPlayers, team, conf])

  return (
    <>
      <WindowHeader
        accent="gold"
        eyebrow="Modo Scout"
        title="Promedios por jugador y equipo"
        goalpost
        description="Jugadores con 30+ jugadas en los rankings de separación y quiebre de cadera, agrupados por conferencia y equipo."
      />

      {/* Barra de filtros */}
      <div className="sticky top-16 z-20 -mx-6 mb-5 border-y border-field-line bg-nfl-white/95 px-6 py-3 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Conferencia</span>
            <Segmented
              accent="gold"
              value={conf}
              onChange={(v) => {
                setConf(v)
                setTeam('')
              }}
              options={[
                { value: 'all', label: 'Todas' },
                { value: 'AFC', label: 'AFC' },
                { value: 'NFC', label: 'NFC' },
              ]}
            />
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Equipo</span>
            <select className={inputCls} value={team} onChange={(e) => setTeam(e.target.value)}>
              <option value="">Todos ({teamOptions.length})</option>
              {teamOptions
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((t) => (
                  <option key={t.team} value={t.team}>
                    {t.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Grupo de posición</span>
            <select className={inputCls} value={group} onChange={(e) => setGroup(e.target.value as PositionGroup | '')}>
              <option value="">Todos</option>
              {groups.map((g) => (
                <option key={g} value={g}>
                  {GROUP_LABEL[g]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[200px] flex-1 flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Buscar jugador</span>
            <input className={inputCls} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nombre o abreviatura (KC, BUF…)" type="search" />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Ver</span>
            <Segmented
              accent="gold"
              value={entity}
              onChange={setEntity}
              options={[
                { value: 'players', label: `Jugadores (${filteredPlayers.length})` },
                { value: 'teams', label: `Equipos (${filteredTeams.length})` },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* AFC vs NFC */}
        <section id="scout-conferencias" className="scroll-mt-40">
          <div className="stagger grid gap-5 lg:grid-cols-2">
            {confRows.map((c) => (
              <article
                key={c.label}
                className={`rounded-xl border bg-nfl-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${
                  conf === c.label ? 'border-unam-gold shadow-gold' : 'border-field-line'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display text-3xl font-bold uppercase text-unam-blue">{c.label}</h3>
                  <Badge tone="neutral">
                    {c.teams} equipos · {c.players} jugadores
                  </Badge>
                </div>
                <MetricList
                  items={[
                    { label: 'Separación rec.', value: c.separation === null ? '–' : yd(c.separation) },
                    { label: 'Yd/jugada rec.', value: fmt.num(c.yards, 2) },
                    { label: 'SOE rec.', value: c.soe === null ? '–' : `${fmt.signed(c.soe, 2)} yd` },
                    { label: 'Quiebre inducido', value: c.hipInduced === null ? '–' : deg(c.hipInduced) },
                    { label: 'Quiebre defensivo', value: c.hipDef === null ? '–' : deg(c.hipDef) },
                    { label: 'Sep. permitida', value: c.sepAllowed === null ? '–' : yd(c.sepAllowed) },
                  ]}
                />
              </article>
            ))}
          </div>
          <div className="mt-5">
            <WideCard
              accent="gold"
              title="AFC vs. NFC"
              subtitle="Promedio simple de los jugadores de cada conferencia en los rankings"
              aside={
                <SourceNote>
                  Calculado en el navegador con api/research-insights (rankings, mín. {research.rankings.min_jugadas} jugadas) y la alineación 2021 de conferencias.
                  Solo incluye a los {players.length} jugadores que aparecen en algún top 15.
                </SourceNote>
              }
            >
              <ColumnChart
                data={confChart}
                xKey="metric"
                accent={B_COLOR}
                series={[
                  { key: 'AFC', name: 'AFC', color: COLORS.nflRed, format: (v) => v.toFixed(2) },
                  { key: 'NFC', name: 'NFC', color: COLORS.nflBlue, format: (v) => v.toFixed(2) },
                ]}
                height={240}
              />
            </WideCard>
          </div>
        </section>

        {/* Tabla */}
        <section id="scout-tabla" className="scroll-mt-40">
          <WideCard
            accent="gold"
            title={entity === 'players' ? 'Tabla de jugadores' : 'Promedios por equipo'}
            subtitle="Clic en una columna para ordenar · clic en una fila para comparar (máx. 2)"
          >
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-field-line bg-field-mist/60 px-3 py-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Comparar:</span>
              {(entity === 'players'
                ? pickedPlayers.map((p) => ({ id: String(p.nflId), name: p.name, sub: `${p.position} · ${p.team}` }))
                : pickedTeams.map((t) => ({ id: t.team, name: t.name, sub: t.conference ?? '' }))
              ).map((x, i) => (
                <span key={x.id} className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-field-line bg-nfl-white py-1 pl-2 pr-1 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: i === 0 ? A_COLOR : B_COLOR }} />
                  <span className="font-semibold text-legacy-blue">{x.name}</span>
                  <span className="text-xs text-ink-muted">{x.sub}</span>
                  <button
                    onClick={() => (entity === 'players' ? setSelPlayers((s) => s.filter((id) => String(id) !== x.id)) : setSelTeams((s) => s.filter((id) => id !== x.id)))}
                    className="rounded-full px-1.5 text-ink-muted transition-colors hover:bg-[#FCE8E8] hover:text-nfl-red"
                    aria-label={`Quitar ${x.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {(entity === 'players' ? pickedPlayers.length : pickedTeams.length) === 0 && (
                <span className="text-sm text-ink-muted">elige dos filas de la tabla</span>
              )}
              {compareReady && (
                <button
                  onClick={() => document.getElementById('scout-comparador')?.scrollIntoView({ behavior: 'smooth' })}
                  className="ml-auto rounded-lg bg-unam-gold px-3 py-1.5 text-sm font-bold text-legacy-blue transition-all duration-300 hover:-translate-y-0.5 hover:bg-unam-gold-bright"
                >
                  Ir al comparador ↓
                </button>
              )}
            </div>
            {entity === 'players' ? (
              filteredPlayers.length ? (
                <DataTable
                  rows={filteredPlayers}
                  columns={playerColumns}
                  rowKey={(p) => p.nflId}
                  initialSort={{ key: 'n', dir: 'desc' }}
                  onRowClick={(p) => setSelPlayers((s) => toggle(s, p.nflId))}
                  isSelected={(p) => selPlayers.includes(p.nflId)}
                  maxHeight="480px"
                />
              ) : (
                <EmptyState title="Sin jugadores con estos filtros" detail="Los rankings solo incluyen a los top 15 de cada métrica." />
              )
            ) : filteredTeams.length ? (
              <DataTable
                rows={filteredTeams}
                columns={teamColumns}
                rowKey={(t) => t.team}
                initialSort={{ key: 'pl', dir: 'desc' }}
                onRowClick={(t) => setSelTeams((s) => toggle(s, t.team))}
                isSelected={(t) => selTeams.includes(t.team)}
                maxHeight="480px"
              />
            ) : (
              <EmptyState title="Sin equipos con estos filtros" />
            )}
          </WideCard>
        </section>

        {/* Comparador */}
        <section id="scout-comparador" className="scroll-mt-40 space-y-4">
          {entity === 'players'
            ? pickedPlayers.map((p, i) => <PlayerCard key={p.nflId} p={p} color={i === 0 ? A_COLOR : B_COLOR} />)
            : pickedTeams.map((t, i) => <TeamCard key={t.team} t={t} color={i === 0 ? A_COLOR : B_COLOR} />)}

          <WideCard
            accent="gold"
            title="Comparador lado a lado"
            subtitle="Radar en percentiles dentro de todos los jugadores o equipos con datos (más afuera = valor más alto)"
            aside={
              compareReady ? (
                entity === 'players' ? (
                  <RawTable metrics={PLAYER_METRICS} a={pickedPlayers[0]} b={pickedPlayers[1]} names={[pickedPlayers[0].name, pickedPlayers[1].name]} />
                ) : (
                  <RawTable metrics={TEAM_METRICS} a={pickedTeams[0]} b={pickedTeams[1]} names={[pickedTeams[0].team, pickedTeams[1].team]} />
                )
              ) : undefined
            }
          >
            {compareReady ? (
              entity === 'players' ? (
                <RadarCompare
                  data={radarData(PLAYER_METRICS, players, pickedPlayers[0], pickedPlayers[1])}
                  a={{ name: pickedPlayers[0].name, color: A_COLOR }}
                  b={{ name: pickedPlayers[1].name, color: B_COLOR }}
                />
              ) : (
                <RadarCompare
                  data={radarData(TEAM_METRICS, teams, pickedTeams[0], pickedTeams[1])}
                  a={{ name: pickedTeams[0].name, color: A_COLOR }}
                  b={{ name: pickedTeams[1].name, color: B_COLOR }}
                />
              )
            ) : (
              <EmptyState
                title={`Selecciona 2 ${entity === 'players' ? 'jugadores' : 'equipos'} en la tabla`}
                detail="Las métricas que un jugador no tiene (por ejemplo, SOE en un defensor) aparecen en el centro del radar y con guion en la tabla."
              />
            )}
          </WideCard>
        </section>

        {/* Reconstructor 2D con la capa Scout */}
        <section className="space-y-2">
          <p className="text-sm text-ink-muted">
            <span className="font-semibold text-legacy-blue">{scope.label}</span> · {scope.plays.length} jugada(s)
          </p>
          <FieldReplay play={selectedPlay} plays={scope.plays} onSelectPlay={onSelectPlay} mode="scout" sectionId="scout-reconstructor" title="Reconstructor 2D · Biomecánica" />
        </section>
      </div>
    </>
  )
}

function RawTable<T>({ metrics, a, b, names }: { metrics: MetricDef<T>[]; a: T; b: T; names: [string, string] }) {
  return (
    <>
      <SectionLabel>Valores reales</SectionLabel>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-ink-muted">
            <th className="py-1 text-left font-bold">Métrica</th>
            <th className="py-1 text-right font-bold" style={{ color: A_COLOR }}>
              {names[0]}
            </th>
            <th className="py-1 text-right font-bold text-legacy-blue">{names[1]}</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => {
            const va = m.get(a)
            const vb = m.get(b)
            const winA = va !== null && vb !== null && va > vb
            const winB = va !== null && vb !== null && vb > va
            return (
              <tr key={m.label} className="border-t border-field-line">
                <td className="py-1.5 text-ink-muted">{m.label}</td>
                <td className={`py-1.5 text-right tabular-nums ${winA ? 'font-bold text-unam-blue' : ''}`}>{va === null ? '–' : m.format(va)}</td>
                <td className={`py-1.5 text-right tabular-nums ${winB ? 'font-bold text-legacy-blue underline decoration-unam-gold decoration-2' : ''}`}>
                  {vb === null ? '–' : m.format(vb)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
