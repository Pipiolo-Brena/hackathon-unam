import { COLORS } from '../theme'
import type { DefenseSectionData, KpiItem } from '../types/nfl'
import { ColumnChart, HBarChart } from '../components/charts'
import {
  FieldZonesBlock,
  PassMapBlock,
  PenaltiesBlock,
  PlayMixBlock,
  PlayerClassificationBlock,
} from '../components/modules/Shared'
import { Card, CoachOnly, DataTable, Insight, KpiRow, SectionLabel, StatGrid } from '../components/ui'

export default function DefenseView({ data, kpis }: { data: DefenseSectionData; kpis: KpiItem[] }) {
  const { esquemaCobertura: e, personalYCasillaCaja: pc, rendimientoDefensivo: r, concentracionAccionDefensiva: c } = data
  const s = r.summary
  return (
    <div className="space-y-4">
      <KpiRow items={kpis} accent="defense" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Esquema de cobertura" subtitle="Zona vs. hombre y esquemas PFF" accent="defense" badge="Módulo 1">
          <SectionLabel>Tipo de cobertura · % de completos permitidos</SectionLabel>
          <ColumnChart
            data={e.coverageType}
            xKey="label"
            series={[
              { key: 'completionPct', name: '% completos', color: COLORS.nflRed },
              { key: 'pressurePct', name: '% presión', color: COLORS.unityRed },
            ]}
            height={170}
          />
          <SectionLabel>Yardas permitidas por esquema</SectionLabel>
          <HBarChart
            data={e.schemes}
            labelKey="label"
            valueKey="yardsPerPlay"
            name="Yd/jugada"
            color={COLORS.nflRed}
            colorFn={(x) => (x.yardsPerPlay < 5 ? COLORS.unamGold : COLORS.nflRed)}
            height={250}
            labelWidth={85}
          />
          <CoachOnly>
            <DataTable
              rows={e.schemes}
              columns={[
                { header: 'Esquema', render: (x) => x.label },
                { header: 'Jug.', align: 'right', render: (x) => x.plays },
                { header: 'Comp.', align: 'right', render: (x) => `${x.completionPct}%` },
                { header: 'Presión', align: 'right', render: (x) => `${x.pressurePct}%` },
                { header: 'DPI', align: 'right', render: (x) => `${x.dpiPct}%` },
              ]}
            />
          </CoachOnly>
        </Card>

        <Card title="Personal defensivo y caja" subtitle="Formación DL-LB-DB y defensores en la caja" accent="defense" badge="Módulo 2">
          <PlayMixBlock title="Personal defensivo (DL-LB-DB)" rows={pc.personnel} accent="defense" />
          <SectionLabel>Defensores en la caja · yardas permitidas</SectionLabel>
          <ColumnChart
            data={pc.box.map((b) => ({ ...b, caja: `${b.defenders}` }))}
            xKey="caja"
            series={[{ key: 'yardsPerPlay', name: 'Yd/jugada', color: COLORS.nflRed }]}
            height={170}
          />
          <Insight>Con 8 defensores en la caja se permiten más yardas por jugada (7.3).</Insight>
        </Card>

        <Card title="Rendimiento defensivo" subtitle="Yardas permitidas, presión y sacks según rushers" accent="defense" badge="Módulo 3">
          <StatGrid
            items={[
              { label: 'Yd permitidas', value: s.yardsAllowedPerPlay.toFixed(1) },
              { label: 'Comp. perm.', value: `${s.completionAllowedPct}%` },
              { label: 'Sacks', value: `${s.sackRate}%` },
              { label: 'INT', value: `${s.intRate}%` },
              { label: 'Presión', value: `${s.pressureRate}%` },
            ]}
          />
          <SectionLabel>Presión y sack por número de rushers (%)</SectionLabel>
          <ColumnChart
            data={r.byRushers.map((x) => ({ ...x, rushers: `${x.rushers}` }))}
            xKey="rushers"
            series={[
              { key: 'pressurePct', name: '% presión', color: COLORS.nflRed },
              { key: 'sackPct', name: '% sack', color: COLORS.unamGold },
            ]}
            height={180}
          />
          <SectionLabel>Por cuarto</SectionLabel>
          <ColumnChart
            data={r.byQuarter}
            xKey="quarter"
            series={[
              { key: 'yardsPerPlay', name: 'Yd permitidas', color: COLORS.nflRed },
              { key: 'pressurePct', name: '% presión', color: COLORS.legacyRed },
            ]}
            height={150}
          />
          <CoachOnly>
            <SectionLabel>Por equipo</SectionLabel>
            <DataTable
              rows={r.byTeam}
              columns={[
                { header: 'Equipo', render: (x) => x.team },
                { header: 'Jug.', align: 'right', render: (x) => x.plays },
                { header: 'Yd perm.', align: 'right', render: (x) => x.yardsPerPlay.toFixed(1) },
                { header: 'Presión', align: 'right', render: (x) => `${x.pressurePct}%` },
              ]}
            />
          </CoachOnly>
        </Card>

        <Card title="Dónde se concentra la acción defensiva" subtitle="Zonas y pases permitidos" accent="defense" badge="Módulo 4">
          <FieldZonesBlock rows={c.fieldZones} accent="defense" metricLabel="Yardas permitidas por jugada" />
          <div className="mt-4">
            <PassMapBlock cells={c.passMap} accent="defense" />
          </div>
          <Insight>Los pases profundos al centro dejan más yardas (15.3 por intento) y pocas intercepciones.</Insight>
        </Card>

        <Card title="Clasificación de jugadores" subtitle="Perfil físico vs. rendimiento por posición" accent="defense" badge="Módulo 5">
          <PlayerClassificationBlock data={data.clasificacionJugadores} accent="defense" />
        </Card>

        <Card title="Castigos defensivos" subtitle="Faltas de la defensa y su costo" accent="alert" badge="Módulo 6">
          <PenaltiesBlock data={data.castigosDefensivos} />
        </Card>
      </div>
    </div>
  )
}
