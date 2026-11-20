/**
 * Capa de acceso a datos. Hoy responde con mocks; cuando el backend FastAPI
 * exponga los endpoints, basta con poner USE_MOCK = false.
 * Las rutas son relativas y SIN diagonal inicial (la app se publica en una subruta).
 */
import { mockData } from '../data/mockData'
import type {
  DashboardFilters,
  DefenseSectionData,
  MatchupCrossData,
  NovaQueryRequest,
  NovaQueryResponse,
  OffenseSectionData,
  OverviewData,
  PlayTrackingPlaceholder,
} from '../types/nfl'

export const USE_MOCK = true

const MOCK_LATENCY_MS = 350
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function toQuery(filters: DashboardFilters): string {
  const params = new URLSearchParams({ gameId: filters.gameId, quarter: String(filters.quarter) })
  return params.toString()
}

async function getJson<T>(path: string, filters: DashboardFilters, mock: T): Promise<T> {
  if (USE_MOCK) {
    await wait(MOCK_LATENCY_MS)
    return structuredClone(mock)
  }
  const res = await fetch(`api/${path}?${toQuery(filters)}`)
  if (!res.ok) throw new Error(`Error ${res.status} al consultar api/${path}`)
  return (await res.json()) as T
}

/** GET api/overview → partidos disponibles y KPIs de cada pestaña */
export function fetchOverview(filters: DashboardFilters): Promise<OverviewData> {
  return getJson('overview', filters, mockData.overview)
}

/** GET api/offense → seis módulos de la pestaña OFENSIVA */
export function fetchOffenseData(filters: DashboardFilters): Promise<OffenseSectionData> {
  return getJson('offense', filters, mockData.offense)
}

/** GET api/defense → seis módulos de la pestaña DEFENSIVA */
export function fetchDefenseData(filters: DashboardFilters): Promise<DefenseSectionData> {
  return getJson('defense', filters, mockData.defense)
}

/** GET api/matchups → cruces ofensiva vs. defensiva */
export function fetchMatchupsData(filters: DashboardFilters): Promise<MatchupCrossData> {
  return getJson('matchups', filters, mockData.matchups)
}

/** GET api/tracking → jugada para el Reconstructor 2D (siguiente fase) */
export function fetchTrackingPlay(filters: DashboardFilters): Promise<PlayTrackingPlaceholder> {
  return getJson('tracking', filters, mockData.tracking)
}

/** POST api/nova → Copiloto (Amazon Bedrock / Nova). Opcional: la app no depende de él. */
export async function sendNovaQuery(request: NovaQueryRequest): Promise<NovaQueryResponse> {
  if (USE_MOCK) {
    await wait(MOCK_LATENCY_MS + 400)
    return {
      available: true,
      model: 'mock',
      answer:
        `[Respuesta simulada] Sobre "${request.question}": en los datos de muestra, ` +
        'la presión baja el rendimiento ofensivo de 8.1 a 3.9 yardas por jugada. ' +
        'Cuando el backend esté conectado, aquí responderá Amazon Nova.',
    }
  }
  const res = await fetch('api/nova', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) throw new Error(`Error ${res.status} al consultar api/nova`)
  return (await res.json()) as NovaQueryResponse
}
