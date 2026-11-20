import { useMemo, useState } from 'react'
import CopilotPanel from './components/CopilotPanel'
import Header from './components/Header'
import { ModeContext } from './components/ui'
import type { ViewMode } from './components/ui'
import { useDashboard } from './hooks/useDashboard'
import type { DashboardFilters } from './types/nfl'
import DefenseView from './views/DefenseView'
import MatchupsView from './views/MatchupsView'
import OffenseView from './views/OffenseView'

type TabId = 'ofensiva' | 'defensiva' | 'cruces'
const TABS: { id: TabId; label: string; hint: string }[] = [
  { id: 'ofensiva', label: 'Ofensiva', hint: '6 módulos' },
  { id: 'defensiva', label: 'Defensiva', hint: '6 módulos' },
  { id: 'cruces', label: 'Cruces', hint: 'Ofensiva vs. Defensiva' },
]

export default function App() {
  const [tab, setTab] = useState<TabId>('ofensiva')
  const [mode, setMode] = useState<ViewMode>('coach')
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [filters, setFilters] = useState<DashboardFilters>({ gameId: '2021090900', quarter: 0 })
  const { data, loading, error } = useDashboard(filters)

  const games = useMemo(() => data?.overview.games ?? [], [data])

  return (
    <ModeContext.Provider value={mode}>
      <Header
        games={games}
        filters={filters}
        onFilters={setFilters}
        mode={mode}
        onMode={setMode}
        copilotOpen={copilotOpen}
        onToggleCopilot={() => setCopilotOpen((o) => !o)}
      />

      <div className={`pt-16 transition-[padding] ${copilotOpen ? 'lg:pr-[24rem]' : ''}`}>
        <main className="mx-auto max-w-[1600px] px-4 pb-12">
          <nav
            aria-label="Secciones"
            className="sticky top-16 z-10 -mx-4 mb-4 flex gap-1 border-b border-nfl-blue bg-gridiron-black/90 px-4 pt-3 backdrop-blur"
          >
            {TABS.map((t) => {
              const active = t.id === tab
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative px-5 py-2 font-display text-xl font-bold uppercase tracking-wider transition ${
                    active ? 'text-unam-gold' : 'text-[var(--muted)] hover:text-nfl-white'
                  }`}
                >
                  {t.label}
                  <span className="ml-2 hidden font-sans text-[10px] font-normal normal-case tracking-normal text-[var(--muted)] sm:inline">
                    {t.hint}
                  </span>
                  {active && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-unam-gold-bright" />}
                </button>
              )
            })}
          </nav>

          {error && (
            <div role="alert" className="mb-4 rounded border border-unity-red bg-legacy-red p-3 text-sm">
              No se pudieron cargar los datos: {error}
            </div>
          )}

          {!data && loading && <p className="animate-pulse py-20 text-center text-[var(--muted)]">Cargando datos…</p>}

          {data && (
            <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              {tab === 'ofensiva' && <OffenseView data={data.offense} kpis={data.overview.kpis.offense} />}
              {tab === 'defensiva' && <DefenseView data={data.defense} kpis={data.overview.kpis.defense} />}
              {tab === 'cruces' && (
                <MatchupsView data={data.matchups} kpis={data.overview.kpis.matchups} tracking={data.tracking} />
              )}
            </div>
          )}
        </main>
      </div>

      {copilotOpen && <CopilotPanel filters={filters} context={tab} onClose={() => setCopilotOpen(false)} />}
    </ModeContext.Provider>
  )
}
