/**
 * Contrato de datos entre el dashboard y la API (/api/...).
 * Los mocks de src/data/mockData.ts y las respuestas reales del backend
 * deben cumplir estos tipos.
 */

/* ───────────── Filtros y utilidades comunes ───────────── */

export type QuarterFilter = 0 | 1 | 2 | 3 | 4 // 0 = todos los cuartos
export interface DashboardFilters {
  gameId: string
  quarter: QuarterFilter
}

export interface GameInfo {
  gameId: string
  week: number
  date: string // ISO yyyy-mm-dd
  home: string
  visitor: string
  label: string
}

export type Tone = 'neutral' | 'good' | 'bad' | 'warn'
export interface KpiItem {
  label: string
  value: string // ya formateado (p. ej. "6.6", "47%")
  hint?: string
  delta?: string
  tone?: Tone
}

/** Fila genérica de una tabla de "mezcla" de jugadas */
export interface PlayMixRow {
  label: string
  plays: number
  yardsPerPlay: number
  completionPct?: number // 0-100
  successRate?: number // 0-100
}

export interface ShareSlice {
  label: string
  value: number
}

/** Celda del mapa de pases: profundidad x dirección */
export type PassDepth = 'short' | 'deep'
export type PassDirection = 'left' | 'middle' | 'right'
export interface PassMapCell {
  depth: PassDepth
  direction: PassDirection
  attempts: number
  completionPct: number
  yardsPerAttempt: number
  interceptions: number
}

export interface FieldZoneRow {
  zone: string // "Línea de gol (1-10)", "Zona roja (11-20)", ...
  plays: number
  yardsPerPlay: number
  successRate: number
}

/* ───────────── Clasificación de jugadores ───────────── */

export interface PlayerRow {
  nflId: number
  name: string
  team: string
  position: string
  snaps: number
  performance: number // valor de la métrica principal del grupo
  heightIn: number
  weightLb: number
  age: number | null
  topSpeedYds: number // velocidad máxima (yd/s) del tracking
}

export interface DescriptiveStat {
  feature: string // Estatura, Peso, IMC, Edad, Velocidad máx., Aceleración
  mean: number
  std: number
  min: number
  max: number
}

export interface CorrelationStat {
  feature: string
  rho: number // Spearman
  pValue: number
  n: number
}

export interface ProfileCompare {
  feature: string
  top25: number
  bottom25: number
}

export interface PositionGroupProfile {
  id: string
  label: string // "Edge rushers (DE + OLB)"
  metricLabel: string // "Presión %"
  metricHigherIsBetter: boolean
  sampleSize: number
  minSnaps: number
  descriptive: DescriptiveStat[]
  correlations: CorrelationStat[]
  profile: ProfileCompare[]
  topPlayers: PlayerRow[]
  insight: string
}

export interface PlayerClassification {
  groups: PositionGroupProfile[]
  caveat: string
}

/* ───────────── Castigos ───────────── */

export interface PenaltyRow {
  foul: string
  count: number
  avgYards: number
  topPosition: string
}
export interface PenaltySection {
  total: number
  ratePct: number // % de jugadas con castigo
  netYards: number
  rows: PenaltyRow[]
  byDown: { down: number; ratePct: number }[]
  note: string
}

/* ───────────── OFENSIVA ───────────── */

export interface OffenseSectionData {
  tipoDeJugada: {
    passResultMix: ShareSlice[]
    dropbackTypes: PlayMixRow[]
    formations: PlayMixRow[]
    personnel: PlayMixRow[]
    playAction: PlayMixRow[]
    downSituation: PlayMixRow[]
  }
  rendimiento: {
    summary: {
      yardsPerPlay: number
      successRate: number
      completionPct: number
      sackRate: number
      intRate: number
      pressureRate: number
      avgTimeToThrow: number
    }
    byQuarter: { quarter: string; yardsPerPlay: number; successRate: number }[]
    timeToThrow: { bucket: string; plays: number; completionPct: number; yardsPerPlay: number }[]
    pressureSplit: { label: string; plays: number; completionPct: number; yardsPerPlay: number }[]
    byTeam: { team: string; plays: number; yardsPerPlay: number; successRate: number }[]
  }
  concentracionAccion: {
    fieldZones: FieldZoneRow[]
    passMap: PassMapCell[]
  }
  proteccionLineaOfensiva: {
    byPosition: { position: string; snaps: number; pressureAllowedPct: number; beatenPct: number }[]
    byBlockType: { blockType: string; label: string; snaps: number; pressureAllowedPct: number }[]
    note: string
  }
  clasificacionJugadores: PlayerClassification
  castigosOfensivos: PenaltySection
}

/* ───────────── DEFENSIVA ───────────── */

export interface CoverageRow {
  label: string
  plays: number
  yardsPerPlay: number
  completionPct: number
  pressurePct: number
  dpiPct: number
}

export interface DefenseSectionData {
  esquemaCobertura: {
    coverageType: CoverageRow[] // Zona / Hombre / Otros
    schemes: CoverageRow[] // Cover-1, Cover-3, ...
  }
  personalYCasillaCaja: {
    personnel: PlayMixRow[]
    box: { defenders: number; plays: number; yardsPerPlay: number; successRate: number }[]
  }
  rendimientoDefensivo: {
    summary: {
      yardsAllowedPerPlay: number
      completionAllowedPct: number
      sackRate: number
      intRate: number
      pressureRate: number
    }
    byRushers: { rushers: number; plays: number; pressurePct: number; sackPct: number; yardsPerPlay: number }[]
    byQuarter: { quarter: string; yardsPerPlay: number; pressurePct: number }[]
    byTeam: { team: string; plays: number; yardsPerPlay: number; pressurePct: number }[]
  }
  concentracionAccionDefensiva: {
    fieldZones: FieldZoneRow[]
    passMap: PassMapCell[]
  }
  clasificacionJugadores: PlayerClassification
  castigosDefensivos: PenaltySection
}

/* ───────────── CRUCES ───────────── */

export interface MatchupCrossData {
  formationVsCoverage: { formation: string; coverage: string; plays: number; yardsPerPlay: number }[]
  protectionVsRush: {
    rushers: number
    plays: number
    pressurePct: number
    sackPct: number
    yardsPerPlay: number
  }[]
  playActionVsBox: { box: string; paPlays: number; paYards: number; noPaPlays: number; noPaYards: number }[]
  penaltiesVsCoverage: { coverage: string; plays: number; dpiPct: number; holdingPct: number }[]
  pressureImpact: { label: string; offenseYpp: number; completionPct: number; sackPct: number }[]
  insights: string[]
}

/* ───────────── Tracking (Reconstructor 2D, siguiente fase) ───────────── */

export interface TrackingFrame {
  frameId: number
  nflId: number | null // null = balón
  team: string
  x: number // 0-120
  y: number // 0-53.3
  speed: number
  event: string | null
}

export interface PlayTrackingPlaceholder {
  status: 'pending' | 'ready'
  gameId: string
  playId: number
  description: string
  frames: TrackingFrame[]
  note: string
}

/* ───────────── Payload y Copiloto ───────────── */

export interface OverviewData {
  games: GameInfo[]
  kpis: { offense: KpiItem[]; defense: KpiItem[]; matchups: KpiItem[] }
}

export interface DashboardPayload {
  overview: OverviewData
  offense: OffenseSectionData
  defense: DefenseSectionData
  matchups: MatchupCrossData
  tracking: PlayTrackingPlaceholder
}

export interface NovaQueryRequest {
  question: string
  filters: DashboardFilters
  context?: 'ofensiva' | 'defensiva' | 'cruces'
}
export interface NovaQueryResponse {
  answer: string
  model: string
  available: boolean
}
