/**
 * Acceso a la API FastAPI (backend/main.py).
 * Rutas relativas SIN diagonal inicial: la app se publica en una subruta (/evento/equipo/).
 * En desarrollo, el proxy de vite.config.ts reenvía api/ al backend (puerto 8000).
 */
import type {
  ChatRequest,
  ChatResponse,
  FeaturedPlay,
  OverviewResponse,
  PlayTrackingResponse,
  PlaysQuery,
  PlaysResponse,
  ResearchInsightsResponse,
} from '../types/nfl'

/** true = usa la copia local de src/data/mockData.ts (sin backend) */
export const USE_MOCK = false

export type ApiErrorKind = 'network' | 'http' | 'not-ready' | 'parse'

export class ApiError extends Error {
  constructor(
    public kind: ApiErrorKind,
    message: string,
    public status?: number,
    public detail?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Base relativa de la API (contrato de despliegue AWS: nunca host absoluto ni diagonal inicial) */
const API_BASE = 'api'

const loadMock = () => import('../data/mockData')
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}/${path}`, { headers: { Accept: 'application/json' }, ...init })
  } catch {
    throw new ApiError('network', 'No se pudo conectar con el backend.')
  }
  const text = await res.text()
  let body: unknown = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    // El proxy de Vite responde texto/HTML cuando Uvicorn no está corriendo
    if (!res.ok) throw new ApiError('network', 'El backend no responde.', res.status)
    throw new ApiError('parse', 'La respuesta de la API no es JSON.', res.status)
  }
  if (!res.ok) {
    const detail =
      body && typeof body === 'object' && 'detail' in body
        ? typeof body.detail === 'string'
          ? body.detail
          : JSON.stringify(body.detail)
        : undefined
    if (res.status === 503) throw new ApiError('not-ready', 'Los datos del análisis no están listos.', 503, detail)
    if (res.status >= 500 && !detail) throw new ApiError('network', 'El backend no responde.', res.status)
    throw new ApiError('http', `Error ${res.status} en ${API_BASE}/${path}`, res.status, detail)
  }
  return body as T
}

/** GET api/overview · KPIs de temporada, distribuciones, curva de tiempo en bolsa y reglas */
export async function fetchOverview(): Promise<OverviewResponse> {
  if (USE_MOCK) {
    await wait(300)
    return (await loadMock()).mockOverview
  }
  return request<OverviewResponse>('overview')
}

/** GET api/research-insights · clusters K-Means, rankings de jugadores y Trampa de Presión */
export async function fetchResearchInsights(): Promise<ResearchInsightsResponse> {
  if (USE_MOCK) {
    await wait(300)
    return (await loadMock()).mockResearch
  }
  return request<ResearchInsightsResponse>('research-insights')
}

/** GET api/plays · jugadas destacadas con tracking; filtra en servidor por cluster, cobertura, equipo y etiqueta */
export async function fetchPlays(query: PlaysQuery = {}): Promise<FeaturedPlay[]> {
  if (USE_MOCK) {
    await wait(200)
    const { mockPlays } = await loadMock()
    return mockPlays.filter(
      (p) =>
        (query.cluster_id === undefined || p.cluster_id === query.cluster_id) &&
        (!query.coverage || (p.pff_passCoverage ?? '').toLowerCase() === query.coverage.toLowerCase()) &&
        (!query.team || [p.possessionTeam, p.defensiveTeam].includes(query.team.toUpperCase())) &&
        (!query.tag || p.tags.includes(query.tag)),
    )
  }
  const params = new URLSearchParams()
  if (query.cluster_id !== undefined) params.set('cluster_id', String(query.cluster_id))
  if (query.coverage) params.set('coverage', query.coverage)
  if (query.team) params.set('team', query.team)
  if (query.tag) params.set('tag', query.tag)
  const qs = params.toString()
  const data = await request<PlaysResponse>(`plays${qs ? `?${qs}` : ''}`)
  return data.plays
}

/** GET api/plays/{gameId}/{playId}/tracking · frames normalizados (ataque hacia la derecha) */
export async function fetchPlayTracking(gameId: number, playId: number): Promise<PlayTrackingResponse> {
  if (USE_MOCK) {
    await wait(300)
    const { mockTracking } = await loadMock()
    return { ...mockTracking, gameId, playId }
  }
  return request<PlayTrackingResponse>(`plays/${gameId}/${playId}/tracking`)
}

/** POST api/chat · Copiloto (Strands + Amazon Nova). El backend responde con un respaldo local si Bedrock falla. */
export async function sendNovaQuery(body: ChatRequest): Promise<ChatResponse> {
  if (USE_MOCK) {
    await wait(700)
    return (await loadMock()).mockChat
  }
  return request<ChatResponse>('chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
}

/** Mensaje amigable para la interfaz */
export function describeError(err: unknown): { title: string; detail: string } {
  if (err instanceof ApiError) {
    if (err.kind === 'network')
      return {
        title: 'El backend no responde',
        detail: 'Inicia la API con: .venv/bin/uvicorn backend.main:app --reload --port 8000',
      }
    if (err.kind === 'not-ready') return { title: err.message, detail: err.detail ?? 'Ejecuta scripts/01_analisis_y_clustering.py' }
    return { title: err.message, detail: err.detail ?? '' }
  }
  return { title: 'Error inesperado', detail: err instanceof Error ? err.message : String(err) }
}
