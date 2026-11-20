# Reporte de arquitectura de datos

Generado por `scripts/01_analisis_y_clustering.py`. 122 juegos, semanas 1-8, 8557 jugadas de pase. Solo pandas y numpy.

## 1. Relaciones de llaves

| Chequeo | Resultado |
|---|---|
| unico games.gameId | True |
| unico plays.(gameId,playId) | True |
| unico players.nflId | True |
| unico pff.(gameId,playId,nflId) | True |
| duplicados tracking (gameId, playId, nflId, frameId) | 0 |
| plays_sin_game | 0 |
| games_sin_plays | 0 |
| pff_sin_player | 0 |
| pff_sin_play | 0 |
| plays_sin_pff | 0 |
| tracking_jugadas_sin_play | 0 |
| plays_sin_tracking | 0 |
| tracking_nflId_sin_player | 0 |

plays->pff 1:N (22.0 filas/jugada); plays->tracking 1:N por frame (min 19, mediana 39.0, max 203 frames). Frames irregulares: 0.

Discrepancia README vs CSV en `pff_role`: `Coverage`=57765, `Pass Block`=46057, `Pass Route`=39513, `Pass Rush`=36362, `Pass`=8557. Se normaliza a minusculas.

## 2. Valores faltantes

Estructurales: filas del balon sin nflId/o/dir/jerseyNumber (361486 filas); castigos nulos cuando no hubo castigo (con castigo: 8.6%); PFF hit/hurry/sack nulo = sin credito; `event` solo en frames marcados.

| Columna plays | n nulos | % |
|---|---|---|
| yardlineSide | 125 | 1.46 |
| penaltyYards | 7801 | 91.17 |
| foulName1 | 7821 | 91.4 |
| foulNFLId1 | 7821 | 91.4 |
| foulName2 | 8527 | 99.65 |
| foulNFLId2 | 8527 | 99.65 |
| foulName3 | 8556 | 99.99 |
| foulNFLId3 | 8556 | 99.99 |
| absoluteYardlineNumber | 1 | 0.01 |
| offenseFormation | 7 | 0.08 |
| personnelO | 1 | 0.01 |
| defendersInBox | 7 | 0.08 |
| personnelD | 1 | 0.01 |
| dropBackType | 528 | 6.17 |

## 3. Normalizacion

left=4431, right=4126. Ofensiva a la izquierda de la defensa al snap tras normalizar: 100.0%.

Fuente del frame de llegada: penultimate_frame=8139, pass_arrived=367, pass_outcome_caught=12, pass_outcome_incomplete=39. El tracking de este dataset termina poco despues del pase, por eso la mayoria usa el penultimo frame.

## 4. KPIs

- juegos: 122
- jugadas: 8557
- semanas: [1, 8]
- yardas_promedio: 6.564
- yardas_mediana: 5.0
- tasa_explosiva: 0.1658
- tasa_presion: 0.3758
- tasa_completo: 0.5399
- tasa_sack: 0.0635
- tasa_intercepcion: 0.0222
- tiempo_lanzar_promedio_s: 2.9058
- sep_objetivo_promedio_yd: 3.6999
- hip_flip_promedio_deg: 136.7277
- tasa_trampa_presion: 0.1122
- cobertura_sep_objetivo: 8557
- cobertura_hip_flip: 8554

## 5. Metricas ineditas

- **sep_target_arrival_yd**: n=8557, media=3.700, p25=1.611, mediana=3.073, p75=5.153, max=22.245
- **SOE**: n=8557, media=-0.000, p25=-1.728, mediana=-0.514, p75=1.321, max=18.135
- **hip_flip_deg**: n=8554, media=136.728, p25=105.300, mediana=148.045, p75=175.438, max=180.000
- hip_flip_deg >= 170: 35.67% de las jugadas medidas.

**Trampa de Presion**: 960 jugadas (11.22% del total, 29.85% de las jugadas con presion). Yardas promedio -0.47, faltaron 10.11 yd para el primer down. Resultado: {'I': 389, 'C': 282, 'S': 200, 'R': 54, 'IN': 35}.

**Top 5 receptores por SOE**

| Jugador | Pos | Equipo | n | SOE | sep obj |
|---|---|---|---|---|---|
| Javonte Williams | RB | DEN | 34 | 2.332 | 6.251 |
| Ty Johnson | RB | NYJ | 47 | 2.04 | 5.718 |
| Darrell Henderson | RB | LA | 41 | 1.826 | 5.761 |
| Dawson Knox | TE | BUF | 36 | 1.676 | 5.175 |
| Darrel Williams | RB | KC | 55 | 1.573 | 5.436 |

**Top 5 defensores por hip_flip_deg**

| Jugador | Pos | Equipo | n | hip flip | sep permitida |
|---|---|---|---|---|---|
| Mike Hilton | CB | CIN | 56 | 159.924 | 3.641 |
| Taron Johnson | CB | BUF | 42 | 157.192 | 3.537 |
| Denzel Perryman | ILB | LV | 43 | 156.698 | 3.306 |
| Kyle Van Noy | OLB | NE | 30 | 156.37 | 3.583 |
| Chauncey Gardner-Johnson | SS | NO | 31 | 154.444 | 3.448 |

## 6. Reglas

**por_cobertura**

| Grupo | n | yds | explosiva | presion | t lanzar | sep obj | SOE | hip flip | trampa |
|---|---|---|---|---|---|---|---|---|---|
| 2-Man | 200 | 7.93 | 0.245 | 0.405 | 3.142 | 2.392 | -0.0 | 122.027 | 0.05 |
| Cover-0 | 270 | 5.037 | 0.119 | 0.511 | 2.453 | 2.744 | 0.0 | 118.719 | 0.126 |
| Cover-1 | 2011 | 6.655 | 0.182 | 0.404 | 2.815 | 2.563 | 0.0 | 123.298 | 0.061 |
| Cover-2 | 1085 | 6.509 | 0.166 | 0.341 | 2.98 | 5.075 | -0.0 | 153.067 | 0.16 |
| Cover-3 | 2665 | 6.904 | 0.175 | 0.363 | 2.917 | 4.155 | -0.0 | 140.404 | 0.131 |
| Cover-6 | 805 | 6.875 | 0.18 | 0.34 | 2.951 | 4.067 | -0.0 | 144.469 | 0.122 |
| Quarters | 1033 | 7.041 | 0.156 | 0.356 | 2.907 | 3.911 | -0.0 | 140.804 | 0.129 |
| Red Zone | 376 | 2.298 | 0.003 | 0.428 | 3.102 | 2.809 | -0.0 | 131.004 | 0.088 |

**por_formacion**

| Grupo | n | yds | explosiva | presion | t lanzar | sep obj | SOE | hip flip | trampa |
|---|---|---|---|---|---|---|---|---|---|
| EMPTY | 1396 | 6.55 | 0.143 | 0.357 | 2.692 | 3.25 | -0.406 | 140.133 | 0.072 |
| I_FORM | 298 | 7.359 | 0.225 | 0.339 | 3.13 | 4.018 | 0.2 | 129.458 | 0.107 |
| PISTOL | 154 | 7.123 | 0.156 | 0.312 | 3.042 | 4.366 | 0.496 | 143.077 | 0.117 |
| SHOTGUN | 5481 | 6.276 | 0.157 | 0.386 | 2.873 | 3.701 | 0.021 | 137.03 | 0.122 |
| SINGLEBACK | 1189 | 7.741 | 0.224 | 0.364 | 3.23 | 4.099 | 0.274 | 132.926 | 0.118 |

**por_play_action**

| Grupo | n | yds | explosiva | presion | t lanzar | sep obj | SOE | hip flip | trampa |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 6519 | 6.169 | 0.144 | 0.372 | 2.775 | 3.582 | -0.078 | 137.208 | 0.109 |
| 1 | 2038 | 7.828 | 0.236 | 0.388 | 3.33 | 4.077 | 0.25 | 135.19 | 0.122 |

**por_tiempo_bolsa**

| Grupo | n | yds | explosiva | presion | t lanzar | sep obj | SOE | hip flip | trampa |
|---|---|---|---|---|---|---|---|---|---|
| <=2.0 | 1285 | 6.01 | 0.073 | 0.12 | 1.813 | 3.315 | -0.352 | 124.739 | 0.031 |
| 2-2.5 | 1927 | 7.031 | 0.153 | 0.228 | 2.316 | 3.493 | -0.138 | 134.463 | 0.062 |
| 2.5-3 | 1822 | 7.797 | 0.201 | 0.32 | 2.788 | 3.995 | 0.292 | 134.495 | 0.107 |
| 3-4 | 1754 | 8.877 | 0.254 | 0.397 | 3.44 | 4.345 | 0.535 | 140.693 | 0.131 |
| >4 | 816 | 6.495 | 0.19 | 0.716 | 5.135 | 3.442 | -0.32 | 149.202 | 0.164 |

**por_zona_campo**

| Grupo | n | yds | explosiva | presion | t lanzar | sep obj | SOE | hip flip | trampa |
|---|---|---|---|---|---|---|---|---|---|
| Ataque (21-40) | 1560 | 6.178 | 0.183 | 0.378 | 2.875 | 3.592 | 0.0 | 136.27 | 0.108 |
| Campo Propio (61+) | 3613 | 7.301 | 0.182 | 0.364 | 2.904 | 3.898 | -0.0 | 138.008 | 0.121 |
| Medio Campo (41-60) | 2202 | 7.399 | 0.19 | 0.384 | 2.943 | 3.897 | 0.0 | 137.508 | 0.122 |
| Zona Roja (<=20) | 1182 | 3.266 | 0.049 | 0.393 | 2.882 | 2.868 | -0.0 | 131.966 | 0.073 |

**presion_vs_no**

| Grupo | n | yds | explosiva | presion | t lanzar | sep obj | SOE | hip flip | trampa |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 5341 | 8.147 | 0.186 | 0.0 | 2.654 | 3.77 | 0.03 | 135.013 | 0.0 |
| 1 | 3216 | 3.935 | 0.132 | 1.0 | 3.433 | 3.584 | -0.05 | 139.574 | 0.299 |

Correlaciones con playResult: time_to_throw_s=0.015, presion=-0.192, sep_target_arrival_yd=0.044, SOE=0.032, hip_flip_deg=0.018, max_speed_off=0.131, yardsToGo=0.038, yds_to_endzone=0.116

## 7. Clustering K-Means (numpy, Z-score)

Variables: down, yardsToGo, yds_to_endzone, score_diff_off, defendersInBox, time_event_s, n_pass_rush, presion, sep_target_arrival_yd, max_speed_off, playResult. Etiqueta: si centroide yds_to_endzone <= 40 -> 'Zona Roja / Compresión de Campo'; resto por rasgo z dominante.

### k3: varianza explicada 18.53%, silhouette 0.111, estabilidad 0.996

| Cluster | Etiqueta | n | % | down | yardsToGo | yds_to_endzone | score_diff_off | defendersInBox | time_event_s | n_pass_rush | presion | sep_target_arrival_yd | max_speed_off | playResult | explosiva | sack | SOE | trampa |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Zona Roja / Compresión de Campo | 2483 | 29.02 | 2.556 | 5.516 | 37.53 | -1.791 | 6.236 | 2.535 | 4.51 | 0.269 | 2.668 | 7.531 | 5.687 | 0.124 | 0.024 | -0.566 | 0.040 |
| 1 | Bolsa Limpia / Jugadas Explosivas | 3514 | 41.07 | 1.539 | 10.482 | 59.422 | -4.108 | 5.95 | 2.759 | 4.077 | 0.028 | 4.424 | 8.005 | 9.798 | 0.231 | 0.000 | 0.430 | 0.008 |
| 2 | Bolsa Colapsada (Bajo Presión) | 2560 | 29.92 | 1.982 | 9.424 | 54.036 | -3.861 | 5.915 | 4.104 | 4.233 | 0.957 | 3.706 | 8.354 | 2.975 | 0.117 | 0.189 | -0.041 | 0.325 |

### k4: varianza explicada 22.87%, silhouette 0.099, estabilidad 0.743

| Cluster | Etiqueta | n | % | down | yardsToGo | yds_to_endzone | score_diff_off | defendersInBox | time_event_s | n_pass_rush | presion | sep_target_arrival_yd | max_speed_off | playResult | explosiva | sack | SOE | trampa |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Bolsa Colapsada (Bajo Presión) | 2205 | 25.77 | 2.029 | 9.295 | 53.08 | -4.364 | 5.835 | 4.287 | 4.098 | 0.949 | 3.607 | 8.358 | 2.082 | 0.096 | 0.205 | -0.155 | 0.323 |
| 1 | Bolsa Limpia / Jugadas Explosivas | 2889 | 33.76 | 1.466 | 10.833 | 61.893 | -3.925 | 5.986 | 2.834 | 4.056 | 0.06 | 4.796 | 8.136 | 10.571 | 0.258 | 0.000 | 0.731 | 0.020 |
| 2 | Zona Roja / Compresión de Campo | 2151 | 25.14 | 2.442 | 6.283 | 39.576 | -3.789 | 5.803 | 2.5 | 4.0 | 0.121 | 2.836 | 7.449 | 5.745 | 0.106 | 0.010 | -0.606 | 0.020 |
| 3 | Blitz / Caja Cargada | 1312 | 15.33 | 2.184 | 7.124 | 45.235 | 0.265 | 6.777 | 2.651 | 5.338 | 0.526 | 2.859 | 7.819 | 6.615 | 0.178 | 0.053 | -0.357 | 0.111 |

## 8. Exportacion web

- `data/insights_partido.json`: 0.11 MB
- `data/featured_plays_tracking.json`: 2.39 MB, 60 jugadas (explosiva=15, soe=15, hip_flip=15, trampa_presion=15)