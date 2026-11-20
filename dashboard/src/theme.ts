/** Colores para Recharts y SVG (espejo exacto de tailwind.config.js) */
export const COLORS = {
  nflBlue: '#013369',
  nflRed: '#D50A0A',
  white: '#FFFFFF',
  black: '#000000',
  legacyBlue: '#001D3C',
  impactBlue: '#0074EE',
  legacyRed: '#410000',
  unityRed: '#A00000',
  unamBlue: '#002B7A',
  unamBlueAlt: '#013B75',
  unamGold: '#D59F0F',
  unamGoldBright: '#D9A500',
  mist: '#F4F7FA',
  line: '#DCE3EC',
  muted: '#4A5D73',
} as const

/** Ejes, grillas y tooltips con alto contraste sobre fondo blanco */
export const CHART = {
  tick: { fill: COLORS.legacyBlue, fontSize: 12 },
  tickMuted: { fill: COLORS.muted, fontSize: 11 },
  grid: '#E3E9F1',
  axis: '#B9C6D6',
  cursor: 'rgba(1, 51, 105, 0.06)',
} as const

export type Accent = 'offense' | 'defense' | 'gold' | 'alert'

/** Identidad visual de cada ventana */
export const ACCENTS: Record<
  Accent,
  { main: string; secondary: string; soft: string; text: string; border: string; bg: string; bgSoft: string; ring: string }
> = {
  offense: {
    main: COLORS.impactBlue,
    secondary: COLORS.nflBlue,
    soft: '#E6F1FD',
    text: 'text-impact-blue',
    border: 'border-impact-blue',
    bg: 'bg-impact-blue',
    bgSoft: 'bg-[#E6F1FD]',
    ring: 'hover:border-impact-blue/60',
  },
  defense: {
    main: COLORS.nflRed,
    secondary: COLORS.unityRed,
    soft: '#FCE8E8',
    text: 'text-nfl-red',
    border: 'border-nfl-red',
    bg: 'bg-nfl-red',
    bgSoft: 'bg-[#FCE8E8]',
    ring: 'hover:border-nfl-red/60',
  },
  gold: {
    main: COLORS.unamGold,
    secondary: COLORS.unamBlue,
    soft: '#FBF3DD',
    // El oro sobre blanco no alcanza contraste AA para texto: los títulos van en azul UNAM
    text: 'text-unam-blue',
    border: 'border-unam-gold',
    bg: 'bg-unam-gold',
    bgSoft: 'bg-[#FBF3DD]',
    ring: 'hover:border-unam-gold/70',
  },
  alert: {
    main: COLORS.unityRed,
    secondary: COLORS.legacyRed,
    soft: '#F6E6E6',
    text: 'text-legacy-red',
    border: 'border-legacy-red',
    bg: 'bg-legacy-red',
    bgSoft: 'bg-[#F6E6E6]',
    ring: 'hover:border-unity-red/60',
  },
}
