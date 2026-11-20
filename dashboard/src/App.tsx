import { useEffect, useState } from 'react'
import CopilotPanel from './components/CopilotPanel'
import FilterBar from './components/FilterBar'
import Header from './components/Header'
import type { ApiStatus } from './components/Header'
import Sidebar from './components/Sidebar'
import { ErrorState, WindowSkeleton } from './components/ui'
import { useDashboardData } from './hooks/useDashboardData'
import { describeError, USE_MOCK } from './services/api'
import type { AppMode, CoachFilters, DefenseWindow, FeaturedPlay, OffenseWindow, WindowId } from './types/nfl'
import { EMPTY_FILTERS } from './types/nfl'
import { CrucesView } from './views/cruces'
import { DEFENSE_WINDOWS } from './views/defense'
import { OFFENSE_WINDOWS } from './views/offense'
import { ScoutView } from './views/scout'

const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches

export default function App() {
  const [mode, setMode] = useState<AppMode>('coach')
  const [view, setView] = useState<WindowId>('off-resumen')
  const [filters, setFilters] = useState<CoachFilters>(EMPTY_FILTERS)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [selectedPlay, setSelectedPlay] = useState<FeaturedPlay | null>(null)
  const data = useDashboardData(filters)

  // Llaves: en Chrome reciente scrollTo devuelve una Promise y React la trataría como limpieza del efecto
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view, mode])

  const status: ApiStatus = USE_MOCK
    ? 'mock'
    : data.error
      ? 'error'
      : data.loadingBase && !data.overview
        ? 'loading'
        : 'ok'

  const openPlay = (gameId: number, playId: number) => {
    const play = data.allPlays.find((p) => p.gameId === gameId && p.playId === playId)
    if (play) setSelectedPlay(play)
    setMode('coach')
    setView('cruces')
    setTimeout(() => document.getElementById('reconstructor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 450)
  }

  const renderContent = () => {
    const { overview, research } = data
    if (!overview || !research) {
      if (data.error) return <ErrorState {...describeError(data.error)} onRetry={data.reload} />
      return <WindowSkeleton />
    }
    if (mode === 'scout') return <ScoutView research={research} allPlays={data.allPlays} />

    const props = {
      overview,
      research,
      plays: data.plays,
      allPlays: data.allPlays,
      filters,
      loadingPlays: data.loadingPlays,
      onOpenPlay: openPlay,
    }
    if (view === 'cruces') {
      return <CrucesView {...props} selectedPlay={selectedPlay ?? data.plays[0] ?? null} onSelectPlay={setSelectedPlay} />
    }
    const Window = view.startsWith('off-') ? OFFENSE_WINDOWS[view as OffenseWindow] : DEFENSE_WINDOWS[view as DefenseWindow]
    return <Window {...props} />
  }

  const ready = Boolean(data.overview && data.research)

  return (
    <>
      <Header
        mode={mode}
        onMode={setMode}
        status={status}
        copilotOpen={copilotOpen}
        onToggleCopilot={() => setCopilotOpen((o) => !o)}
        onToggleSidebar={() => (isDesktop() ? setCollapsed((c) => !c) : setMobileOpen((o) => !o))}
      />
      <Sidebar
        mode={mode}
        current={view}
        onSelect={(id) => {
          setMode('coach')
          setView(id)
        }}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`min-h-screen pt-16 transition-all duration-300 ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-72'} ${copilotOpen ? 'xl:pr-[400px]' : ''}`}>
        {mode === 'coach' && ready && (
          <FilterBar
            filters={filters}
            onChange={setFilters}
            allPlays={data.allPlays}
            clusters={data.research?.clusters.clusters ?? []}
            resultCount={data.plays.length}
            loading={data.loadingPlays}
          />
        )}
        {ready && data.error !== null && data.error !== undefined && (
          <div role="alert" className="mx-6 mt-4 rounded-lg border border-unity-red/30 bg-[#FCE8E8] px-4 py-2 text-sm text-legacy-red">
            {describeError(data.error).title}: {describeError(data.error).detail}{' '}
            <button onClick={data.reload} className="ml-2 font-semibold underline">
              Reintentar
            </button>
          </div>
        )}
        <main
          key={`${mode}-${view}`}
          aria-busy={data.loadingPlays}
          className={`cq mx-auto max-w-[1500px] animate-fade-up px-6 py-6 transition-opacity duration-300 ${data.loadingPlays && ready ? 'opacity-70' : ''}`}
        >
          {renderContent()}
        </main>
      </div>

      {copilotOpen && <CopilotPanel onClose={() => setCopilotOpen(false)} onOpenPlay={openPlay} />}
    </>
  )
}
