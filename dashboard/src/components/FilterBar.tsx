import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { activeFilterCount } from '../lib/derive'
import { PASS_RESULT_LABEL, TAG_LABEL } from '../lib/format'
import { teamInfo } from '../lib/nflTeams'
import type { ClusterApi, CoachFilters, ClusterId, FeaturedPlay, PassResult, PlayTag } from '../types/nfl'
import { EMPTY_FILTERS } from '../types/nfl'
import { FootballLoader } from './NflMotifs'

const selectCls =
  'h-8 min-w-0 rounded-lg border border-field-line bg-nfl-white px-2.5 text-sm text-legacy-blue transition-all duration-300 hover:border-nfl-blue/50 focus:border-unam-gold focus:outline-none focus:ring-2 focus:ring-unam-gold/30'

function Field({ label, server, children }: { label: string; server?: boolean; children: ReactNode }) {
  return (
    <label className="flex min-w-[100px] flex-1 flex-col gap-1">
      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
        {label}
        {server && (
          <span title="Este filtro consulta api/plays en el servidor" className="h-1.5 w-1.5 rounded-full bg-unam-gold" />
        )}
      </span>
      {children}
    </label>
  )
}

interface Props {
  filters: CoachFilters
  onChange: (f: CoachFilters) => void
  allPlays: FeaturedPlay[]
  clusters: ClusterApi[]
  resultCount: number
  loading: boolean
}

export default function FilterBar({ filters, onChange, allPlays, clusters, resultCount, loading }: Props) {
  const set = <K extends keyof CoachFilters>(key: K, value: CoachFilters[K]) => onChange({ ...filters, [key]: value })

  const options = useMemo(() => {
    const games = new Map<number, { week: number; teams: Set<string> }>()
    for (const p of allPlays) {
      const g = games.get(p.gameId) ?? { week: p.week, teams: new Set<string>() }
      g.teams.add(p.possessionTeam)
      g.teams.add(p.defensiveTeam)
      games.set(p.gameId, g)
    }
    const teams = [...new Set(allPlays.flatMap((p) => [p.possessionTeam, p.defensiveTeam]))].sort()
    return {
      games: [...games.entries()]
        .map(([id, g]) => ({ id, week: g.week, label: `S${g.week} · ${[...g.teams].sort().join(' – ')}` }))
        .sort((a, b) => a.week - b.week || a.label.localeCompare(b.label)),
      afc: teams.filter((t) => teamInfo(t)?.conference === 'AFC'),
      nfc: teams.filter((t) => teamInfo(t)?.conference === 'NFC'),
      coverages: [...new Set(allPlays.map((p) => p.pff_passCoverage).filter((c): c is string => Boolean(c)))].sort(),
    }
  }, [allPlays])

  const active = activeFilterCount(filters)

  return (
    <div className="sticky top-16 z-20 border-b border-field-line bg-nfl-white/95 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-6 pt-2">
        <span className="font-display text-sm font-bold uppercase tracking-wider text-legacy-blue">Filtros</span>
        {loading ? (
          <FootballLoader label="Actualizando…" />
        ) : (
          <p className="text-sm text-ink-muted" aria-live="polite">
            <span className="font-display text-lg font-bold text-legacy-blue">{resultCount}</span> de {allPlays.length} jugadas destacadas
          </p>
        )}
        {active > 0 && (
          <button
            onClick={() => onChange(EMPTY_FILTERS)}
            className="rounded-md border border-nfl-blue/30 px-2.5 py-0.5 text-xs font-semibold text-nfl-blue transition-all duration-300 hover:-translate-y-0.5 hover:border-nfl-blue hover:bg-field-mist"
          >
            Limpiar ({active})
          </button>
        )}
        <p className="ml-auto text-[11px] text-ink-muted">
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-unam-gold align-middle" />
          consulta api/plays · el resto filtra en el navegador · los agregados de temporada no cambian
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-2.5 px-6 pb-2.5 pt-1.5">
        <Field label="Partido">
          <select className={selectCls} value={filters.gameId} onChange={(e) => set('gameId', Number(e.target.value))}>
            <option value={0}>Todos</option>
            {options.games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cuarto">
          <select className={selectCls} value={filters.quarter} onChange={(e) => set('quarter', Number(e.target.value))}>
            <option value={0}>Todos</option>
            {[1, 2, 3, 4].map((q) => (
              <option key={q} value={q}>
                Q{q}
              </option>
            ))}
            <option value={5}>Tiempo extra</option>
          </select>
        </Field>
        <Field label="Down">
          <select className={selectCls} value={filters.down} onChange={(e) => set('down', Number(e.target.value))}>
            <option value={0}>Todos</option>
            {[1, 2, 3, 4].map((d) => (
              <option key={d} value={d}>
                {d}.º down
              </option>
            ))}
          </select>
        </Field>
        <Field label="Resultado">
          <select className={selectCls} value={filters.passResult} onChange={(e) => set('passResult', e.target.value as PassResult | '')}>
            <option value="">Todos</option>
            {Object.entries(PASS_RESULT_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Equipo" server>
          <select className={selectCls} value={filters.team} onChange={(e) => set('team', e.target.value)}>
            <option value="">Todos</option>
            <optgroup label="AFC">
              {options.afc.map((t) => (
                <option key={t} value={t}>
                  {t} · {teamInfo(t)?.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="NFC">
              {options.nfc.map((t) => (
                <option key={t} value={t}>
                  {t} · {teamInfo(t)?.name}
                </option>
              ))}
            </optgroup>
          </select>
        </Field>
        <Field label="Cobertura" server>
          <select className={selectCls} value={filters.coverage} onChange={(e) => set('coverage', e.target.value)}>
            <option value="">Todas</option>
            {options.coverages.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Etiqueta" server>
          <select className={selectCls} value={filters.tag} onChange={(e) => set('tag', e.target.value as PlayTag | '')}>
            <option value="">Todas</option>
            {Object.entries(TAG_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Arquetipo" server>
          <select className={selectCls} value={filters.clusterId} onChange={(e) => set('clusterId', Number(e.target.value) as ClusterId | -1)}>
            <option value={-1}>Todos</option>
            {clusters.map((c) => (
              <option key={c.cluster} value={c.cluster}>
                {c.etiqueta}
              </option>
            ))}
          </select>
        </Field>

      </div>
    </div>
  )
}
