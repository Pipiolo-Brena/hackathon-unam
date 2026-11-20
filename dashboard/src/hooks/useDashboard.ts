import { useEffect, useState } from 'react'
import {
  fetchDefenseData,
  fetchMatchupsData,
  fetchOffenseData,
  fetchOverview,
  fetchTrackingPlay,
} from '../services/api'
import type { DashboardFilters, DashboardPayload } from '../types/nfl'

interface State {
  data: DashboardPayload | null
  loading: boolean
  error: string | null
}

/** Carga todo el payload del dashboard cada vez que cambian los filtros */
export function useDashboard(filters: DashboardFilters): State {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))
    Promise.all([
      fetchOverview(filters),
      fetchOffenseData(filters),
      fetchDefenseData(filters),
      fetchMatchupsData(filters),
      fetchTrackingPlay(filters),
    ])
      .then(([overview, offense, defense, matchups, tracking]) => {
        if (!cancelled) setState({ data: { overview, offense, defense, matchups, tracking }, loading: false, error: null })
      })
      .catch((e: unknown) => {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'Error desconocido' }))
      })
    return () => {
      cancelled = true
    }
  }, [filters.gameId, filters.quarter])

  return state
}
