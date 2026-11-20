import { COLORS } from '../theme'
import type { KpiItem, OffenseSectionData } from '../types/nfl'
import { ColumnChart, HBarChart } from '../components/charts'
import {
  FieldZonesBlock,
  PassMapBlock,
  PenaltiesBlock,
  PlayMixBlock,
  PlayerClassificationBlock,
} from '../components/modules/Shared'
import { Card, CoachOnly, DataTable, Insight, KpiRow, SectionLabel, StatGrid } from '../components/ui'

export default function OffenseView({ data, kpis }: { data: OffenseSectionData; kpis: KpiItem[] }) {
  const { tipoDeJugada: t, rendimiento: r, concentracionAccion: c, proteccionLineaOfensiva: p } = data
  const s = r.summary
  return (
    <div className="space-y-4">
      <KpiRow items={kpis} accent="offense" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Tipo de jugada" subtitle="Dropback, formación, play action y situación" accent="offense" badge="Módulo 1">
          <SectionLabel>Resultado del dropback</SectionLabel>
          <HBarChart data={t.passResultMix} labelKey="label" valueKey="value" name="Jugadas" color={COLORS.impactBlue} height={170} labelWidth={95} />
          <PlayMixBlock title="Formación" rows={t.formations} accent="offense" />
          <PlayMixBlock title="Play action" rows={t.playAction} accent="offense" />
          <PlayMixBlock title="Tipo de dropback" rows={t.dropbackTypes} accent="offense" />
          <CoachOnly>
            <PlayMixBlock title="Personal ofensivo" rows={t.personnel} accent="offense" />
            <PlayMixBlock title="Down" rows={t.downSituation} accent="offense" />
          </CoachOnly>
        </Card>

        <Card title="Rendimiento" subtitle="Eficiencia, tiempo al lanzamiento y efecto de la presión" accent="offense" badge="Módulo 2">
          <StatGrid
            items={[
              { label: 'Yd / jugada', value: s.yardsPerPlay.toFixed(1) },
              { label: 'Éxito', value: `${s.successRate}%` },
              { label: 'Completos', value: `${s.completionPct}%` },
              { label: 'Sacks', value: `${s.sackRate}%` },
              { label: 'INT', value: `${s.intRate}%` },
              { label: 'Presión', value: `${s.pressureRate}%` },
              { label: 'T. lanzam.', value: `${s.avgTimeToThrow}s` },
            ]}
          />
          <SectionLabel>Yardas por jugada y % de éxito por cuarto</SectionLabel>
          <ColumnChart
            data={r.byQuarter}
            xKey="quarter"
            series={[
              { key: 'yardsPerPlay', name: 'Yd/jugada', color: COLORS.impactBlue },
              { key: 'successRate', name: '% éxito', color: COLORS.unamBlue },
            ]}
            height={170}
          />
          <SectionLabel>% de completos según tiempo al lanzamiento</SectionLabel>
          <ColumnChart data={r.timeToThrow} xKey="bucket" series={[{ key: 'completionPct', name: '% completos', color: COLORS.impactBlue }]} height={160} />
          <SectionLabel>Con y sin presión</SectionLabel>
          <DataTable
            rows={r.pressureSplit}
            columns={[
              { header: 'Situación', render: (x) => x.label },
              { header: 'Jugadas', align: 'right', render: (x) => x.plays },
              { header: 'Comp.', align: 'right', render: (x) => `${x.completionPct}%` },
              { header: 'Yd/jug', align: 'right', render: (x) => x.yardsPerPlay.toFixed(1) },
            ]}
          />
          <CoachOnly>
            <SectionLabel>Por equipo</SectionLabel>
            <DataTable
              rows={r.byTeam}
              columns={[
                { header: 'Equipo', render: (x) => x.team },
                { header: 'Jugadas', align: 'right', render: (x) => x.plays },
                { header: 'Yd/jug', align: 'right', render: (x) => x.yardsPerPlay.toFixed(1) },
                { header: 'Éxito', align: 'right', render: (x) => `${x.successRate}%` },
              ]}
            />
          </CoachOnly>
        </Card>

        <Card title="Dónde se concentra la acción" subtitle="Zona del campo, profundidad y dirección" accent="offense" badge="Módulo 3">
          <FieldZonesBlock rows={c.fieldZones} accent="offense" metricLabel="Yardas por jugada" />
          <div className="mt-4">
            <PassMapBlock cells={c.passMap} accent="offense" />
          </div>
          <Insight>La zona roja y la línea de gol reducen el rendimiento a 4.8 y 1.5 yardas por jugada.</Insight>
        </Card>

        <Card title="Protección (línea ofensiva)" subtitle="Presión permitida por posición y tipo de bloqueo" accent="offense" badge="Módulo 4">
          <SectionLabel>Presión permitida y derrotas del bloqueador (%)</SectionLabel>
          <ColumnChart
            data={p.byPosition}
            xKey="position"
            series={[
              { key: 'pressureAllowedPct', name: '% presión permitida', color: COLORS.impactBlue },
              { key: 'beatenPct', name: '% derrotado', color: COLORS.unamBlue },
            ]}
            height={180}
          />
          <SectionLabel>Presión permitida por tipo de bloqueo (%)</SectionLabel>
          <HBarChart
            data={p.byBlockType}
            labelKey="label"
            valueKey="pressureAllowedPct"
            name="% presión permitida"
            color={COLORS.impactBlue}
            colorFn={(x) => (x.pressureAllowedPct > 9 ? COLORS.unityRed : COLORS.impactBlue)}
            height={190}
            labelWidth={135}
          />
          <Insight>{p.note}</Insight>
        </Card>

        <Card title="Clasificación de jugadores" subtitle="Perfil físico vs. rendimiento por posición" accent="offense" badge="Módulo 5" className="xl:col-span-1">
          <PlayerClassificationBlock data={data.clasificacionJugadores} accent="offense" />
        </Card>

        <Card title="Castigos ofensivos" subtitle="Faltas del ataque y su costo" accent="alert" badge="Módulo 6">
          <PenaltiesBlock data={data.castigosOfensivos} />
        </Card>
      </div>
    </div>
  )
}
