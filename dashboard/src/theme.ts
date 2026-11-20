/** Colores para Recharts (espejo de tailwind.config.js) */
export const COLORS = {
  nflBlue: '#013369',
  nflRed: '#D50A0A',
  legacyBlue: '#001D3C',
  impactBlue: '#0074EE',
  legacyRed: '#410000',
  unityRed: '#A00000',
  unamBlue: '#002B7A',
  unamGold: '#D59F0F',
  unamGoldBright: '#D9A500',
  white: '#FFFFFF',
  muted: '#9FB3C8',
  grid: 'rgba(255,255,255,0.08)',
} as const

export type Accent = 'offense' | 'defense' | 'gold' | 'alert'

export const ACCENT_HEX: Record<Accent, string> = {
  offense: COLORS.impactBlue,
  defense: COLORS.nflRed,
  gold: COLORS.unamGold,
  alert: COLORS.unityRed,
}

export const ACCENT_CLASS: Record<Accent, { border: string; text: string; bg: string }> = {
  offense: { border: 'border-t-impact-blue', text: 'text-impact-blue', bg: 'bg-impact-blue' },
  defense: { border: 'border-t-nfl-red', text: 'text-nfl-red', bg: 'bg-nfl-red' },
  gold: { border: 'border-t-unam-gold', text: 'text-unam-gold', bg: 'bg-unam-gold' },
  alert: { border: 'border-t-unity-red', text: 'text-unity-red', bg: 'bg-unity-red' },
}
