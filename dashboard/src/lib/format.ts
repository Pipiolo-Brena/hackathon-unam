/** Formateadores con guion para valores ausentes */
export const fmt = {
  num(v: number | null | undefined, digits = 1): string {
    return v === null || v === undefined || Number.isNaN(v) ? '–' : v.toFixed(digits)
  },
  /** tasa 0-1 → "37.6%" */
  rate(v: number | null | undefined, digits = 1): string {
    return v === null || v === undefined || Number.isNaN(v) ? '–' : `${(v * 100).toFixed(digits)}%`
  },
  /** valor ya en porcentaje → "37.6%" */
  pct(v: number | null | undefined, digits = 1): string {
    return v === null || v === undefined || Number.isNaN(v) ? '–' : `${v.toFixed(digits)}%`
  },
  int(v: number | null | undefined): string {
    return v === null || v === undefined || Number.isNaN(v) ? '–' : Math.round(v).toLocaleString('es-MX')
  },
  signed(v: number | null | undefined, digits = 1): string {
    if (v === null || v === undefined || Number.isNaN(v)) return '–'
    return `${v > 0 ? '+' : ''}${v.toFixed(digits)}`
  },
}

export const PASS_RESULT_LABEL: Record<string, string> = {
  C: 'Completo',
  I: 'Incompleto',
  S: 'Sack',
  IN: 'Intercepción',
  R: 'Scramble',
}

export const TAG_LABEL: Record<string, string> = {
  explosiva: 'Explosiva (15+ yd)',
  soe: 'Separación sobre lo esperado',
  hip_flip: 'Quiebre de cadera',
  trampa_presion: 'Trampa de presión',
}

export const FORMATION_LABEL: Record<string, string> = {
  SHOTGUN: 'Shotgun',
  EMPTY: 'Empty',
  SINGLEBACK: 'Singleback',
  I_FORM: 'I-Form',
  PISTOL: 'Pistol',
  JUMBO: 'Jumbo',
  WILDCAT: 'Wildcat',
  nan: 'Sin dato',
}

export const COVERAGE_TYPE_LABEL: Record<string, string> = { Zone: 'Zona', Man: 'Hombre', Other: 'Otra' }
