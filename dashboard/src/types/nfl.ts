/**
 * Contrato con el backend FastAPI (backend/main.py).
 * Los tipos "Api" reflejan el JSON exacto de cada endpoint; src/data/mockData.ts
 * es una copia real de esas respuestas, así que tsc valida que el contrato coincide.
 *
 *   GET  api/overview                         → OverviewResponse
 *   GET  api/research-insights                → ResearchInsightsResponse
 *   GET  api/plays?cluster_id&coverage&team&tag → PlaysResponse
 *   GET  api/plays/{gameId}/{playId}/tracking → PlayTrackingResponse
 *   POST api/chat                             → ChatResponse
 */

/* ───────────── Valores comunes ───────────── */

export type PassResult = 'C' | 'I' | 'S' | 'IN' | 'R'
export type PlayTag = 'explosiva' | 'soe' | 'hip_flip' | 'trampa_presion'
export type ClusterId = 0 | 1 | 2 | 3

/** Agregado de reglas (por cobertura, formación, play action o tiempo en bolsa) */
export interface RuleStats {
  n: number
  yds: number
  explosiva: number // tasa 0-1
  presion: number // tasa 0-1
  t_throw: number // s
  sep_objetivo: number // yd
  soe: number // yd
  hip_flip: number // grados
  trampa: number // tasa 0-1
}

/* ───────────── GET api/overview ───────────── */

export interface SeasonKpis {
  juegos: number
  jugadas: number
  semanas: number[]
  yardas_promedio: number
  yardas_mediana: number
  tasa_explosiva: number
  tasa_presion: number
  tasa_completo: number
  tasa_sack: number
  tasa_intercepcion: number
  tiempo_lanzar_promedio_s: number
  sep_objetivo_promedio_yd: number
  hip_flip_promedio_deg: number
  tasa_trampa_presion: number
  cobertura_sep_objetivo: number
  cobertura_hip_flip: number
}

export interface PocketCurvePoint {
  t_desde_s: number
  t_hasta_s: number
  n: number
  yds: number
  explosiva: number
  presion: number
  completo: number
  sep_objetivo: number
}

export interface OverviewResponse {
  kpis: SeasonKpis
  coberturas: Record<string, number>
  tipo_cobertura: Record<string, number>
  formaciones: Record<string, number>
  curva_tiempo_bolsa: PocketCurvePoint[]
  reglas_tiempo_bolsa: Record<string, RuleStats>
  reglas_cobertura: Record<string, RuleStats>
  reglas_formacion: Record<string, RuleStats>
  reglas_play_action: Record<string, RuleStats> // claves "0" y "1"
}

/* ───────────── GET api/research-insights ───────────── */

export interface ClusterCentroid {
  down: number
  yardsToGo: number
  yds_to_endzone: number
  score_diff_off: number
  defendersInBox: number
  time_event_s: number
  n_pass_rush: number
  presion: number
  sep_target_arrival_yd: number
  max_speed_off: number
  playResult: number
}

export interface ClusterApi {
  cluster: number
  n: number
  pct: number
  centroide_real: ClusterCentroid
  centroide_z: ClusterCentroid
  tasa_explosiva: number
  tasa_sack: number
  tasa_incompleto: number
  soe_promedio: number
  hip_flip_promedio: number
  tasa_trampa: number
  cobertura_top: Record<string, number>
  etiqueta: string
}

export interface RankingRow {
  nflId: number
  n: number
  valor: number
  team: string
  sep_objetivo: number
  yds: number
  displayName: string
  officialPosition: string
}

export interface PressureTrap {
  definicion: string
  n: number
  pct_de_jugadas: number
  pct_de_jugadas_con_presion: number
  yardas_promedio: number
  yardas_faltantes_promedio: number
  sep_objetivo_promedio: number
  tiempo_lanzar_promedio: number
  por_resultado: Record<string, number>
  por_down: Record<string, number>
  por_cobertura: Record<string, { n: number; tasa_sobre_presion: number }>
  por_equipo_ofensivo: Record<string, { n: number; tasa_sobre_presion: number }>
  comparacion_presion_sep_alta: { trampa_yds: number; presion_sep_alta_convierte_yds: number }
}

export interface ResearchInsightsResponse {
  clusters: {
    varianza_explicada_pct: number
    silhouette_muestra: number
    estabilidad_semillas: number
    clusters: ClusterApi[]
  }
  rankings: {
    receptores_soe: RankingRow[]
    receptores_hip_flip_inducido: RankingRow[]
    defensores_hip_flip: RankingRow[]
    min_jugadas: number
  }
  trampa_presion: PressureTrap
  metodologia: Record<string, string>
}

/* ───────────── GET api/plays ───────────── */

export interface FeaturedPlay {
  gameId: number
  playId: number
  week: number
  quarter: number
  down: number
  yardsToGo: number
  possessionTeam: string
  defensiveTeam: string
  playDescription: string
  passResult: PassResult
  playResult: number
  prePenaltyPlayResult: number
  offenseFormation: string | null
  pff_passCoverage: string | null
  pff_passCoverageType: string | null
  pff_playAction: number
  zona_campo: string
  yds_to_endzone: number
  time_to_throw_s: number | null
  presion: number
  sep_target_arrival_yd: number | null
  sep_esperada_yd: number | null
  SOE: number | null
  hip_flip_deg: number | null
  checkdown_trap: number
  max_speed_off: number | null
  cluster_id: number
  cluster_label: string
  target_nflId: number | null
  cov_def_nflId: number | null
  snap_frame: number
  arrival_frame: number
  arrival_source: string
  tags: PlayTag[]
  primary_tag: PlayTag
  target_name: string | null
  cov_def_name: string | null
}

export interface PlaysResponse {
  count: number
  plays: FeaturedPlay[]
}

/** Parámetros que el endpoint api/plays filtra en el servidor */
export interface PlaysQuery {
  cluster_id?: ClusterId
  coverage?: string
  team?: string
  tag?: PlayTag
}

/* ───────────── GET api/plays/{gameId}/{playId}/tracking ───────────── */

export interface TrackingEntity {
  nflId: number | null // null = balón
  displayName: string
  jerseyNumber: number | null
  team: string
  pff_role: string | null
  x: number
  y: number
  o: number | null
  dir: number | null
  s: number
}

export interface TrackingFrame {
  frameId: number
  event: string | null
  entities: TrackingEntity[]
}

export interface PlayTrackingResponse {
  gameId: number
  playId: number
  field: { length: number; width: number; attack: string }
  play: FeaturedPlay | null
  frames: TrackingFrame[]
}

/* ───────────── POST api/chat ───────────── */

/** El backend solo acepta estos dos valores (regex ^(coach|broadcast)$) */
export type ChatAudience = 'coach' | 'broadcast'

export interface ChatRequest {
  message: string
  mode: ChatAudience
}

export interface ChatResponse {
  reply: string
  recommended_play: { gameId: number; playId: number; reason: string } | null
  source: 'bedrock' | 'local'
  model?: string
  tools_used?: string[]
  fallback_reason?: string
}

/* ───────────── Estado de la interfaz ───────────── */

export type AppMode = 'coach' | 'scout'

export type OffenseWindow =
  | 'off-resumen'
  | 'off-tipo'
  | 'off-rendimiento'
  | 'off-accion'
  | 'off-proteccion'
  | 'off-jugadores'
  | 'off-castigos'

export type DefenseWindow =
  | 'def-resumen'
  | 'def-cobertura'
  | 'def-personal'
  | 'def-rendimiento'
  | 'def-accion'
  | 'def-jugadores'
  | 'def-castigos'

export type WindowId = OffenseWindow | DefenseWindow | 'cruces'

/** Filtros del Modo Coach. Los marcados (servidor) viajan a api/plays; el resto se aplica en el navegador. */
export interface CoachFilters {
  team: string // (servidor) '' = todos
  coverage: string // (servidor)
  tag: PlayTag | '' // (servidor)
  clusterId: ClusterId | -1 // (servidor)
  gameId: number | 0 // 0 = todos
  quarter: number // 0 = todos, 5 = tiempo extra
  down: number // 0 = todos
  passResult: PassResult | ''
}

export const EMPTY_FILTERS: CoachFilters = {
  team: '',
  coverage: '',
  tag: '',
  clusterId: -1,
  gameId: 0,
  quarter: 0,
  down: 0,
  passResult: '',
}

/** Métricas derivadas de un conjunto de jugadas destacadas */
export interface PlaySummary {
  n: number
  yardsPerPlay: number | null
  completionPct: number | null
  pressurePct: number | null
  sackPct: number | null
  intPct: number | null
  explosivePct: number | null
  timeToThrow: number | null
  separation: number | null
  soe: number | null
  hipFlip: number | null
  trapPct: number | null
}

export interface ParsedPenalty {
  gameId: number
  playId: number
  team: string
  side: 'ofensiva' | 'defensiva'
  player: string | null
  foul: string
  status: 'aceptada' | 'declinada' | 'compensada'
  yards: number | null
  description: string
}

/* ───────────── Modo Scout ───────────── */

export type Conference = 'AFC' | 'NFC'
export type PositionGroup = 'RB' | 'WR' | 'TE' | 'FB' | 'CB' | 'S' | 'LB'

export interface ScoutPlayer {
  nflId: number
  name: string
  team: string
  conference: Conference | null
  division: string | null
  position: string
  group: PositionGroup | null
  side: 'ofensiva' | 'defensiva'
  plays: number
  separation: number // yd (objetivo o permitida)
  yards: number // yd por jugada
  soe: number | null
  hipFlipInduced: number | null
  hipFlip: number | null
  rankings: string[]
}

export interface ScoutTeam {
  team: string
  name: string
  conference: Conference | null
  division: string | null
  players: number
  receivers: number
  defenders: number
  avgSeparation: number | null // receptores
  avgYards: number | null // receptores
  avgSoe: number | null
  avgHipFlipInduced: number | null
  avgHipFlipAllowed: number | null // defensores
  avgSeparationAllowed: number | null // defensores
  featuredPlays: number
  trapPlays: number | null
  trapRate: number | null
}
