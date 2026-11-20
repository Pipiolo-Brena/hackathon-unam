import type { DashboardFilters, GameInfo, QuarterFilter } from '../types/nfl'
import type { ViewMode } from './ui'

interface Props {
  games: GameInfo[]
  filters: DashboardFilters
  onFilters: (f: DashboardFilters) => void
  mode: ViewMode
  onMode: (m: ViewMode) => void
  copilotOpen: boolean
  onToggleCopilot: () => void
}

const selectCls =
  'rounded border border-nfl-blue bg-gridiron-black px-2 py-1.5 text-sm text-nfl-white focus:border-unam-gold focus:outline-none'

export default function Header({ games, filters, onFilters, mode, onMode, copilotOpen, onToggleCopilot }: Props) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-unam-blue bg-legacy-blue/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4">
        <div className="mr-auto flex items-center gap-3">
          <span className="h-9 w-1.5 rounded bg-gradient-to-b from-unam-gold to-unam-gold-bright" />
          <div className="leading-none">
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
              NFL <span className="text-unam-gold">War Room</span>
            </h1>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-[var(--muted)]">Big Data Bowl · UNAM</p>
          </div>
        </div>

        <label className="hidden items-center gap-2 text-xs text-[var(--muted)] md:flex">
          Partido
          <select className={selectCls} value={filters.gameId} onChange={(e) => onFilters({ ...filters, gameId: e.target.value })}>
            {games.map((g) => (
              <option key={g.gameId} value={g.gameId}>
                {g.label}
              </option>
            ))}
          </select>
        </label>

        <label className="hidden items-center gap-2 text-xs text-[var(--muted)] md:flex">
          Cuarto
          <select
            className={selectCls}
            value={filters.quarter}
            onChange={(e) => onFilters({ ...filters, quarter: Number(e.target.value) as QuarterFilter })}
          >
            <option value={0}>Todos</option>
            {[1, 2, 3, 4].map((q) => (
              <option key={q} value={q}>
                Q{q}
              </option>
            ))}
          </select>
        </label>

        <div role="group" aria-label="Modo de vista" className="flex overflow-hidden rounded border border-nfl-blue text-xs font-semibold">
          {(['coach', 'broadcast'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onMode(m)}
              aria-pressed={mode === m}
              className={`px-3 py-1.5 uppercase tracking-wider transition ${
                mode === m ? 'bg-unam-gold text-gridiron-black' : 'text-[var(--muted)] hover:text-nfl-white'
              }`}
            >
              {m === 'coach' ? 'Coach' : 'Broadcast'}
            </button>
          ))}
        </div>

        <button
          onClick={onToggleCopilot}
          aria-pressed={copilotOpen}
          className={`rounded border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
            copilotOpen
              ? 'border-unam-gold bg-unam-gold/15 text-unam-gold shadow-glow'
              : 'border-impact-blue text-impact-blue hover:bg-impact-blue/10'
          }`}
        >
          {copilotOpen ? 'Ocultar Copiloto' : 'Copiloto Nova'}
        </button>
      </div>
    </header>
  )
}
