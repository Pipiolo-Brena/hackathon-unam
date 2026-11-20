# Contrato de la API (para Frontend)

Base: rutas relativas **sin diagonal inicial**, p. ej. `fetch('api/overview')`. Todas responden JSON.
Errores: `422` (parámetro inválido), `404` (jugada sin tracking destacado), `503` (faltan los JSON: correr el pipeline).
Números con `null` posible cuando el dato no existe (p. ej. `o`/`dir` del balón, `arrival_frame` extrapolado).

```ts
// Bloque de métricas por grupo (coberturas, formaciones, tramos de bolsa, play action, presión)
interface GroupStats {
  n: number; yds: number; explosiva: number; presion: number;   // tasas en 0-1
  t_throw: number; sep_objetivo: number; soe: number; hip_flip: number; trampa: number;
}
```

## GET `api/overview`

```ts
interface Overview {
  kpis: {
    juegos: number; jugadas: number; semanas: [number, number];
    yardas_promedio: number; yardas_mediana: number;
    tasa_explosiva: number; tasa_presion: number; tasa_completo: number; tasa_sack: number; tasa_intercepcion: number;
    tiempo_lanzar_promedio_s: number; sep_objetivo_promedio_yd: number; hip_flip_promedio_deg: number;
    tasa_trampa_presion: number; pases_con_objetivo: number; cobertura_hip_flip: number;
    pct_objetivo_por_descripcion: number;          // 0-100
  };
  coberturas: Record<string, number>;              // "Cover-3": 2665, ...
  tipo_cobertura: Record<string, number>;          // "Zone" | "Man" | "Other"
  formaciones: Record<string, number>;             // incluye la clave "nan" (7 jugadas sin formación)
  curva_tiempo_bolsa: Array<{ t_desde_s: number; t_hasta_s: number; n: number; yds: number;
                              explosiva: number; presion: number; completo: number; sep_objetivo: number }>;
  reglas_tiempo_bolsa: Record<"<=2.0" | "2-2.5" | "2.5-3" | "3-4" | ">4", GroupStats>;
  reglas_cobertura: Record<string, GroupStats>;
  reglas_formacion: Record<string, GroupStats>;
  reglas_play_action: Record<"0" | "1", GroupStats>;
}
```

## GET `api/research-insights`

```ts
interface RankingRow {
  nflId: number; displayName: string; officialPosition: string; team: string;
  n: number;               // targets / jugadas (mínimo 15)
  valor: number;           // métrica del ranking: SOE (yd) o hip_flip (°)
  soe: number; hip_flip: number; sep_objetivo: number; yds: number;
}
interface DefenderRow extends RankingRow {
  sep_allowed_yd: number;                                       // separación media que permite
  evaluacion_hip_flip: "recuperacion_elite" | "debilidad" | "neutral" | "sin_datos";
}
interface ResearchInsights {
  clusters: {
    varianza_explicada_pct: number; silhouette_muestra: number; estabilidad_semillas: number;
    clusters: Array<{
      cluster: number; etiqueta: string; n: number; pct: number;
      centroide_real: Record<string, number>; centroide_z: Record<string, number>;
      tasa_explosiva: number; tasa_sack: number; tasa_incompleto: number;
      soe_promedio: number; hip_flip_promedio: number; tasa_trampa: number;
      cobertura_top: Record<string, number>;
    }>;
  };
  rankings: {
    receptores_soe_wr_te: RankingRow[];
    receptores_soe_rb_fb: RankingRow[];
    defensores_hip_flip_man: DefenderRow[];                     // solo cobertura Man
    receptores_hip_flip_inducido_man: RankingRow[];
    base_hip_flip: { man: number; zone: number };
    sep_allowed_base_man_yd: number;                            // 2.638
    min_jugadas: number; nota: string;
  };
  trampa_presion: {
    definicion: string; n: number;
    pct_de_jugadas: number; pct_de_jugadas_con_presion: number; pct_de_pases_con_presion: number;  // 0-100
    yardas_promedio: number; yardas_faltantes_promedio: number; sep_objetivo_promedio: number;
    tiempo_lanzar_promedio: number; completos: number; completos_yardas_promedio: number;
    por_resultado: Record<string, number>; por_down: Record<string, number>;
    por_cobertura: Record<string, { n: number; tasa_sobre_presion: number }>;
    por_equipo_ofensivo: Record<string, { n: number; tasa_sobre_presion: number }>;
    comparacion_presion_sep_alta: { trampa_yds: number; presion_sep_alta_convierte_yds: number };
  };
  metodologia: Record<"fuente" | "normalizacion" | "llegada" | "objetivo" | "hip_flip_nota" | "soe_nota" | "featured_filtro", string>;
}
```

## GET `api/plays`

Filtros opcionales: `cluster_id` (0-3), `coverage` (p. ej. `Cover-1`), `team` (abreviatura, ofensiva o defensiva),
`tag` (`trampa_presion` | `explosiva` | `soe` | `hip_flip`). Sin filtros devuelve las 60 jugadas destacadas.

```ts
interface FeaturedPlay {
  gameId: number; playId: number; week: number; quarter: number; down: number; yardsToGo: number;
  possessionTeam: string; defensiveTeam: string; playDescription: string;
  passResult: "C" | "I" | "IN" | "S" | "R"; playResult: number; prePenaltyPlayResult: number;
  offenseFormation: string; pff_passCoverage: string; pff_passCoverageType: "Man" | "Zone" | "Other";
  pff_playAction: 0 | 1; zona_campo: string; yds_to_endzone: number;
  time_to_throw_s: number; presion: 0 | 1;
  sep_target_arrival_yd: number;   // 1-12 yd en todas las destacadas
  sep_esperada_yd: number; SOE: number; hip_flip_deg: number; checkdown_trap: 0 | 1; max_speed_off: number;
  cluster_id: number; cluster_label: string;
  target_nflId: number; target_name: string; target_from_desc: 0 | 1;
  cov_def_nflId: number; cov_def_name: string;
  snap_frame: number;
  arrival_frame: number | null;    // null si la llegada se extrapoló después del último frame
  arrival_source: "pass_arrived" | "pass_outcome_caught" | "cruce_observado" | "ball_min_speed" | "cruce_extrapolado";
  arrival_extrap_s: number; dist_ball_target_yd: number;
  tags: string[]; primary_tag: "trampa_presion" | "explosiva" | "soe" | "hip_flip";
}
interface PlaysResponse { count: number; plays: FeaturedPlay[] }
```

## GET `api/plays/{game_id}/{play_id}/tracking`

Coordenadas normalizadas: la ofensiva siempre ataca hacia la derecha, campo de 120 x 53.3 yd, 10 frames por segundo.

```ts
interface TrackingResponse {
  gameId: number; playId: number;
  field: { length: 120; width: 53.3; attack: "right" };
  play: FeaturedPlay;
  frames: Array<{
    frameId: number;
    event: string | null;            // "ball_snap", "pass_forward", "pass_arrived", ...
    entities: Array<{
      nflId: number | null;          // null = balón
      displayName: string;           // "football" para el balón
      jerseyNumber: number | null;
      team: string;                  // abreviatura o "football"
      pff_role: "pass" | "pass route" | "pass block" | "pass rush" | "coverage" | null;
      x: number; y: number; o: number | null; dir: number | null; s: number;
    }>;
  }>;
}
```

## POST `api/chat`

Body: `{ "message": string (1-2000), "mode": "coach" | "scout" }` (`mode` por defecto `coach`).

```ts
interface ChatResponse {
  reply: string;                     // tres secciones separadas por "\n": 1. Diagnóstico Táctico (Coach) /
                                     // 2. Evaluación de Talento (Scout) / 3. Evidencia en Cancha (Tracking 2D)
  recommended_play: { gameId: number; playId: number; reason: string };   // siempre existe en api/plays
  source: "bedrock" | "local";       // "local" = respaldo sin IA
  recommended_play_check: {
    sep_target_arrival_yd: number; realista: boolean; passResult: string; playResult: number;
    yardsToGo: number; target_name: string; arrival_source: string; playDescription: string;
  };
  // solo cuando source == "bedrock":
  model?: string; mode?: "coach" | "scout";
  tools_used?: string[]; tool_sequence?: string[];
  protocolo_ok?: boolean; protocolo_faltas?: string[]; reintento?: boolean;
  recommended_play_reemplazada?: boolean;
  // solo cuando source == "local":
  fallback_reason?: string;
}
```

Para dibujar la jugada recomendada: `fetch(\`api/plays/${gameId}/${playId}/tracking\`)` con los ids de `recommended_play`.
La respuesta de Bedrock tarda de 7 a 15 s; muestra un estado de carga.
