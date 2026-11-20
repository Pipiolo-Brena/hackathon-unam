/**
 * Datos simulados de un partido (TB vs DAL, semana 1 de 2021, 70 dropbacks).
 * Solo sirven para poblar la UI mientras se conecta el backend.
 * Las magnitudes se basan en el análisis exploratorio de data/.
 */
import type {
  CoverageRow,
  DashboardPayload,
  DefenseSectionData,
  MatchupCrossData,
  OffenseSectionData,
  OverviewData,
  PassMapCell,
  PlayTrackingPlaceholder,
  PlayerClassification,
  PenaltySection,
  PlayerRow,
} from '../types/nfl'

/* ───────────── Overview ───────────── */

export const mockOverview: OverviewData = {
  games: [
    { gameId: '2021090900', week: 1, date: '2021-09-09', home: 'TB', visitor: 'DAL', label: 'S1 · DAL @ TB' },
    { gameId: '2021091200', week: 1, date: '2021-09-12', home: 'ATL', visitor: 'PHI', label: 'S1 · PHI @ ATL' },
    { gameId: '2021091201', week: 1, date: '2021-09-12', home: 'BUF', visitor: 'PIT', label: 'S1 · PIT @ BUF' },
  ],
  kpis: {
    offense: [
      { label: 'Yardas por jugada', value: '6.6', hint: 'Prom. liga muestra: 6.56', delta: '+0.0', tone: 'neutral' },
      { label: 'Jugadas exitosas', value: '47%', hint: 'Éxito por down y distancia', delta: '+1 pp', tone: 'good' },
      { label: 'Presión permitida', value: '38%', hint: 'Hit, hurry o sack', delta: '+0.4 pp', tone: 'warn' },
      { label: 'Castigos ofensivos', value: '5', hint: '−38 yardas netas', delta: '−38 yd', tone: 'bad' },
    ],
    defense: [
      { label: 'Yardas permitidas', value: '6.6', hint: 'Por dropback rival', tone: 'neutral' },
      { label: 'Presión generada', value: '38%', hint: 'Sobre dropbacks rivales', tone: 'good' },
      { label: 'Sacks + INT', value: '5 + 3', hint: '7.1% sacks · 4.3% INT', tone: 'good' },
      { label: 'Castigos defensivos', value: '7', hint: '+96 yardas para el rival', tone: 'bad' },
    ],
    matchups: [
      { label: 'Play action vs. caja', value: '+1.7 yd', hint: '8.1 vs 6.4 yd por jugada', tone: 'good' },
      { label: 'Rush 5+ vs. 4', value: '+14 pp', hint: 'Presión 47% vs 33%', tone: 'good' },
      { label: 'DPI en hombre', value: '2.7%', hint: 'vs 1.2% en zona', tone: 'warn' },
      { label: 'Jugadas con tracking', value: '70', hint: 'Listas para reconstruir', tone: 'neutral' },
    ],
  },
}

/* ───────────── Auxiliares para mocks ───────────── */

const passMapOffense: PassMapCell[] = [
  { depth: 'short', direction: 'left', attempts: 15, completionPct: 68, yardsPerAttempt: 6.1, interceptions: 0 },
  { depth: 'short', direction: 'middle', attempts: 11, completionPct: 70, yardsPerAttempt: 7.6, interceptions: 0 },
  { depth: 'short', direction: 'right', attempts: 17, completionPct: 66, yardsPerAttempt: 5.7, interceptions: 1 },
  { depth: 'deep', direction: 'left', attempts: 5, completionPct: 40, yardsPerAttempt: 10.8, interceptions: 0 },
  { depth: 'deep', direction: 'middle', attempts: 2, completionPct: 50, yardsPerAttempt: 14.0, interceptions: 1 },
  { depth: 'deep', direction: 'right', attempts: 6, completionPct: 33, yardsPerAttempt: 10.9, interceptions: 1 },
]

const passMapDefense: PassMapCell[] = [
  { depth: 'short', direction: 'left', attempts: 14, completionPct: 64, yardsPerAttempt: 5.8, interceptions: 0 },
  { depth: 'short', direction: 'middle', attempts: 10, completionPct: 70, yardsPerAttempt: 7.9, interceptions: 1 },
  { depth: 'short', direction: 'right', attempts: 16, completionPct: 63, yardsPerAttempt: 5.5, interceptions: 0 },
  { depth: 'deep', direction: 'left', attempts: 6, completionPct: 33, yardsPerAttempt: 9.9, interceptions: 1 },
  { depth: 'deep', direction: 'middle', attempts: 3, completionPct: 67, yardsPerAttempt: 15.3, interceptions: 0 },
  { depth: 'deep', direction: 'right', attempts: 5, completionPct: 40, yardsPerAttempt: 11.0, interceptions: 1 },
]

const player = (
  nflId: number,
  name: string,
  team: string,
  position: string,
  snaps: number,
  performance: number,
  heightIn: number,
  weightLb: number,
  age: number | null,
  topSpeedYds: number,
): PlayerRow => ({ nflId, name, team, position, snaps, performance, heightIn, weightLb, age, topSpeedYds })

const CAVEAT =
  'Spearman por posición (nunca mezclar posiciones). Con muestras de 26 a 100 jugadores, p cercanos a 0.05 pueden ser casualidad.'

/* ───────────── OFENSIVA ───────────── */

const offenseClassification: PlayerClassification = {
  caveat: CAVEAT,
  groups: [
    {
      id: 'wr',
      label: 'Receptores (WR)',
      metricLabel: 'Yardas por ruta',
      metricHigherIsBetter: true,
      sampleSize: 103,
      minSnaps: 100,
      descriptive: [
        { feature: 'Estatura (in)', mean: 72.7, std: 2.3, min: 68, max: 77 },
        { feature: 'Peso (lb)', mean: 199.9, std: 14.5, min: 165, max: 231 },
        { feature: 'IMC', mean: 26.6, std: 1.5, min: 21.8, max: 30.7 },
        { feature: 'Edad', mean: 26.7, std: 2.8, min: 22.5, max: 34.6 },
        { feature: 'Velocidad máx. (yd/s)', mean: 9.58, std: 0.42, min: 8.59, max: 11.18 },
      ],
      correlations: [
        { feature: 'Estatura', rho: 0.151, pValue: 0.124, n: 103 },
        { feature: 'Peso', rho: 0.126, pValue: 0.203, n: 103 },
        { feature: 'IMC', rho: -0.04, pValue: 0.685, n: 103 },
        { feature: 'Edad', rho: 0.101, pValue: 0.338, n: 92 },
        { feature: 'Velocidad máx.', rho: 0.205, pValue: 0.035, n: 103 },
      ],
      profile: [
        { feature: 'Estatura (in)', top25: 72.9, bottom25: 72.0 },
        { feature: 'Peso (lb)', top25: 202.7, bottom25: 198.0 },
        { feature: 'Edad', top25: 26.9, bottom25: 26.2 },
        { feature: 'Velocidad máx. (yd/s)', top25: 9.8, bottom25: 9.49 },
      ],
      topPlayers: [
        player(43480, 'Chris Godwin', 'TB', 'WR', 41, 2.1, 73, 209, 25.6, 9.4),
        player(44835, 'CeeDee Lamb', 'DAL', 'WR', 38, 1.9, 74, 198, 22.6, 9.7),
        player(43434, 'Amari Cooper', 'DAL', 'WR', 37, 1.8, 73, 211, 27.2, 9.3),
        player(40009, 'Antonio Brown', 'TB', 'WR', 33, 3.4, 70, 185, 33.2, 9.75),
        player(40075, 'Mike Evans', 'TB', 'WR', 36, 1.7, 77, 231, 28.1, 9.1),
      ],
      insight: 'El perfil ganador es el receptor veloz, no el más alto ni el más pesado.',
    },
    {
      id: 'ol',
      label: 'Línea ofensiva (T, G, C)',
      metricLabel: 'Presión permitida %',
      metricHigherIsBetter: false,
      sampleSize: 145,
      minSnaps: 150,
      descriptive: [
        { feature: 'Estatura (in)', mean: 76.8, std: 1.5, min: 73, max: 81 },
        { feature: 'Peso (lb)', mean: 315.1, std: 11.8, min: 260, max: 350 },
        { feature: 'IMC', mean: 37.6, std: 1.8, min: 30.8, max: 43.7 },
        { feature: 'Edad', mean: 27.9, std: 3.3, min: 22.2, max: 39.8 },
        { feature: 'Velocidad máx. (yd/s)', mean: 5.44, std: 0.6, min: 3.97, max: 7.17 },
      ],
      correlations: [
        { feature: 'Estatura (T)', rho: 0.198, pValue: 0.128, n: 59 },
        { feature: 'IMC (T)', rho: -0.236, pValue: 0.067, n: 59 },
        { feature: 'Edad (G)', rho: -0.233, pValue: 0.081, n: 55 },
        { feature: 'Peso (C)', rho: 0.164, pValue: 0.416, n: 26 },
        { feature: 'Vel. máx. (G)', rho: 0.183, pValue: 0.157, n: 60 },
      ],
      profile: [
        { feature: 'Estatura (in)', top25: 76.5, bottom25: 77.5 },
        { feature: 'Peso (lb)', top25: 313.6, bottom25: 314.5 },
        { feature: 'Edad', top25: 28.8, bottom25: 28.0 },
        { feature: 'Velocidad máx. (yd/s)', top25: 5.37, bottom25: 5.54 },
      ],
      topPlayers: [
        player(37100, 'Ryan Jensen', 'TB', 'C', 70, 2.9, 75, 320, 30.1, 5.2),
        player(38020, 'Tristan Wirfs', 'TB', 'T', 70, 2.6, 77, 322, 22.7, 5.6),
        player(41980, 'Zack Martin', 'DAL', 'G', 68, 2.4, 76, 315, 30.9, 5.3),
        player(43001, 'Tyron Smith', 'DAL', 'T', 66, 6.4, 77, 307, 30.6, 5.4),
        player(44002, 'Donovan Smith', 'TB', 'T', 70, 7.9, 78, 338, 28.2, 5.1),
      ],
      insight:
        'Ningún atributo físico predice el desempeño dentro de una posición; pesa más la posición (C 4.1% vs RT 7.7%) y el tipo de bloqueo.',
    },
    {
      id: 'qb',
      label: 'Mariscales (QB)',
      metricLabel: 'Yardas por dropback',
      metricHigherIsBetter: true,
      sampleSize: 34,
      minSnaps: 100,
      descriptive: [
        { feature: 'Estatura (in)', mean: 75.0, std: 1.8, min: 70, max: 78 },
        { feature: 'Peso (lb)', mean: 221.2, std: 10.1, min: 202, max: 240 },
        { feature: 'Edad', mean: 29.4, std: 5.3, min: 23.2, max: 44.2 },
        { feature: 'Tiempo al lanzamiento (s)', mean: 2.96, std: 0.18, min: 2.52, max: 3.36 },
        { feature: 'Presión recibida %', mean: 38, std: 6, min: 26, max: 47 },
      ],
      correlations: [
        { feature: 'Estatura vs Y/A', rho: -0.391, pValue: 0.016, n: 34 },
        { feature: 'Peso vs Y/dropback', rho: -0.116, pValue: 0.511, n: 34 },
        { feature: 'Edad vs Y/dropback', rho: 0.027, pValue: 0.89, n: 29 },
        { feature: 'Presión vs Y/dropback', rho: -0.38, pValue: 0.028, n: 34 },
        { feature: 'Vel. máx. vs Y/dropback', rho: -0.072, pValue: 0.684, n: 34 },
      ],
      profile: [
        { feature: 'Presión recibida %', top25: 33, bottom25: 43 },
        { feature: 'Tiempo al lanzamiento (s)', top25: 2.8, bottom25: 3.1 },
        { feature: 'Estatura (in)', top25: 75.4, bottom25: 74.6 },
      ],
      topPlayers: [
        player(25511, 'Tom Brady', 'TB', 'QB', 40, 7.56, 76, 225, 44.2, 7.04),
        player(43424, 'Dak Prescott', 'DAL', 'QB', 38, 7.92, 74, 238, 28.2, 7.92),
      ],
      insight: 'La presión recibida explica más el rendimiento del QB que su físico.',
    },
  ],
}

export const mockOffense: OffenseSectionData = {
  tipoDeJugada: {
    passResultMix: [
      { label: 'Completo', value: 38 },
      { label: 'Incompleto', value: 20 },
      { label: 'Scramble', value: 4 },
      { label: 'Sack', value: 5 },
      { label: 'Intercepción', value: 3 },
    ],
    dropbackTypes: [
      { label: 'Tradicional', plays: 52, yardsPerPlay: 6.8, completionPct: 61, successRate: 48 },
      { label: 'Scramble', plays: 8, yardsPerPlay: 6.9, completionPct: 23, successRate: 44 },
      { label: 'Rollout diseñado', plays: 7, yardsPerPlay: 6.4, completionPct: 67, successRate: 56 },
      { label: 'Scramble rollout', plays: 3, yardsPerPlay: 6.7, completionPct: 27, successRate: 40 },
    ],
    formations: [
      { label: 'Shotgun', plays: 44, yardsPerPlay: 6.3, completionPct: 53, successRate: 46 },
      { label: 'Empty', plays: 11, yardsPerPlay: 6.6, completionPct: 56, successRate: 48 },
      { label: 'Singleback', plays: 10, yardsPerPlay: 7.7, completionPct: 56, successRate: 52 },
      { label: 'I-Form', plays: 3, yardsPerPlay: 7.4, completionPct: 55, successRate: 53 },
      { label: 'Pistol', plays: 2, yardsPerPlay: 7.1, completionPct: 55, successRate: 50 },
    ],
    personnel: [
      { label: '1 RB · 1 TE · 3 WR', plays: 46, yardsPerPlay: 6.5, completionPct: 54, successRate: 46 },
      { label: '1 RB · 2 TE · 2 WR', plays: 12, yardsPerPlay: 6.3, completionPct: 54, successRate: 48 },
      { label: '2 RB · 1 TE · 2 WR', plays: 5, yardsPerPlay: 7.8, completionPct: 59, successRate: 55 },
      { label: '1 RB · 0 TE · 4 WR', plays: 4, yardsPerPlay: 8.3, completionPct: 55, successRate: 46 },
      { label: 'Otros', plays: 3, yardsPerPlay: 5.2, completionPct: 50, successRate: 40 },
    ],
    playAction: [
      { label: 'Con play action', plays: 17, yardsPerPlay: 8.1, completionPct: 55, successRate: 53 },
      { label: 'Sin play action', plays: 53, yardsPerPlay: 6.4, completionPct: 54, successRate: 46 },
    ],
    downSituation: [
      { label: '1.er down', plays: 29, yardsPerPlay: 7.0, completionPct: 57, successRate: 53 },
      { label: '2.º down', plays: 24, yardsPerPlay: 6.6, completionPct: 57, successRate: 49 },
      { label: '3.er down', plays: 15, yardsPerPlay: 6.1, completionPct: 48, successRate: 37 },
      { label: '4.º down', plays: 2, yardsPerPlay: 5.2, completionPct: 40, successRate: 42 },
    ],
  },
  rendimiento: {
    summary: {
      yardsPerPlay: 6.6,
      successRate: 47,
      completionPct: 54,
      sackRate: 7.1,
      intRate: 4.3,
      pressureRate: 38,
      avgTimeToThrow: 2.9,
    },
    byQuarter: [
      { quarter: 'Q1', yardsPerPlay: 6.4, successRate: 46 },
      { quarter: 'Q2', yardsPerPlay: 6.6, successRate: 48 },
      { quarter: 'Q3', yardsPerPlay: 6.9, successRate: 48 },
      { quarter: 'Q4', yardsPerPlay: 6.4, successRate: 47 },
    ],
    timeToThrow: [
      { bucket: '≤2.0 s', plays: 11, completionPct: 76, yardsPerPlay: 6.0 },
      { bucket: '2.0-2.5', plays: 18, completionPct: 64, yardsPerPlay: 6.8 },
      { bucket: '2.5-3.0', plays: 19, completionPct: 60, yardsPerPlay: 7.4 },
      { bucket: '3.0-3.5', plays: 12, completionPct: 61, yardsPerPlay: 8.9 },
      { bucket: '3.5-4.0', plays: 6, completionPct: 53, yardsPerPlay: 8.8 },
      { bucket: '>4.0 s', plays: 4, completionPct: 40, yardsPerPlay: 7.0 },
    ],
    pressureSplit: [
      { label: 'Sin presión', plays: 43, completionPct: 65, yardsPerPlay: 8.1 },
      { label: 'Con presión', plays: 27, completionPct: 35, yardsPerPlay: 3.9 },
    ],
    byTeam: [
      { team: 'TB', plays: 38, yardsPerPlay: 7.4, successRate: 52 },
      { team: 'DAL', plays: 32, yardsPerPlay: 5.7, successRate: 41 },
    ],
  },
  concentracionAccion: {
    fieldZones: [
      { zone: 'Propio 1-20', plays: 8, yardsPerPlay: 7.7, successRate: 49 },
      { zone: 'Propio 21-40', plays: 12, yardsPerPlay: 7.2, successRate: 49 },
      { zone: 'Medio campo', plays: 18, yardsPerPlay: 7.4, successRate: 48 },
      { zone: 'Rival 40-21', plays: 17, yardsPerPlay: 6.2, successRate: 46 },
      { zone: 'Zona roja (20-11)', plays: 8, yardsPerPlay: 4.8, successRate: 43 },
      { zone: 'Línea de gol (10-1)', plays: 7, yardsPerPlay: 1.5, successRate: 45 },
    ],
    passMap: passMapOffense,
  },
  proteccionLineaOfensiva: {
    byPosition: [
      { position: 'LT', snaps: 70, pressureAllowedPct: 7.3, beatenPct: 5.0 },
      { position: 'LG', snaps: 70, pressureAllowedPct: 5.6, beatenPct: 3.6 },
      { position: 'C', snaps: 70, pressureAllowedPct: 4.1, beatenPct: 2.8 },
      { position: 'RG', snaps: 70, pressureAllowedPct: 6.5, beatenPct: 3.6 },
      { position: 'RT', snaps: 70, pressureAllowedPct: 7.7, beatenPct: 5.8 },
    ],
    byBlockType: [
      { blockType: 'PP', label: 'Pass pro estándar', snaps: 262, pressureAllowedPct: 8.2 },
      { blockType: 'PA', label: 'Protección play action', snaps: 68, pressureAllowedPct: 4.2 },
      { blockType: 'PT', label: 'Post block', snaps: 55, pressureAllowedPct: 2.4 },
      { blockType: 'SW', label: 'Switch (stunts)', snaps: 31, pressureAllowedPct: 9.4 },
      { blockType: 'PU', label: 'Pickup de backfield', snaps: 9, pressureAllowedPct: 17.3 },
    ],
    note: 'Los tackles concentran la presión permitida; el pickup de backfield es el bloqueo más vulnerable.',
  },
  clasificacionJugadores: offenseClassification,
  castigosOfensivos: {
    total: 5,
    ratePct: 7.1,
    netYards: -38,
    rows: [
      { foul: 'Retención ofensiva', count: 2, avgYards: -10, topPosition: 'T' },
      { foul: 'Interferencia ofensiva', count: 1, avgYards: -10, topPosition: 'WR' },
      { foul: 'Uso ilegal de manos', count: 1, avgYards: -5, topPosition: 'G' },
      { foul: 'Intentional grounding', count: 1, avgYards: -13, topPosition: 'QB' },
    ],
    byDown: [
      { down: 1, ratePct: 6.9 },
      { down: 2, ratePct: 4.2 },
      { down: 3, ratePct: 13.3 },
      { down: 4, ratePct: 0 },
    ],
    note: 'La tasa de castigos sube en 3.er down (muestra liga: 7.5% en 1.º vs 11.0% en 3.º).',
  },
}

/* ───────────── DEFENSIVA ───────────── */

const defenseClassification: PlayerClassification = {
  caveat: CAVEAT,
  groups: [
    {
      id: 'edge',
      label: 'Edge rushers (DE + OLB)',
      metricLabel: 'Presión %',
      metricHigherIsBetter: true,
      sampleSize: 96,
      minSnaps: 100,
      descriptive: [
        { feature: 'Estatura (in)', mean: 75.9, std: 1.4, min: 73, max: 80 },
        { feature: 'Peso (lb)', mean: 267.4, std: 19.2, min: 235, max: 342 },
        { feature: 'IMC', mean: 32.6, std: 2.2, min: 28.5, max: 41.6 },
        { feature: 'Edad', mean: 27.8, std: 3.2, min: 22.5, max: 35.1 },
        { feature: 'Velocidad máx. (yd/s)', mean: 7.96, std: 0.72, min: 5.39, max: 9.46 },
      ],
      correlations: [
        { feature: 'Estatura', rho: -0.015, pValue: 0.882, n: 96 },
        { feature: 'Peso', rho: -0.323, pValue: 0.001, n: 96 },
        { feature: 'IMC', rho: -0.306, pValue: 0.002, n: 96 },
        { feature: 'Velocidad máx.', rho: 0.331, pValue: 0.001, n: 96 },
        { feature: 'Aceleración', rho: 0.342, pValue: 0.0004, n: 96 },
      ],
      profile: [
        { feature: 'Peso (lb)', top25: 260.9, bottom25: 274.0 },
        { feature: 'IMC', top25: 31.8, bottom25: 33.5 },
        { feature: 'Velocidad máx. (yd/s)', top25: 8.29, bottom25: 7.73 },
        { feature: 'Aceleración media', top25: 4.11, bottom25: 3.64 },
      ],
      topPlayers: [
        player(43292, 'Shaquil Barrett', 'TB', 'OLB', 38, 18.9, 74, 250, 28.9, 9.21),
        player(40100, 'Jason Pierre-Paul', 'TB', 'DE', 37, 14.2, 77, 275, 32.6, 8.1),
        player(43920, 'Randy Gregory', 'DAL', 'DE', 30, 21.2, 77, 255, 28.9, 8.91),
        player(44130, 'Micah Parsons', 'DAL', 'OLB', 32, 19.4, 75, 245, 22.5, 8.47),
        player(42500, 'DeMarcus Lawrence', 'DAL', 'DE', 31, 13.6, 76, 270, 29.5, 8.0),
      ],
      insight: 'El perfil que mejor presiona es el edge ligero (~260 lb) y muy veloz; estatura y edad no influyen.',
    },
    {
      id: 'interior',
      label: 'Interior (DT + NT)',
      metricLabel: 'Presión %',
      metricHigherIsBetter: true,
      sampleSize: 52,
      minSnaps: 100,
      descriptive: [
        { feature: 'Estatura (in)', mean: 75.2, std: 1.6, min: 71, max: 79 },
        { feature: 'Peso (lb)', mean: 308.8, std: 17.1, min: 255, max: 347 },
        { feature: 'IMC', mean: 38.4, std: 2.7, min: 31.0, max: 43.5 },
        { feature: 'Edad', mean: 27.6, std: 2.5, min: 23.3, max: 34.6 },
        { feature: 'Velocidad máx. (yd/s)', mean: 7.35, std: 0.6, min: 5.98, max: 8.34 },
      ],
      correlations: [
        { feature: 'Peso', rho: -0.309, pValue: 0.0215, n: 52 },
        { feature: 'IMC', rho: -0.226, pValue: 0.101, n: 52 },
        { feature: 'Velocidad máx.', rho: 0.224, pValue: 0.105, n: 52 },
        { feature: 'Aceleración', rho: 0.049, pValue: 0.731, n: 52 },
        { feature: 'Estatura', rho: -0.042, pValue: 0.767, n: 52 },
      ],
      profile: [
        { feature: 'Peso (lb)', top25: 299.6, bottom25: 307.7 },
        { feature: 'Velocidad máx. (yd/s)', top25: 7.57, bottom25: 7.21 },
        { feature: 'Edad', top25: 27.1, bottom25: 27.2 },
      ],
      topPlayers: [
        player(41100, 'Ndamukong Suh', 'TB', 'DT', 36, 11.0, 76, 313, 34.6, 7.2),
        player(44900, 'Vita Vea', 'TB', 'NT', 33, 9.8, 76, 347, 26.6, 6.9),
        player(45010, 'Neville Gallimore', 'DAL', 'DT', 28, 10.1, 74, 304, 24.6, 7.5),
      ],
      insight: 'Mismo patrón que en el edge pero más débil: algo más ligeros y rápidos presionan más.',
    },
    {
      id: 'cb',
      label: 'Cornerbacks y safeties',
      metricLabel: 'Yardas permitidas',
      metricHigherIsBetter: false,
      sampleSize: 173,
      minSnaps: 100,
      descriptive: [
        { feature: 'Estatura (in)', mean: 71.8, std: 1.6, min: 68, max: 76 },
        { feature: 'Peso (lb)', mean: 197.7, std: 10.5, min: 158, max: 220 },
        { feature: 'Edad', mean: 27.1, std: 2.8, min: 22.5, max: 34.2 },
        { feature: 'Velocidad máx. (yd/s)', mean: 9.16, std: 0.52, min: 7.63, max: 10.39 },
        { feature: 'Aceleración media', mean: 4.26, std: 0.26, min: 3.51, max: 4.95 },
      ],
      correlations: [
        { feature: 'Peso (CB)', rho: 0.241, pValue: 0.015, n: 98 },
        { feature: 'Aceleración (CB)', rho: 0.195, pValue: 0.051, n: 98 },
        { feature: 'Edad (S)', rho: 0.325, pValue: 0.004, n: 71 },
        { feature: 'Vel. máx. (CB)', rho: 0.075, pValue: 0.459, n: 98 },
        { feature: 'Estatura (S)', rho: 0.166, pValue: 0.15, n: 75 },
      ],
      profile: [
        { feature: 'Edad (safeties)', top25: 25.8, bottom25: 28.4 },
        { feature: 'Peso CB (lb)', top25: 189.7, bottom25: 195.3 },
        { feature: 'Velocidad máx. (yd/s)', top25: 9.2, bottom25: 9.18 },
      ],
      topPlayers: [
        player(46001, 'Jaylon Smith', 'DAL', 'ILB', 60, 5.1, 74, 245, 26.2, 8.6),
        player(46100, 'Carlton Davis', 'TB', 'CB', 70, 5.9, 73, 206, 24.8, 9.4),
        player(46200, 'Jordan Whitehead', 'TB', 'SS', 68, 6.4, 70, 198, 24.6, 8.9),
        player(46300, 'Trevon Diggs', 'DAL', 'CB', 66, 6.9, 74, 205, 23.2, 9.5),
      ],
      insight: 'La métrica es un proxy a nivel jugada; los atributos físicos explican poco en coberturas.',
    },
  ],
}

const cov = (
  label: string,
  plays: number,
  yardsPerPlay: number,
  completionPct: number,
  pressurePct: number,
  dpiPct: number,
): CoverageRow => ({ label, plays, yardsPerPlay, completionPct, pressurePct, dpiPct })

const defensePenalties: PenaltySection = {
  total: 7,
  ratePct: 10,
  netYards: 96,
  rows: [
    { foul: 'Interferencia defensiva (DPI)', count: 3, avgYards: 15.7, topPosition: 'CB' },
    { foul: 'Defensive holding', count: 2, avgYards: 5, topPosition: 'CB' },
    { foul: 'Roughing the passer', count: 1, avgYards: 15, topPosition: 'DE' },
    { foul: 'Offside defensivo', count: 1, avgYards: 5, topPosition: 'OLB' },
  ],
  byDown: [
    { down: 1, ratePct: 8.6 },
    { down: 2, ratePct: 9.1 },
    { down: 3, ratePct: 12.5 },
    { down: 4, ratePct: 0 },
  ],
  note: 'Los CB acumulan 27% de las faltas defensivas (liga: 8.8 por cada 1,000 snaps).',
}

export const mockDefense: DefenseSectionData = {
  esquemaCobertura: {
    coverageType: [
      cov('Zona', 46, 6.8, 58, 35, 1.2),
      cov('Hombre', 20, 6.6, 47, 42, 2.7),
      cov('Otros', 4, 3.2, 44, 42, 2.3),
    ],
    schemes: [
      cov('Cover-3', 22, 6.9, 59, 34, 1.3),
      cov('Cover-1', 16, 6.7, 47, 41, 2.7),
      cov('Cover-2', 9, 6.5, 60, 31, 0.5),
      cov('Quarters', 9, 7.0, 55, 33, 1.6),
      cov('Cover-6', 6, 6.9, 58, 35, 1.2),
      cov('Cover-0', 3, 5.0, 48, 49, 3.3),
      cov('2-Man', 2, 7.9, 46, 38, 2.0),
      cov('Red Zone', 3, 2.3, 44, 38, 2.1),
    ],
  },
  personalYCasillaCaja: {
    personnel: [
      { label: '4-2-5', plays: 20, yardsPerPlay: 6.6, completionPct: 56, successRate: 49 },
      { label: '2-4-5', plays: 13, yardsPerPlay: 6.5, completionPct: 55, successRate: 48 },
      { label: '3-3-5', plays: 10, yardsPerPlay: 6.4, completionPct: 57, successRate: 48 },
      { label: '2-3-6', plays: 7, yardsPerPlay: 6.3, completionPct: 50, successRate: 41 },
      { label: '4-3-4', plays: 6, yardsPerPlay: 7.2, completionPct: 57, successRate: 53 },
      { label: '3-2-6', plays: 3, yardsPerPlay: 6.0, completionPct: 46, successRate: 38 },
      { label: 'Otros', plays: 11, yardsPerPlay: 6.8, completionPct: 54, successRate: 45 },
    ],
    box: [
      { defenders: 4, plays: 4, yardsPerPlay: 6.6, successRate: 40 },
      { defenders: 5, plays: 13, yardsPerPlay: 6.4, successRate: 45 },
      { defenders: 6, plays: 33, yardsPerPlay: 6.6, successRate: 48 },
      { defenders: 7, plays: 15, yardsPerPlay: 6.6, successRate: 49 },
      { defenders: 8, plays: 5, yardsPerPlay: 7.3, successRate: 51 },
    ],
  },
  rendimientoDefensivo: {
    summary: {
      yardsAllowedPerPlay: 6.6,
      completionAllowedPct: 54,
      sackRate: 7.1,
      intRate: 4.3,
      pressureRate: 38,
    },
    byRushers: [
      { rushers: 3, plays: 4, pressurePct: 25, sackPct: 4, yardsPerPlay: 7.3 },
      { rushers: 4, plays: 45, pressurePct: 35, sackPct: 6, yardsPerPlay: 6.5 },
      { rushers: 5, plays: 17, pressurePct: 47, sackPct: 9, yardsPerPlay: 6.3 },
      { rushers: 6, plays: 3, pressurePct: 49, sackPct: 6, yardsPerPlay: 6.2 },
      { rushers: 7, plays: 1, pressurePct: 65, sackPct: 10, yardsPerPlay: 5.5 },
    ],
    byQuarter: [
      { quarter: 'Q1', yardsPerPlay: 6.4, pressurePct: 36 },
      { quarter: 'Q2', yardsPerPlay: 6.6, pressurePct: 38 },
      { quarter: 'Q3', yardsPerPlay: 6.9, pressurePct: 38 },
      { quarter: 'Q4', yardsPerPlay: 6.4, pressurePct: 40 },
    ],
    byTeam: [
      { team: 'TB', plays: 32, yardsPerPlay: 5.7, pressurePct: 41 },
      { team: 'DAL', plays: 38, yardsPerPlay: 7.4, pressurePct: 35 },
    ],
  },
  concentracionAccionDefensiva: {
    fieldZones: [
      { zone: 'Propio 1-20', plays: 7, yardsPerPlay: 7.2, successRate: 50 },
      { zone: 'Propio 21-40', plays: 11, yardsPerPlay: 7.0, successRate: 48 },
      { zone: 'Medio campo', plays: 19, yardsPerPlay: 7.3, successRate: 48 },
      { zone: 'Rival 40-21', plays: 17, yardsPerPlay: 6.1, successRate: 46 },
      { zone: 'Zona roja (20-11)', plays: 9, yardsPerPlay: 4.7, successRate: 43 },
      { zone: 'Línea de gol (10-1)', plays: 7, yardsPerPlay: 1.5, successRate: 44 },
    ],
    passMap: passMapDefense,
  },
  clasificacionJugadores: defenseClassification,
  castigosDefensivos: defensePenalties,
}

/* ───────────── CRUCES ───────────── */

const formations = ['Shotgun', 'Empty', 'Singleback', 'I-Form']
const coverages = ['Cover-1', 'Cover-2', 'Cover-3', 'Quarters']
const fvcPlays = [
  [10, 4, 12, 6],
  [2, 2, 4, 2],
  [3, 1, 3, 2],
  [1, 0, 1, 1],
]
const fvcYards = [
  [6.1, 6.6, 6.5, 7.0],
  [6.8, 6.0, 6.7, 6.4],
  [7.4, 8.1, 7.9, 7.1],
  [7.0, 0, 7.8, 7.2],
]

export const mockMatchups: MatchupCrossData = {
  formationVsCoverage: formations.flatMap((formation, i) =>
    coverages.map((coverage, j) => ({
      formation,
      coverage,
      plays: fvcPlays[i][j],
      yardsPerPlay: fvcYards[i][j],
    })),
  ),
  protectionVsRush: [
    { rushers: 3, plays: 4, pressurePct: 25, sackPct: 4, yardsPerPlay: 7.3 },
    { rushers: 4, plays: 45, pressurePct: 35, sackPct: 6, yardsPerPlay: 6.5 },
    { rushers: 5, plays: 17, pressurePct: 47, sackPct: 9, yardsPerPlay: 6.3 },
    { rushers: 6, plays: 3, pressurePct: 49, sackPct: 6, yardsPerPlay: 6.2 },
    { rushers: 7, plays: 1, pressurePct: 65, sackPct: 10, yardsPerPlay: 5.5 },
  ],
  playActionVsBox: [
    { box: '≤5 en caja', paPlays: 2, paYards: 7.0, noPaPlays: 15, noPaYards: 6.3 },
    { box: '6 en caja', paPlays: 6, paYards: 7.8, noPaPlays: 27, noPaYards: 6.4 },
    { box: '7 en caja', paPlays: 6, paYards: 8.4, noPaPlays: 9, noPaYards: 6.1 },
    { box: '8+ en caja', paPlays: 3, paYards: 9.1, noPaPlays: 2, noPaYards: 5.5 },
  ],
  penaltiesVsCoverage: [
    { coverage: 'Cover-2', plays: 9, dpiPct: 0.5, holdingPct: 1.1 },
    { coverage: 'Cover-3', plays: 22, dpiPct: 1.3, holdingPct: 2.0 },
    { coverage: 'Quarters', plays: 9, dpiPct: 1.6, holdingPct: 1.4 },
    { coverage: 'Cover-1', plays: 16, dpiPct: 2.7, holdingPct: 1.9 },
    { coverage: 'Cover-0', plays: 3, dpiPct: 3.3, holdingPct: 1.2 },
    { coverage: 'Bracket', plays: 1, dpiPct: 6.4, holdingPct: 0 },
  ],
  pressureImpact: [
    { label: 'Sin presión', offenseYpp: 8.1, completionPct: 65, sackPct: 0 },
    { label: 'Con presión', offenseYpp: 3.9, completionPct: 35, sackPct: 17 },
  ],
  insights: [
    'El play action suma ~1.7 yardas por jugada y rinde más cuanto más defensores hay en la caja.',
    'Con 5 o más rushers la presión sube de 35% a 47%, pero la ofensiva solo cede ~0.2 yardas.',
    'La cobertura en hombre concentra más interferencias (2.7% de las jugadas) que la zona (1.2%).',
    'Con presión, el rendimiento ofensivo cae a la mitad: 3.9 contra 8.1 yardas por jugada.',
  ],
}

/* ───────────── Tracking (placeholder) ───────────── */

export const mockTracking: PlayTrackingPlaceholder = {
  status: 'pending',
  gameId: '2021090900',
  playId: 97,
  description: '(13:33) (Shotgun) T.Brady pass incomplete deep right to C.Godwin.',
  note: 'El Reconstructor 2D leerá data/tracking/tracking_[gameId].csv vía /api en la siguiente fase.',
  frames: [
    { frameId: 1, nflId: 25511, team: 'TB', x: 37.77, y: 24.22, speed: 0.29, event: null },
    { frameId: 1, nflId: null, team: 'football', x: 37.9, y: 24.1, speed: 0, event: null },
    { frameId: 6, nflId: 25511, team: 'TB', x: 36.2, y: 24.0, speed: 1.1, event: 'ball_snap' },
    { frameId: 40, nflId: 25511, team: 'TB', x: 30.4, y: 23.1, speed: 0.9, event: 'pass_forward' },
  ],
}

/* ───────────── Payload completo ───────────── */

export const mockData: DashboardPayload = {
  overview: mockOverview,
  offense: mockOffense,
  defense: mockDefense,
  matchups: mockMatchups,
  tracking: mockTracking,
}
