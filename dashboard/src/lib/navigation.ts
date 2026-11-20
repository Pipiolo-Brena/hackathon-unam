import type { Accent } from '../theme'
import type { WindowId } from '../types/nfl'

export interface NavItem {
  id: WindowId
  label: string
}

export interface NavSection {
  id: 'ofensiva' | 'defensiva' | 'cruces'
  label: string
  accent: Accent
  items: NavItem[]
}

export const NAV: NavSection[] = [
  {
    id: 'ofensiva',
    label: 'Ofensiva',
    accent: 'offense',
    items: [
      { id: 'off-resumen', label: 'Resumen general' },
      { id: 'off-tipo', label: 'Tipo de jugada' },
      { id: 'off-rendimiento', label: 'Rendimiento' },
      { id: 'off-accion', label: 'Dónde se concentra la acción' },
      { id: 'off-proteccion', label: 'Protección (línea ofensiva)' },
      { id: 'off-jugadores', label: 'Clasificación de jugadores' },
      { id: 'off-castigos', label: 'Castigos ofensivos' },
    ],
  },
  {
    id: 'defensiva',
    label: 'Defensiva',
    accent: 'defense',
    items: [
      { id: 'def-resumen', label: 'Resumen general' },
      { id: 'def-cobertura', label: 'Esquema de cobertura' },
      { id: 'def-personal', label: 'Personal defensivo y caja' },
      { id: 'def-rendimiento', label: 'Rendimiento defensivo' },
      { id: 'def-accion', label: 'Dónde se concentra la acción defensiva' },
      { id: 'def-jugadores', label: 'Clasificación de jugadores' },
      { id: 'def-castigos', label: 'Castigos defensivos' },
    ],
  },
  {
    id: 'cruces',
    label: 'Cruces',
    accent: 'gold',
    items: [{ id: 'cruces', label: 'Ofensiva vs. Defensiva' }],
  },
]

export const SCOUT_SECTIONS = [
  { id: 'scout-conferencias', label: 'AFC vs. NFC' },
  { id: 'scout-tabla', label: 'Tabla de jugadores y equipos' },
  { id: 'scout-comparador', label: 'Comparador' },
  { id: 'scout-reconstructor', label: 'Reconstructor 2D' },
] as const

export function sectionOf(id: WindowId): NavSection {
  return NAV.find((s) => s.items.some((i) => i.id === id)) ?? NAV[0]
}
