/** Ventanas de DEFENSIVA · identidad NFL Shield Red + Unity Red (Legacy Red en castigos) */
import { ColumnChart, ComboChart, HBarChart, ScatterPlot } from '../components/charts'
import { DownTag, FirstDownChains } from '../components/NflMotifs'
import { Badge, Card, DataTable, Insight, MetricList, SectionLabel, SourceNote, WideCard, WindowHeader } from '../components/ui'
import { countRows, groupPlays, ruleRows, summarizePlays } from '../lib/derive'
import { COVERAGE_TYPE_LABEL, fmt } from '../lib/format'
import { COLORS } from '../theme'
import type { DefenseWindow } from '../types/nfl'
import { ClusterCard, FieldActionCard, FilteredKpis, PenaltyWindow, PlaysTable, RankingWindow, pctFormat, shortCluster, ydFormat } from './common'
import type { ViewProps } from './common'

const RED = COLORS.nflRed
const UNITY = COLORS.unityRed
const last = <T,>(list: T[]): T | undefined => list[list.length - 1]

function Resumen({ overview, research, plays, onOpenPlay }: ViewProps) {
  const k = overview.kpis
  const types = countRows(overview.tipo_cobertura, COVERAGE_TYPE_LABEL).map((r) => ({ ...r, sharePct: r.share * 100 }))
  return (
    <>
      <WindowHeader accent="defense" eyebrow="Defensiva" title="Resumen general" goalpost description="Cómo defienden el pase los 32 equipos y qué muestra la selección filtrada." />
      <FilteredKpis side="defense" plays={plays} kpis={k} />
      <div className="stagger space-y-5">
        <WideCard
          accent="defense"
          title="Pulso defensivo de la temporada"
          subtitle={`api/overview · ${fmt.int(k.jugadas)} dropbacks rivales`}
          badge={<DownTag />}
          aside={
            <MetricList
              items={[
                { label: 'Yardas permitidas', value: fmt.num(k.yardas_promedio, 2), hint: 'por jugada' },
                { label: 'Quiebre de cadera', value: `${k.hip_flip_promedio_deg.toFixed(0)}°`, hint: `${fmt.int(k.cobertura_hip_flip)} jugadas medidas` },
                { label: 'Separación permitida', value: `${k.sep_objetivo_promedio_yd.toFixed(2)} yd` },
                { label: 'Completos permitidos', value: fmt.rate(k.tasa_completo) },
              ]}
            />
          }
        >
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <FirstDownChains label="Presión generada" value={k.tasa_presion} display={fmt.rate(k.tasa_presion)} color={RED} />
            <FirstDownChains label="Sacks" value={k.tasa_sack} display={fmt.rate(k.tasa_sack)} color={RED} />
            <FirstDownChains label="Intercepciones" value={k.tasa_intercepcion} display={fmt.rate(k.tasa_intercepcion)} color={UNITY} />
            <FirstDownChains label="Trampa de presión forzada" value={k.tasa_trampa_presion} display={fmt.rate(k.tasa_trampa_presion)} color={COLORS.unamGold} />
            <FirstDownChains label="Explosivas permitidas" value={k.tasa_explosiva} display={fmt.rate(k.tasa_explosiva)} color={COLORS.legacyRed} />
            <FirstDownChains label="Completos permitidos" value={k.tasa_completo} display={fmt.rate(k.tasa_completo)} color={COLORS.legacyRed} />
          </div>
        </WideCard>

        <WideCard
          accent="defense"
          title="Tipo de cobertura"
          subtitle="api/overview · tipo_cobertura"
          aside={
            <DataTable
              rows={types}
              rowKey={(r) => r.key}
              columns={[
                { key: 't', header: 'Tipo', render: (r) => r.label },
                { key: 'n', header: 'Jugadas', align: 'right', render: (r) => fmt.int(r.n), sortValue: (r) => r.n },
                { key: 's', header: '%', align: 'right', render: (r) => fmt.pct(r.sharePct), sortValue: (r) => r.sharePct },
              ]}
            />
          }
        >
          <ColumnChart data={types} xKey="label" accent={RED} series={[{ key: 'sharePct', name: '% de jugadas', color: RED, format: pctFormat }]} yFormat={pctFormat} height={220} />
        </WideCard>

        <ClusterCard research={research} focus="defense" />

        <WideCard accent="defense" title="Jugadas destacadas de la selección" subtitle="api/plays">
          <PlaysTable plays={plays} onOpenPlay={onOpenPlay} />
        </WideCard>
      </div>
    </>
  )
}

function Cobertura({ overview, plays }: ViewProps) {
  const schemes = ruleRows(overview.reglas_cobertura).map((r) => ({ ...r, presionPct: r.presion * 100, explosivaPct: r.explosiva * 100 }))
  const counts = countRows(overview.coberturas)
  const sample = groupPlays(plays, (p) => p.pff_passCoverage)
  const sampleTypes = groupPlays(plays, (p) => (p.pff_passCoverageType ? COVERAGE_TYPE_LABEL[p.pff_passCoverageType] ?? p.pff_passCoverageType : null))
  return (
    <>
      <WindowHeader accent="defense" eyebrow="Defensiva" title="Esquema de cobertura" description="Yardas, presión y explosivas permitidas por cada esquema PFF." />
      <div className="stagger space-y-5">
        <WideCard
          accent="defense"
          title="Esquemas de cobertura"
          subtitle="api/overview · reglas_cobertura (esquemas con 100+ jugadas)"
          aside={
            <>
              <SectionLabel>Uso en la temporada (todos los esquemas)</SectionLabel>
              <DataTable
                rows={counts}
                rowKey={(r) => r.key}
                maxHeight="300px"
                columns={[
                  { key: 'c', header: 'Esquema', render: (r) => r.label },
                  { key: 'n', header: 'Jugadas', align: 'right', render: (r) => fmt.int(r.n), sortValue: (r) => r.n },
                  { key: 's', header: '%', align: 'right', render: (r) => fmt.rate(r.share), sortValue: (r) => r.share },
                ]}
              />
            </>
          }
        >
          <ComboChart
            data={schemes}
            xKey="label"
            bars={[{ key: 'yds', name: 'Yardas permitidas', color: RED, format: ydFormat }]}
            lines={[
              { key: 'presionPct', name: 'Presión %', color: COLORS.legacyBlue, axis: 'right', format: pctFormat },
              { key: 'explosivaPct', name: 'Explosivas %', color: COLORS.unamGold, axis: 'right', format: pctFormat },
            ]}
            rightFormat={pctFormat}
            height={300}
            extra={(r) => `${fmt.int(r.n as number)} jugadas · quiebre ${(r.hip_flip as number).toFixed(0)}°`}
          />
        </WideCard>

        <WideCard
          accent="defense"
          title="Cobertura en la selección filtrada"
          subtitle="api/plays"
          aside={
            <>
              <SectionLabel>Hombre vs. zona en la selección</SectionLabel>
              <DataTable
                rows={sampleTypes}
                rowKey={(r) => r.label}
                columns={[
                  { key: 't', header: 'Tipo', render: (r) => r.label },
                  { key: 'n', header: 'n', align: 'right', render: (r) => r.n, sortValue: (r) => r.n },
                  { key: 'y', header: 'Yd', align: 'right', render: (r) => fmt.num(r.yds), sortValue: (r) => r.yds },
                  { key: 's', header: 'Sep.', align: 'right', render: (r) => fmt.num(r.sep), sortValue: (r) => r.sep },
                ]}
              />
            </>
          }
        >
          <HBarChart data={sample} labelKey="label" valueKey="n" name="Jugadas" color={RED} format={(v) => String(Math.round(v))} labelWidth={90} extra={(r) => `${fmt.num(r.yds as number)} yd por jugada`} />
        </WideCard>
      </div>
    </>
  )
}

function Personal({ research }: ViewProps) {
  const rows = research.clusters.clusters.map((c) => ({
    label: shortCluster(c.etiqueta),
    full: c.etiqueta,
    box: c.centroide_real.defendersInBox,
    rush: c.centroide_real.n_pass_rush,
    presion: c.centroide_real.presion,
    sack: c.tasa_sack,
    yds: c.centroide_real.playResult,
    n: c.n,
    top: Object.entries(c.cobertura_top),
  }))
  const blitz = [...rows].sort((a, b) => b.rush - a.rush)[0]
  return (
    <>
      <WindowHeader accent="defense" eyebrow="Defensiva" title="Personal defensivo y caja" description="Defensores en la caja y rushers enviados en cada arquetipo de jugada." />
      <div className="stagger space-y-5">
        <WideCard
          accent="defense"
          title="Caja y rushers por arquetipo"
          subtitle="api/research-insights · centroides K-Means"
          badge={<Badge tone="red">Centroides</Badge>}
          aside={
            blitz && (
              <>
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Arquetipo más agresivo</p>
                <p className="font-display text-2xl font-bold leading-tight text-legacy-blue">{blitz.full}</p>
                <div className="mt-3">
                  <MetricList
                    items={[
                      { label: 'En la caja', value: blitz.box.toFixed(1) },
                      { label: 'Rushers', value: blitz.rush.toFixed(1) },
                      { label: 'Presión', value: fmt.rate(blitz.presion, 0) },
                      { label: 'Sacks', value: fmt.rate(blitz.sack, 1) },
                    ]}
                  />
                </div>
                <Insight accent="defense">
                  Este perfil cede {blitz.yds.toFixed(1)} yd por jugada en {fmt.int(blitz.n)} jugadas.
                </Insight>
              </>
            )
          }
        >
          <ColumnChart
            data={rows}
            xKey="label"
            accent={RED}
            series={[
              { key: 'box', name: 'Defensores en la caja', color: RED, format: (v) => v.toFixed(2) },
              { key: 'rush', name: 'Rushers', color: UNITY, format: (v) => v.toFixed(2) },
            ]}
            height={260}
            extra={(r) => `${fmt.int(r.n as number)} jugadas`}
          />
          <SourceNote>
            personnelD y defendersInBox por jugada no están expuestos en la API; se usan los centroides de cada arquetipo.
          </SourceNote>
        </WideCard>

        <Card accent="defense" title="Coberturas más usadas por arquetipo" subtitle="api/research-insights · cobertura_top">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {rows.map((r) => (
              <div key={r.full} className="rounded-lg border border-field-line p-3 transition-all duration-300 hover:-translate-y-1 hover:border-nfl-red/50 hover:shadow-card">
                <p className="font-semibold text-legacy-blue">{r.full}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {r.top.map(([cov, n]) => (
                    <li key={cov} className="flex justify-between">
                      <span className="text-ink-muted">{cov}</span>
                      <span className="font-semibold tabular-nums">{fmt.int(n)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

function RendimientoDef({ overview, research, plays }: ViewProps) {
  const schemes = ruleRows(overview.reglas_cobertura).sort((a, b) => a.yds - b.yds)
  // Red Zone es situacional (campo corto): se muestra en gris y no compite por "mejor esquema"
  const openField = schemes.filter((s) => s.key !== 'Red Zone')
  const bestTwo = new Set(openField.slice(0, 2).map((s) => s.key))
  const trap = Object.entries(research.trampa_presion.por_cobertura)
    .filter(([, v]) => v.n >= 10)
    .map(([label, v]) => ({ label, tasa: v.tasa_sobre_presion * 100, n: v.n }))
    .sort((a, b) => b.tasa - a.tasa)
  const teams = groupPlays(plays, (p) => p.defensiveTeam).slice(0, 14)
  const s = summarizePlays(plays)
  const best = openField[0]
  const worst = last(openField)
  return (
    <>
      <WindowHeader accent="defense" eyebrow="Defensiva" title="Rendimiento defensivo" goalpost description="Qué esquemas frenan más y cuáles convierten la presión en jugadas sin primer down." />
      <div className="stagger space-y-5">
        <WideCard
          accent="defense"
          title="Yardas permitidas por esquema"
          subtitle="api/overview · reglas_cobertura · en oro, los dos que menos permiten; en gris, Red Zone (situacional)"
          aside={
            <>
              <MetricList
                items={[
                  { label: 'Menos yardas', value: best?.label ?? '–', hint: best ? `${best.yds.toFixed(2)} yd` : undefined },
                  { label: 'Más yardas', value: worst?.label ?? '–', hint: worst ? `${worst.yds.toFixed(2)} yd` : undefined },
                ]}
              />
              <Insight accent="defense">
                Red Zone permite pocas yardas porque el campo es corto, por eso queda fuera de la comparación de campo abierto.
              </Insight>
            </>
          }
        >
          <HBarChart
            data={schemes}
            labelKey="label"
            valueKey="yds"
            name="Yardas permitidas"
            color={RED}
            colorFn={(r) => (r.key === 'Red Zone' ? '#9AAABB' : bestTwo.has(r.key) ? COLORS.unamGold : RED)}
            format={(v) => v.toFixed(2)}
            labelWidth={90}
            extra={(r) => `${fmt.int(r.n as number)} jugadas · explosivas ${fmt.rate(r.explosiva as number, 0)}`}
          />
        </WideCard>

        <WideCard
          accent="defense"
          title="Presión que termina en Trampa"
          subtitle="api/research-insights · % de jugadas presionadas que no logran el primer down con receptor abierto"
          aside={<SourceNote>{research.trampa_presion.definicion}. Solo esquemas con 10+ trampas.</SourceNote>}
        >
          <HBarChart data={trap} labelKey="label" valueKey="tasa" name="Trampa %" color={UNITY} format={pctFormat} labelWidth={90} extra={(r) => `${r.n as number} trampas`} />
        </WideCard>

        <WideCard
          accent="defense"
          title="Rendimiento por defensa en la selección"
          subtitle="api/plays · yardas permitidas por jugada"
          aside={
            <MetricList
              items={[
                { label: 'Jugadas', value: fmt.int(s.n) },
                { label: 'Yd permitidas', value: fmt.num(s.yardsPerPlay) },
                { label: 'Presión', value: fmt.rate(s.pressurePct, 0) },
                { label: 'Trampas', value: fmt.rate(s.trapPct, 0) },
              ]}
            />
          }
        >
          <HBarChart data={teams} labelKey="label" valueKey="yds" name="Yd permitidas" color={RED} format={(v) => v.toFixed(1)} labelWidth={60} extra={(r) => `${r.n as number} jugadas`} />
        </WideCard>
      </div>
    </>
  )
}

function AccionDef({ overview, plays }: ViewProps) {
  const schemes = ruleRows(overview.reglas_cobertura)
  const loosest = [...schemes].sort((a, b) => b.sep_objetivo - a.sep_objetivo)[0]
  const tightest = [...schemes].sort((a, b) => a.sep_objetivo - b.sep_objetivo)[0]
  return (
    <>
      <WindowHeader accent="defense" eyebrow="Defensiva" title="Dónde se concentra la acción defensiva" description="Separación que deja cada esquema y cuánto obliga a girar la cadera." />
      <div className="stagger space-y-5">
        <WideCard
          accent="defense"
          title="Dónde se rompe la cobertura"
          subtitle="api/overview · separación vs. quiebre de cadera por esquema (tamaño = jugadas)"
          aside={
            <>
              <MetricList
                items={[
                  { label: 'Más separación', value: loosest?.label ?? '–', hint: loosest ? `${loosest.sep_objetivo.toFixed(2)} yd` : undefined },
                  { label: 'Más pegada', value: tightest?.label ?? '–', hint: tightest ? `${tightest.sep_objetivo.toFixed(2)} yd` : undefined },
                ]}
              />
              <Insight accent="defense">
                Las coberturas de hombre dejan menos separación y menos giro de cadera; las zonas profundas ceden espacio y obligan a girar más.
              </Insight>
            </>
          }
        >
          <ScatterPlot
            data={schemes}
            labelKey="label"
            x={{ key: 'sep_objetivo', name: 'Separación (yd)', format: (v) => v.toFixed(1) }}
            y={{ key: 'hip_flip', name: 'Quiebre de cadera (°)', format: (v) => v.toFixed(0) }}
            size={{ key: 'n', name: 'Jugadas' }}
            color={RED}
            colorFn={(r) => (['Cover-0', 'Cover-1', '2-Man'].includes(r.key) ? UNITY : COLORS.nflBlue)}
            height={300}
          />
          <div className="mt-2 flex gap-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-unity-red" /> Hombre
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-nfl-blue" /> Zona y otras
            </span>
          </div>
        </WideCard>
        <FieldActionCard plays={plays} side="defense" />
      </div>
    </>
  )
}

function JugadoresDef({ research, filters }: ViewProps) {
  const r = research.rankings
  return (
    <>
      <WindowHeader accent="defense" eyebrow="Defensiva" title="Clasificación de jugadores" description="Defensores en cobertura con mayor quiebre de cadera promedio." />
      <div className="stagger space-y-5">
        <RankingWindow
          accent="defense"
          highlightTeam={filters.team}
          minPlays={r.min_jugadas}
          sets={[
            {
              id: 'def-hip',
              label: 'Quiebre de cadera del defensor',
              rows: r.defensores_hip_flip,
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

function CastigosDef({ plays }: ViewProps) {
  return (
    <>
      <WindowHeader accent="alert" eyebrow="Defensiva" title="Castigos defensivos" description="Faltas del equipo que defiende dentro de la selección." />
      <div className="stagger space-y-5">
        <PenaltyWindow side="defensiva" plays={plays} />
      </div>
    </>
  )
}

export const DEFENSE_WINDOWS: Record<DefenseWindow, (p: ViewProps) => JSX.Element> = {
  'def-resumen': Resumen,
  'def-cobertura': Cobertura,
  'def-personal': Personal,
  'def-rendimiento': RendimientoDef,
  'def-accion': AccionDef,
  'def-jugadores': JugadoresDef,
  'def-castigos': CastigosDef,
}
