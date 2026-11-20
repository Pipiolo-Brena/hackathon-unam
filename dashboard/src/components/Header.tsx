import type { AppMode } from '../types/nfl'
import { Goalpost } from './NflMotifs'

export type ApiStatus = 'loading' | 'ok' | 'error' | 'mock'

const STATUS: Record<ApiStatus, { label: string; dot: string }> = {
  loading: { label: 'Conectando…', dot: 'bg-unam-gold-bright animate-pulse' },
  ok: { label: 'API conectada', dot: 'bg-emerald-400' },
  error: { label: 'API sin respuesta', dot: 'bg-nfl-red' },
  mock: { label: 'Datos locales', dot: 'bg-unam-gold' },
}

interface Props {
  mode: AppMode
  onMode: (m: AppMode) => void
  status: ApiStatus
  copilotOpen: boolean
  onToggleCopilot: () => void
  onToggleSidebar: () => void
}

export default function Header({ mode, onMode, status, copilotOpen, onToggleCopilot, onToggleSidebar }: Props) {
  const s = STATUS[status]
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b-2 border-unam-gold bg-gradient-to-r from-nfl-blue via-nfl-blue to-unam-blue text-nfl-white shadow-lg">
      <div className="flex h-full items-center gap-3 px-4">
        <button
          onClick={onToggleSidebar}
          aria-label="Mostrar u ocultar menú"
          className="rounded-md p-2 transition-colors duration-300 hover:bg-nfl-white/10"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="mr-auto flex items-center gap-2.5">
          <Goalpost size={30} />
          <div className="leading-none">
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
              NFL War Room <span className="text-unam-gold-bright">UNAM</span>
            </h1>
            <p className="mt-0.5 hidden text-[10px] uppercase tracking-[0.25em] text-nfl-white/70 sm:block">
              Big Data Bowl 2023 · Semanas 1-8
            </p>
          </div>
        </div>

        <span className="hidden items-center gap-2 rounded-full bg-nfl-white/10 px-3 py-1 text-xs md:inline-flex" role="status">
          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
          {s.label}
        </span>

        <div role="radiogroup" aria-label="Modo de análisis" className="flex rounded-lg bg-legacy-blue/60 p-1 text-xs font-bold uppercase tracking-wider">
          {(['coach', 'scout'] as const).map((m) => {
            const active = mode === m
            const activeCls = m === 'scout' ? 'bg-unam-gold text-legacy-blue shadow-gold' : 'bg-nfl-white text-nfl-blue shadow'
            return (
              <button
                key={m}
                role="radio"
                aria-checked={active}
                onClick={() => onMode(m)}
                className={`rounded-md px-3 py-1.5 transition-all duration-300 ${active ? activeCls : 'text-nfl-white/75 hover:text-nfl-white'}`}
              >
                Modo {m === 'coach' ? 'Coach' : 'Scout'}
              </button>
            )
          })}
        </div>

        <button
          onClick={onToggleCopilot}
          aria-pressed={copilotOpen}
          className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 ${
            copilotOpen ? 'border-unam-gold bg-unam-gold text-legacy-blue' : 'border-nfl-white/40 text-nfl-white hover:border-unam-gold hover:text-unam-gold-bright'
          }`}
        >
          <span className="hidden sm:inline">{copilotOpen ? 'Ocultar copiloto' : 'Copiloto Nova'}</span>
          <span className="sm:hidden">Nova</span>
        </button>
      </div>
    </header>
  )
}
