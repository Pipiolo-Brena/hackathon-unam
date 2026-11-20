/** Ventanas de OFENSIVA · identidad Impact Blue + NFL Shield Blue */
import { ColumnChart, ComboChart, HBarChart } from '../components/charts'
import { DownTag, FirstDownChains } from '../components/NflMotifs'
import { Card, DataTable, Insight, MetricList, SectionLabel, SourceNote, WideCard, WindowHeader } from '../components/ui'
import { countRows, groupPlays, ruleRows, summarizePlays } from '../lib/derive'
import { fmt, FORMATION_LABEL, PASS_RESULT_LABEL } from '../lib/format'
import { COLORS } from '../theme'
import type { OffenseWindow } from '../types/nfl'
import { ClusterCard, FieldActionCard, FilteredKpis, PenaltyWindow, PlaysTable, RankingWindow, pctFormat, ydFormat } from './common'
import type { ViewProps } from './common'

const BLUE = COLORS.impactBlue
const SHIELD = COLORS.nflBlue
const last = <T,>(list: T[]): T | undefined => list[list.length - 1]

function Resumen({ overview, research, plays, onOpenPlay }: ViewProps) {
  const k = overview.kpis
  return (
    <>
      <WindowHeader accent="offense" eyebrow="Ofensiva" title="Resumen general" goalpost description="Pulso del juego aéreo en la temporada y en la selección filtrada." />
      <FilteredKpis side="offense" plays={plays} kpis={k} />
      <div className="stagger space-y-5">
        <WideCard
          accent="offense"
          title="Pulso ofensivo de la temporada"
          subtitle={`api/overview · ${fmt.int(k.juegos)} juegos, semanas ${k.semanas.join('-')}`}
          badge={<DownTag />}
          aside={
            <MetricList
              items={[
                { label: 'Yardas promedio', value: fmt.num(k.yardas_promedio, 2), hint: `mediana ${fmt.num(k.yardas_mediana)}` },
                { label: 'Tiempo al lanzar', value: `${k.tiempo_lanzar_promedio_s.toFixed(2)} s` },
                { label: 'Separación objetivo', value: `${k.sep_objetivo_promedio_yd.toFixed(2)} yd`, hint: 'al llegar el balón' },
                { label: 'Jugadas de pase', value: fmt.int(k.jugadas) },
              ]}
            />
          }
        >
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <FirstDownChains label="Pases completos" value={k.tasa_completo} display={fmt.rate(k.tasa_completo)} color={BLUE} />
            <FirstDownChains label="Jugadas explosivas (15+ yd)" value={k.tasa_explosiva} display={fmt.rate(k.tasa_explosiva)} color={BLUE} />
            <FirstDownChains label="Presión sufrida" value={k.tasa_presion} display={fmt.rate(k.tasa_presion)} color={COLORS.nflRed} />
            <FirstDownChains label="Sacks" value={k.tasa_sack} display={fmt.rate(k.tasa_sack)} color={COLORS.nflRed} />
            <FirstDownChains label="Intercepciones" value={k.tasa_intercepcion} display={fmt.rate(k.tasa_intercepcion)} color={COLORS.legacyRed} />
            <FirstDownChains label="Trampa de presión" value={k.tasa_trampa_presion} display={fmt.rate(k.tasa_trampa_presion)} color={COLORS.unamGold} />
          </div>
        </WideCard>
        <ClusterCard research={research} focus="offense" />
        <WideCard accent="offense" title="Jugadas destacadas de la selección" subtitle="api/plays · ordena por columna o abre la jugada en el Reconstructor 2D">
          <PlaysTable plays={plays} onOpenPlay={onOpenPlay} />
        </WideCard>
      </div>
    </>
  )
}

function TipoJugada({ overview, plays }: ViewProps) {
  const formations = ruleRows(overview.reglas_formacion, FORMATION_LABEL).map((r) => ({
    ...r,
    explosivaPct: r.explosiva * 100,
    presionPct: r.presion * 100,
  }))
  const counts = countRows(overview.formaciones, FORMATION_LABEL)
  const best = [...formations].sort((a, b) => b.yds - a.yds)[0]
  const pa = overview.reglas_play_action['1']
  const noPa = overview.reglas_play_action['0']
  const paRows = [
    { metric: 'Yardas/jugada', con: pa.yds, sin: noPa.yds },
    { metric: 'Separación (yd)', con: pa.sep_objetivo, sin: noPa.sep_objetivo },
    { metric: 'T. lanzar (s)', con: pa.t_throw, sin: noPa.t_throw },
    { metric: 'SOE (yd)', con: pa.soe, sin: noPa.soe },
  ]
  const results = countRows(
    plays.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p.passResult]: (acc[p.passResult] ?? 0) + 1 }), {}),
    PASS_RESULT_LABEL,
  )
  const sampleFormations = groupPlays(plays, (p) => (p.offenseFormation ? FORMATION_LABEL[p.offenseFormation] ?? p.offenseFormation : null))
  return (
    <>
      <WindowHeader accent="offense" eyebrow="Ofensiva" title="Tipo de jugada" description="Formaciones, play action y mezcla de resultados." />
      <div className="stagger space-y-5">
        <WideCard
          accent="offense"
          title="Formaciones ofensivas"
          subtitle="api/overview · reglas_formacion (temporada)"
          aside={
            <>
              <SectionLabel>Uso en la temporada</SectionLabel>
              <DataTable
                rows={counts}
                rowKey={(r) => r.key}
                columns={[
                  { key: 'f', header: 'Formación', render: (r) => r.label },
                  { key: 'n', header: 'Jugadas', align: 'right', render: (r) => fmt.int(r.n), sortValue: (r) => r.n },
                  { key: 's', header: '%', align: 'right', render: (r) => fmt.rate(r.share), sortValue: (r) => r.share },
                ]}
              />
              {best && (
                <Insight accent="offense">
                  {best.label} es la formación más productiva: {best.yds.toFixed(1)} yd por jugada y {best.explosivaPct.toFixed(0)}% de jugadas explosivas.
                </Insight>
              )}
            </>
          }
        >
          <ComboChart
            data={formations}
            xKey="label"
            bars={[{ key: 'yds', name: 'Yardas/jugada', color: BLUE, format: ydFormat }]}
            lines={[
              { key: 'explosivaPct', name: 'Explosivas %', color: COLORS.unamGold, axis: 'right', format: pctFormat },
              { key: 'presionPct', name: 'Presión %', color: COLORS.nflRed, axis: 'right', format: pctFormat },
            ]}
            rightFormat={pctFormat}
            extra={(r) => `${fmt.int(r.n as number)} jugadas · SOE ${fmt.signed(r.soe as number, 2)}`}
          />
        </WideCard>

        <WideCard
          accent="offense"
          title="Play action"
          subtitle="api/overview · reglas_play_action (temporada)"
          aside={
            <>
              <MetricList
                items={[
                  { label: 'Con play action', value: fmt.int(pa.n), hint: 'jugadas' },
                  { label: 'Sin play action', value: fmt.int(noPa.n), hint: 'jugadas' },
                  { label: 'Explosivas con PA', value: fmt.rate(pa.explosiva, 0), hint: `sin PA ${fmt.rate(noPa.explosiva, 0)}` },
                  { label: 'Presión con PA', value: fmt.rate(pa.presion, 0), hint: `sin PA ${fmt.rate(noPa.presion, 0)}` },
                ]}
              />
              <Insight accent="offense">
                El play action suma {fmt.signed(pa.yds - noPa.yds)} yd por jugada y {fmt.signed(pa.sep_objetivo - noPa.sep_objetivo, 2)} yd de separación, a
                cambio de {fmt.signed(pa.t_throw - noPa.t_throw, 2)} s más en la bolsa.
              </Insight>
            </>
          }
        >
          <ColumnChart
            data={paRows}
            xKey="metric"
            accent={BLUE}
            series={[
              { key: 'con', name: 'Con play action', color: BLUE, format: (v) => v.toFixed(2) },
              { key: 'sin', name: 'Sin play action', color: SHIELD, format: (v) => v.toFixed(2) },
            ]}
            height={260}
          />
        </WideCard>

        <WideCard
          accent="offense"
          title="Mezcla de la selección filtrada"
          subtitle="api/plays · resultado del dropback y formación"
          aside={
            <>
              <SectionLabel>Formación en la selección</SectionLabel>
              <DataTable
                rows={sampleFormations}
                rowKey={(r) => r.label}
                columns={[
                  { key: 'f', header: 'Formación', render: (r) => r.label },
                  { key: 'n', header: 'n', align: 'right', render: (r) => r.n, sortValue: (r) => r.n },
                  { key: 'y', header: 'Yd', align: 'right', render: (r) => fmt.num(r.yds), sortValue: (r) => r.yds },
                ]}
              />
            </>
          }
        >
          <HBarChart data={results} labelKey="label" valueKey="n" name="Jugadas" color={BLUE} format={(v) => String(Math.round(v))} />
          <SourceNote>Las jugadas destacadas se eligieron por ser explosivas, de alta separación, con quiebre de cadera o con trampa de presión: no son una muestra representativa.</SourceNote>
        </WideCard>
      </div>
    </>
  )
}

function Rendimiento({ overview, plays }: ViewProps) {
  const curve = overview.curva_tiempo_bolsa.map((c) => ({
    label: `${c.t_desde_s.toFixed(1)}-${c.t_hasta_s.toFixed(1)}s`,
    n: c.n,
    yds: c.yds,
    completo: c.completo * 100,
    presion: c.presion * 100,
    explosiva: c.explosiva * 100,
  }))
  const peak = [...curve].sort((a, b) => b.yds - a.yds)[0]
  const pressureCross = curve.find((c) => c.presion >= 50)
  const rules = ruleRows(overview.reglas_tiempo_bolsa)
  const teams = groupPlays(plays, (p) => p.possessionTeam).slice(0, 14)
  const s = summarizePlays(plays)
  return (
    <>
      <WindowHeader accent="offense" eyebrow="Ofensiva" title="Rendimiento" goalpost description="Cómo cambia el resultado según el tiempo que el mariscal pasa en la bolsa." />
      <div className="stagger space-y-5">
        <WideCard
          accent="offense"
          title="Curva de tiempo en bolsa"
          subtitle="api/overview · curva_tiempo_bolsa (temporada)"
          aside={
            <>
              <MetricList
                items={[
                  { label: 'Pico de yardas', value: peak ? `${peak.yds.toFixed(1)} yd` : '–', hint: peak?.label },
                  { label: 'Presión ≥ 50%', value: pressureCross?.label ?? '–', hint: 'primer tramo' },
                  { label: 'Completos al inicio', value: curve[0] ? `${curve[0].completo.toFixed(0)}%` : '–', hint: curve[0]?.label },
                  { label: 'Completos al final', value: last(curve) ? `${last(curve)!.completo.toFixed(0)}%` : '–', hint: last(curve)?.label },
                ]}
              />
              <Insight accent="offense">
                Lanzar rápido asegura el pase completo; esperar hasta el pico gana más yardas, pero después la presión se dispara y el rendimiento cae.
              </Insight>
            </>
          }
        >
          <ComboChart
            data={curve}
            xKey="label"
            bars={[{ key: 'yds', name: 'Yardas/jugada', color: BLUE, format: ydFormat }]}
            lines={[
              { key: 'completo', name: 'Completos %', color: SHIELD, axis: 'right', format: pctFormat },
              { key: 'presion', name: 'Presión %', color: COLORS.nflRed, axis: 'right', format: pctFormat },
            ]}
            rightFormat={pctFormat}
            height={300}
            extra={(r) => `${fmt.int(r.n as number)} jugadas`}
          />
        </WideCard>

        <Card accent="offense" title="Reglas por tiempo en bolsa" subtitle="api/overview · reglas_tiempo_bolsa">
          <DataTable
            rows={rules}
            rowKey={(r) => r.key}
            columns={[
              { key: 'k', header: 'Tramo', render: (r) => <span className="font-semibold">{r.label} s</span> },
              { key: 'n', header: 'Jugadas', align: 'right', render: (r) => fmt.int(r.n), sortValue: (r) => r.n },
              { key: 'y', header: 'Yd/jugada', align: 'right', render: (r) => r.yds.toFixed(2), sortValue: (r) => r.yds },
              { key: 'e', header: 'Explosivas', align: 'right', render: (r) => fmt.rate(r.explosiva), sortValue: (r) => r.explosiva },
              { key: 'p', header: 'Presión', align: 'right', render: (r) => fmt.rate(r.presion), sortValue: (r) => r.presion },
              { key: 's', header: 'Separación', align: 'right', render: (r) => `${r.sep_objetivo.toFixed(2)} yd`, sortValue: (r) => r.sep_objetivo },
              { key: 'soe', header: 'SOE', align: 'right', render: (r) => fmt.signed(r.soe, 2), sortValue: (r) => r.soe },
              { key: 't', header: 'Trampa', align: 'right', render: (r) => fmt.rate(r.trampa), sortValue: (r) => r.trampa },
            ]}
          />
        </Card>

        <WideCard
          accent="offense"
          title="Rendimiento por equipo en la selección"
          subtitle="api/plays · yardas por jugada del equipo con el balón"
          aside={
            <MetricList
              items={[
                { label: 'Jugadas', value: fmt.int(s.n) },
                { label: 'Yd/jugada', value: fmt.num(s.yardsPerPlay) },
                { label: 'SOE prom.', value: fmt.signed(s.soe, 2), hint: 'yd sobre lo esperado' },
                { label: 'Separación', value: s.separation === null ? '–' : `${s.separation.toFixed(1)} yd` },
              ]}
            />
          }
        >
          <HBarChart data={teams} labelKey="label" valueKey="yds" name="Yd/jugada" color={BLUE} format={(v) => v.toFixed(1)} labelWidth={60} extra={(r) => `${r.n as number} jugadas`} />
        </WideCard>
      </div>
    </>
  )
}

function Accion({ plays }: ViewProps) {
  const zones = groupPlays(plays, (p) => p.zona_campo).map((z) => ({ ...z, sepV: z.sep ?? 0, soeV: z.soe ?? 0 }))
  const targets = groupPlays(plays, (p) => p.target_name).slice(0, 10)
  return (
    <>
      <WindowHeader accent="offense" eyebrow="Ofensiva" title="Dónde se concentra la acción" description="Línea de golpeo, avance y receptores objetivo de la selección." />
      <div className="stagger space-y-5">
        <FieldActionCard plays={plays} side="offense" />
        <WideCard
          accent="offense"
          title="Separación por zona del campo"
          subtitle="api/plays · separación del objetivo y SOE al llegar el balón"
          aside={
            <>
              <SectionLabel>Receptores más buscados</SectionLabel>
              <DataTable
                rows={targets}
                rowKey={(r) => r.label}
                columns={[
                  { key: 'r', header: 'Receptor', render: (r) => r.label },
                  { key: 'n', header: 'n', align: 'right', render: (r) => r.n, sortValue: (r) => r.n },
                  { key: 's', header: 'Sep.', align: 'right', render: (r) => fmt.num(r.sep), sortValue: (r) => r.sep },
                ]}
              />
            </>
          }
        >
          <ColumnChart
            data={zones}
            xKey="label"
            accent={BLUE}
            series={[
              { key: 'sepV', name: 'Separación (yd)', color: BLUE, format: ydFormat },
              { key: 'soeV', name: 'SOE (yd)', color: COLORS.unamGold, format: (v) => fmt.signed(v, 2) },
            ]}
            extra={(r) => `${r.n as number} jugadas`}
          />
        </WideCard>
      </div>
    </>
  )
}

function Proteccion({ overview, research }: ViewProps) {
  const pocket = ruleRows(overview.reglas_tiempo_bolsa).sort((a, b) => a.t_throw - b.t_throw)
  const formations = ruleRows(overview.reglas_formacion, FORMATION_LABEL)
    .map((r) => ({ ...r, presionPct: r.presion * 100 }))
    .sort((a, b) => b.presionPct - a.presionPct)
  const trap = research.trampa_presion
  const byResult = Object.entries(trap.por_resultado).map(([k, n]) => ({ label: PASS_RESULT_LABEL[k] ?? k, n }))
  const byTeam = Object.entries(trap.por_equipo_ofensivo)
    .map(([team, v]) => ({ label: team, tasa: v.tasa_sobre_presion * 100, n: v.n }))
    .sort((a, b) => b.tasa - a.tasa)
  return (
    <>
      <WindowHeader accent="offense" eyebrow="Ofensiva" title="Protección (línea ofensiva)" description="Presión sufrida según el tiempo en la bolsa, la formación y la Trampa de Presión." />
      <div className="stagger space-y-5">
        <WideCard
          accent="offense"
          title="Presión según tiempo en bolsa"
          subtitle="api/overview · reglas_tiempo_bolsa"
          badge={<DownTag text="3RD & LONG" />}
          aside={
            <Insight accent="offense">
              Con más de 4 s en la bolsa la presión llega en {fmt.rate(overview.reglas_tiempo_bolsa['>4']?.presion ?? null, 0)} de las jugadas, contra{' '}
              {fmt.rate(overview.reglas_tiempo_bolsa['<=2.0']?.presion ?? null, 0)} al lanzar en 2 s o menos.
            </Insight>
          }
        >
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {pocket.map((r) => (
              <FirstDownChains key={r.key} label={`${r.label} s · ${fmt.int(r.n)} jugadas`} value={r.presion} display={fmt.rate(r.presion, 0)} color={COLORS.nflRed} />
            ))}
          </div>
        </WideCard>

        <WideCard
          accent="offense"
          title="Presión sufrida por formación"
          subtitle="api/overview · reglas_formacion"
          aside={
            <>
              <MetricList
                items={[
                  { label: 'Más protegida', value: last(formations)?.label ?? '–', hint: fmt.pct(last(formations)?.presionPct ?? null, 0) },
                  { label: 'Más presionada', value: formations[0]?.label ?? '–', hint: fmt.pct(formations[0]?.presionPct ?? null, 0) },
                ]}
              />
              <SourceNote>Los datos PFF por bloqueador (pff_hitAllowed, pff_sackAllowed, pff_blockType) aún no están expuestos en la API.</SourceNote>
            </>
          }
        >
          <HBarChart data={formations} labelKey="label" valueKey="presionPct" name="Presión %" color={BLUE} format={pctFormat} extra={(r) => `${fmt.int(r.n as number)} jugadas`} />
        </WideCard>

        <WideCard
          accent="offense"
          title="Trampa de Presión"
          subtitle="api/research-insights · presión + receptor abierto + sin primer down"
          aside={
            <>
              <MetricList
                items={[
                  { label: 'Jugadas', value: fmt.int(trap.n), hint: `${trap.pct_de_jugadas.toFixed(1)}% del total` },
                  { label: 'De las presionadas', value: `${trap.pct_de_jugadas_con_presion.toFixed(1)}%` },
                  { label: 'Yardas faltantes', value: `${trap.yardas_faltantes_promedio.toFixed(1)} yd`, hint: 'para el primer down' },
                  { label: 'Separación', value: `${trap.sep_objetivo_promedio.toFixed(1)} yd`, hint: 'del receptor objetivo' },
                ]}
              />
              <Insight accent="offense">
                Con presión y separación alta, las jugadas que sí convierten ganan {trap.comparacion_presion_sep_alta.presion_sep_alta_convierte_yds.toFixed(1)} yd;
                las que caen en la trampa promedian {trap.comparacion_presion_sep_alta.trampa_yds.toFixed(1)} yd.
              </Insight>
            </>
          }
        >
          <SectionLabel>Resultado de las jugadas en trampa</SectionLabel>
          <ColumnChart data={byResult} xKey="label" series={[{ key: 'n', name: 'Jugadas', color: BLUE }]} height={200} />
          <SectionLabel>Equipos con más trampas (% sobre jugadas presionadas)</SectionLabel>
          <HBarChart data={byTeam} labelKey="label" valueKey="tasa" name="Trampa %" color={COLORS.unamGold} format={pctFormat} labelWidth={60} extra={(r) => `${r.n as number} jugadas`} />
          <SourceNote>{trap.definicion}</SourceNote>
        </WideCard>
      </div>
    </>
  )
}

function Jugadores({ research, filters }: ViewProps) {
  const r = research.rankings
  return (
    <>
      <WindowHeader accent="offense" eyebrow="Ofensiva" title="Clasificación de jugadores" description="Receptores que más se separan y que más obligan a girar la cadera al defensor." />
      <div className="stagger space-y-5">
        <RankingWindow
          accent="offense"
          highlightTeam={filters.team}
          minPlays={r.min_jugadas}
          sets={[
            {
              id: 'soe',
              label: 'Separación sobre lo esperado',
              rows: r.receptores_soe,
              metric: 'SOE',
              format: (v) => `${fmt.signed(v, 2)} yd`,
              note: research.metodologia.soe_nota,
            },
            {
              id: 'hip',
              label: 'Quiebre de cadera inducido',
              rows: r.receptores_hip_flip_inducido,
              metric: 'Quiebre',
              format: (v) => `${v.toFixed(1)}°`,
              note: research.metodologia.hip_flip_nota,
            },
          ]}
        />
      </div>
    </>
  )
}

function Castigos({ plays }: ViewProps) {
  return (
    <>
      <WindowHeader accent="alert" eyebrow="Ofensiva" title="Castigos ofensivos" description="Faltas del equipo con el balón dentro de la selección." />
      <div className="stagger space-y-5">
        <PenaltyWindow side="ofensiva" plays={plays} />
      </div>
    </>
  )
}

export const OFFENSE_WINDOWS: Record<OffenseWindow, (p: ViewProps) => JSX.Element> = {
  'off-resumen': Resumen,
  'off-tipo': TipoJugada,
  'off-rendimiento': Rendimiento,
  'off-accion': Accion,
  'off-proteccion': Proteccion,
  'off-jugadores': Jugadores,
  'off-castigos': Castigos,
}
