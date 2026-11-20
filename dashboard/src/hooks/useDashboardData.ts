import { useMemo } from 'react'
import { applyClientFilters, hasServerFilters, toPlaysQuery } from '../lib/derive'
import { fetchOverview, fetchPlays, fetchResearchInsights } from '../services/api'
import type { CoachFilters, FeaturedPlay, OverviewResponse, ResearchInsightsResponse } from '../types/nfl'
import { useAsync } from './useAsync'

export interface DashboardData {
  overview: OverviewResponse | null
  research: ResearchInsightsResponse | null
  /** Las 60 jugadas destacadas sin filtrar (opciones de filtros, Modo Scout) */
  allPlays: FeaturedPlay[]
  /** Jugadas tras filtros de servidor (api/plays) y de navegador */
  plays: FeaturedPlay[]
  loadingBase: boolean
  loadingPlays: boolean
  error: unknown
  reload: () => void
}

/**
 * Agregados de temporada: se piden una vez (api/overview y api/research-insights no aceptan filtros).
 * Jugadas: equipo, cobertura, etiqueta y arquetipo se piden a api/plays;
 * partido, cuarto, down y resultado se filtran aquí.
 */
export function useDashboardData(filters: CoachFilters): DashboardData {
  const overview = useAsync(fetchOverview, 'overview')
  const research = useAsync(fetchResearchInsights, 'research')
  const all = useAsync(() => fetchPlays(), 'plays-all')

  const query = toPlaysQuery(filters)
  const serverFiltered = hasServerFilters(filters)
  const filtered = useAsync(() => fetchPlays(query), JSON.stringify(query), serverFiltered)

  const source = serverFiltered ? filtered.data : all.data
  const plays = useMemo(() => applyClientFilters(source ?? [], filters), [source, filters])

  return {
    overview: overview.data,
    research: research.data,
    allPlays: all.data ?? [],
    plays,
    loadingBase: overview.loading || research.loading || all.loading,
    loadingPlays: serverFiltered ? filtered.loading : all.loading,
    error: overview.error ?? research.error ?? all.error ?? (serverFiltered ? filtered.error : null),
    reload: () => {
      overview.reload()
      research.reload()
      all.reload()
      if (serverFiltered) filtered.reload()
    },
  }
}
