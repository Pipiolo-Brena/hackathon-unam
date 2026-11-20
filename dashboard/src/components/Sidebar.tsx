import { useState } from 'react'
import { NAV, SCOUT_SECTIONS, sectionOf } from '../lib/navigation'
import type { NavSection } from '../lib/navigation'
import { COLORS } from '../theme'
import type { AppMode, WindowId } from '../types/nfl'
import { Football, Goalpost } from './NflMotifs'

const SECTION_DOT: Record<NavSection['id'], string> = {
  ofensiva: 'bg-impact-blue',
  defensiva: 'bg-nfl-red',
  cruces: 'bg-unam-gold',
}

function SectionIcon({ id }: { id: NavSection['id'] }) {
  if (id === 'ofensiva') return <Football size={20} color={COLORS.impactBlue} laces={COLORS.white} />
  if (id === 'defensiva')
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.5 4 5.5v6c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10v-6l-8-3Z" fill={COLORS.nflRed} />
        <path d="M8 12h8M12 8v8" stroke={COLORS.white} strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    )
  return <Goalpost size={20} />
}

interface Props {
  mode: AppMode
  current: WindowId
  onSelect: (id: WindowId) => void
  collapsed: boolean
  mobileOpen: boolean
  onCloseMobile: () => void
}

export default function Sidebar({ mode, current, onSelect, collapsed, mobileOpen, onCloseMobile }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({ ofensiva: true, defensiva: true, cruces: true })
  const activeSection = sectionOf(current).id
  const width = collapsed ? 'lg:w-[72px]' : 'lg:w-72'

  const select = (id: WindowId) => {
    onSelect(id)
    onCloseMobile()
  }

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 top-16 z-20 bg-legacy-blue/40 lg:hidden" onClick={onCloseMobile} aria-hidden="true" />}
      <nav
        aria-label="Ventanas de análisis"
        className={`fixed bottom-0 left-0 top-16 z-30 w-72 overflow-y-auto border-r border-unam-blue-alt bg-gradient-to-b from-unam-blue to-nfl-blue text-nfl-white transition-all duration-300 ${width} ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {mode === 'scout' ? (
          <div className="p-3">
            <p className={`mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.25em] text-unam-gold-bright ${collapsed ? 'lg:hidden' : ''}`}>
              Modo Scout
            </p>
            {SCOUT_SECTIONS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => {
                  document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  onCloseMobile()
                }}
                title={s.label}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm transition-all duration-300 hover:translate-x-1 hover:bg-nfl-white/10"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-unam-gold font-display text-sm font-bold text-legacy-blue">
                  {i + 1}
                </span>
                <span className={collapsed ? 'lg:hidden' : ''}>{s.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-1 p-3">
            {NAV.map((section) => {
              const expanded = open[section.id] && !collapsed
              const single = section.items.length === 1
              return (
                <div key={section.id} className="rounded-lg">
                  <button
                    onClick={() => {
                      if (single) return select(section.items[0].id)
                      setOpen((o) => ({ ...o, [section.id]: !o[section.id] }))
                    }}
                    aria-expanded={single ? undefined : expanded}
                    title={section.label}
                    className={`flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-all duration-300 hover:bg-nfl-white/10 ${
                      activeSection === section.id ? 'bg-nfl-white/10' : ''
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-nfl-white">
                      <SectionIcon id={section.id} />
                    </span>
                    <span className={`flex-1 font-display text-lg font-bold uppercase tracking-wider ${collapsed ? 'lg:hidden' : ''}`}>
                      {section.label}
                    </span>
                    {!single && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        aria-hidden="true"
                        className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''} ${collapsed ? 'lg:hidden' : ''}`}
                      >
                        <path d="m3 5 4 4 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>

                  {!single && (
                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      } ${collapsed ? 'lg:hidden' : ''}`}
                    >
                      <ul className="overflow-hidden">
                        {section.items.map((item) => {
                          const active = item.id === current
                          return (
                            <li key={item.id}>
                              <button
                                onClick={() => select(item.id)}
                                aria-current={active ? 'page' : undefined}
                                className={`group relative ml-6 flex w-[calc(100%-1.5rem)] items-center gap-2 rounded-md py-2 pl-4 pr-2 text-left text-sm transition-all duration-300 ${
                                  active
                                    ? 'bg-nfl-white/15 font-semibold text-unam-gold-bright'
                                    : 'text-nfl-white/80 hover:translate-x-1 hover:bg-nfl-white/10 hover:text-nfl-white'
                                }`}
                              >
                                <span
                                  className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full transition-all duration-300 ${
                                    active ? 'bg-unam-gold' : `${SECTION_DOT[section.id]} opacity-0 group-hover:opacity-60`
                                  }`}
                                />
                                <span className="flex-1">{item.label}</span>
                                {active && <Football size={14} color={COLORS.unamGoldBright} laces={COLORS.unamBlue} />}
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className={`mx-3 mt-4 border-t border-nfl-white/15 px-2 pb-4 pt-3 text-[10px] leading-snug text-nfl-white/60 ${collapsed ? 'lg:hidden' : ''}`}>
          Datos: NFL Next Gen Stats y Pro Football Focus (Big Data Bowl 2023).
        </div>
      </nav>
    </>
  )
}
