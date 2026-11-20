/**
 * Funciones puras que convierten las respuestas de la API en datos para las vistas.
 * Todo lo que el backend aún no agrega (filtros por partido/cuarto/down, castigos,
 * promedios por equipo y conferencia) se calcula aquí a partir de datos reales.
 */
import type {
  CoachFilters,
  FeaturedPlay,
  ParsedPenalty,
  PlaySummary,
  PlaysQuery,
  PositionGroup,
  RankingRow,
  ResearchInsightsResponse,
  RuleStats,
  ScoutPlayer,
  ScoutTeam,
} from '../types/nfl'
import { teamInfo } from './nflTeams'

/* ───────────── Utilidades ───────────── */

export function mean(values: (number | null | undefined)[]): number | null {
  const v = values.filter((x): x is number => typeof x === 'number' && !Number.isNaN(x))
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}

function weightedMean(pairs: { value: number | null; weight: number }[]): number | null {
  const v = pairs.filter((p): p is { value: number; weight: number } => p.value !== null && p.weight > 0)
  const w = v.reduce((a, p) => a + p.weight, 0)
  return w ? v.reduce((a, p) => a + p.value * p.weight, 0) / w : null
}

const share = (count: number, total: number): number | null => (total ? count / total : null)

/** Convierte un Record<etiqueta, RuleStats> en filas ordenadas por n */
export function ruleRows(record: Record<string, RuleStats>, labelMap: Record<string, string> = {}) {
  return Object.entries(record)
    .map(([key, r]) => ({ key, label: labelMap[key] ?? key, ...r }))
    .sort((a, b) => b.n - a.n)
}

export function countRows(record: Record<string, number>, labelMap: Record<string, string> = {}) {
  const total = Object.values(record).reduce((a, b) => a + b, 0)
  return Object.entries(record)
    .map(([key, n]) => ({ key, label: labelMap[key] ?? key, n, share: total ? n / total : 0 }))
    .sort((a, b) => b.n - a.n)
}

/* ───────────── Filtros del Modo Coach ───────────── */

export function toPlaysQuery(f: CoachFilters): PlaysQuery {
  const q: PlaysQuery = {}
  if (f.team) q.team = f.team
  if (f.coverage) q.coverage = f.coverage
  if (f.tag) q.tag = f.tag
  if (f.clusterId !== -1) q.cluster_id = f.clusterId
  return q
}

export function hasServerFilters(f: CoachFilters): boolean {
  return Boolean(f.team || f.coverage || f.tag || f.clusterId !== -1)
}

export function applyClientFilters(plays: FeaturedPlay[], f: CoachFilters): FeaturedPlay[] {
  return plays.filter(
    (p) =>
      (!f.gameId || p.gameId === f.gameId) &&
      (!f.quarter || p.quarter === f.quarter) &&
      (!f.down || p.down === f.down) &&
      (!f.passResult || p.passResult === f.passResult),
  )
}

export function activeFilterCount(f: CoachFilters): number {
  return [f.team, f.coverage, f.tag, f.clusterId !== -1, f.gameId, f.quarter, f.down, f.passResult].filter(Boolean).length
}

/* ───────────── Resumen de jugadas ───────────── */

export function summarizePlays(plays: FeaturedPlay[]): PlaySummary {
  const n = plays.length
  const attempts = plays.filter((p) => ['C', 'I', 'IN'].includes(p.passResult)).length
  const count = (fn: (p: FeaturedPlay) => boolean) => plays.filter(fn).length
  return {
    n,
    yardsPerPlay: mean(plays.map((p) => p.playResult)),
    completionPct: share(count((p) => p.passResult === 'C'), attempts),
    pressurePct: share(count((p) => p.presion === 1), n),
    sackPct: share(count((p) => p.passResult === 'S'), n),
    intPct: share(count((p) => p.passResult === 'IN'), n),
    explosivePct: share(count((p) => p.playResult >= 15), n),
    timeToThrow: mean(plays.map((p) => p.time_to_throw_s)),
    separation: mean(plays.map((p) => p.sep_target_arrival_yd)),
    soe: mean(plays.map((p) => p.SOE)),
    hipFlip: mean(plays.map((p) => p.hip_flip_deg)),
    trapPct: share(count((p) => p.checkdown_trap === 1), n),
  }
}

export interface GroupRow {
  label: string
  n: number
  yds: number | null
  presion: number | null
  completion: number | null
  sep: number | null
  soe: number | null
  hipFlip: number | null
}

export function groupPlays(plays: FeaturedPlay[], keyFn: (p: FeaturedPlay) => string | null | undefined): GroupRow[] {
  const groups = new Map<string, FeaturedPlay[]>()
  for (const p of plays) {
    const k = keyFn(p) ?? 'Sin dato'
    groups.set(k, [...(groups.get(k) ?? []), p])
  }
  return [...groups.entries()]
    .map(([label, g]) => {
      const s = summarizePlays(g)
      return {
        label,
        n: g.length,
        yds: s.yardsPerPlay,
        presion: s.pressurePct,
        completion: s.completionPct,
        sep: s.separation,
        soe: s.soe,
        hipFlip: s.hipFlip,
      }
    })
    .sort((a, b) => b.n - a.n)
}

/** Matriz formación × cobertura (conteo y yardas promedio) */
export function crossMatrix(plays: FeaturedPlay[]) {
  const rows = [...new Set(plays.map((p) => p.offenseFormation ?? 'Sin dato'))]
  const cols = [...new Set(plays.map((p) => p.pff_passCoverage ?? 'Sin dato'))]
  const cells = rows.flatMap((r) =>
    cols.map((c) => {
      const g = plays.filter((p) => (p.offenseFormation ?? 'Sin dato') === r && (p.pff_passCoverage ?? 'Sin dato') === c)
      return { row: r, col: c, n: g.length, yds: mean(g.map((p) => p.playResult)) }
    }),
  )
  const byCount = (key: 'row' | 'col') => (a: string, b: string) =>
    cells.filter((x) => x[key] === b).reduce((s, x) => s + x.n, 0) - cells.filter((x) => x[key] === a).reduce((s, x) => s + x.n, 0)
  return { rows: rows.sort(byCount('row')), cols: cols.sort(byCount('col')), cells }
}

/* ───────────── Castigos (derivados de playDescription) ───────────── */

const PENALTY_RE = /penalty on ([A-Z]{2,3})(?:-([^,]+))?,\s*([^,.]+?)(?:,\s*(declined|offsetting|(\d+) yards?))?(?=[,.]|$)/gi

export function parsePenalties(plays: FeaturedPlay[]): ParsedPenalty[] {
  const out: ParsedPenalty[] = []
  for (const p of plays) {
    for (const m of p.playDescription.matchAll(PENALTY_RE)) {
      const [, team, player, foul, statusRaw, yards] = m
      const status = statusRaw?.toLowerCase() === 'declined' ? 'declinada' : statusRaw?.toLowerCase() === 'offsetting' ? 'compensada' : 'aceptada'
      out.push({
        gameId: p.gameId,
        playId: p.playId,
        team,
        side: team === p.possessionTeam ? 'ofensiva' : 'defensiva',
        player: player?.trim() ?? null,
        foul: foul.trim(),
        status,
        yards: yards ? Number(yards) : null,
        description: p.playDescription,
      })
    }
  }
  return out
}

/* ───────────── Modo Scout ───────────── */

const GROUP_BY_POSITION: Record<string, PositionGroup> = {
  RB: 'RB',
  WR: 'WR',
  TE: 'TE',
  FB: 'FB',
  CB: 'CB',
  DB: 'CB',
  FS: 'S',
  SS: 'S',
  ILB: 'LB',
  MLB: 'LB',
  OLB: 'LB',
  LB: 'LB',
}

export const GROUP_LABEL: Record<PositionGroup, string> = {
  RB: 'Corredores (RB)',
  WR: 'Receptores (WR)',
  TE: 'Alas cerradas (TE)',
  FB: 'Fullbacks (FB)',
  CB: 'Esquineros (CB)',
  S: 'Safeties (FS/SS)',
  LB: 'Linebackers (LB)',
}

/** Une los tres rankings por nflId en un registro por jugador */
export function buildScoutPlayers(r: ResearchInsightsResponse['rankings']): ScoutPlayer[] {
  const map = new Map<number, ScoutPlayer>()
  const upsert = (row: RankingRow, side: ScoutPlayer['side'], ranking: string, patch: Partial<ScoutPlayer>) => {
    const info = teamInfo(row.team)
    const current =
      map.get(row.nflId) ??
      ({
        nflId: row.nflId,
        name: row.displayName,
        team: row.team,
        conference: info?.conference ?? null,
        division: info?.division ?? null,
        position: row.officialPosition,
        group: GROUP_BY_POSITION[row.officialPosition] ?? null,
        side,
        plays: row.n,
        separation: row.sep_objetivo,
        yards: row.yds,
        soe: null,
        hipFlipInduced: null,
        hipFlip: null,
        rankings: [],
      } satisfies ScoutPlayer)
    map.set(row.nflId, { ...current, ...patch, plays: Math.max(current.plays, row.n), rankings: [...current.rankings, ranking] })
  }
  r.receptores_soe.forEach((row) => upsert(row, 'ofensiva', 'Top SOE', { soe: row.valor }))
  r.receptores_hip_flip_inducido.forEach((row) => upsert(row, 'ofensiva', 'Top quiebre inducido', { hipFlipInduced: row.valor }))
  r.defensores_hip_flip.forEach((row) => upsert(row, 'defensiva', 'Top quiebre defensivo', { hipFlip: row.valor }))
  return [...map.values()]
}

/** Promedios por equipo ponderados por número de jugadas de cada jugador */
export function buildScoutTeams(
  players: ScoutPlayer[],
  plays: FeaturedPlay[],
  trap: ResearchInsightsResponse['trampa_presion'],
): ScoutTeam[] {
  const teams = new Set([...players.map((p) => p.team), ...plays.map((p) => p.possessionTeam), ...plays.map((p) => p.defensiveTeam)])
  return [...teams]
    .map((team) => {
      const info = teamInfo(team)
      const ps = players.filter((p) => p.team === team)
      const rec = ps.filter((p) => p.side === 'ofensiva')
      const def = ps.filter((p) => p.side === 'defensiva')
      const w = (list: ScoutPlayer[], fn: (p: ScoutPlayer) => number | null) =>
        weightedMean(list.map((p) => ({ value: fn(p), weight: p.plays })))
      const t = trap.por_equipo_ofensivo[team]
      return {
        team,
        name: info?.name ?? team,
        conference: info?.conference ?? null,
        division: info?.division ?? null,
        players: ps.length,
        receivers: rec.length,
        defenders: def.length,
        avgSeparation: w(rec, (p) => p.separation),
        avgYards: w(rec, (p) => p.yards),
        avgSoe: w(rec, (p) => p.soe),
        avgHipFlipInduced: w(rec, (p) => p.hipFlipInduced),
        avgHipFlipAllowed: w(def, (p) => p.hipFlip),
        avgSeparationAllowed: w(def, (p) => p.separation),
        featuredPlays: plays.filter((p) => p.possessionTeam === team || p.defensiveTeam === team).length,
        trapPlays: t?.n ?? null,
        trapRate: t?.tasa_sobre_presion ?? null,
      } satisfies ScoutTeam
    })
    .sort((a, b) => b.players - a.players || a.team.localeCompare(b.team))
}
