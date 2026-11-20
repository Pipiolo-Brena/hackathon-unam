# Reporte de arquitectura de datos

Generado por `scripts/01_analisis_y_clustering.py`. Datos: 122 juegos, semanas 1-8, 8557 jugadas de dropback (pase). Solo pandas y numpy.

## 1. Relaciones de llaves

| Union | Resultado |
|---|---|
| games.gameId unica | True |
| plays (gameId, playId) unica | True |
| players.nflId unica | True |
| pff (gameId, playId, nflId) unica | True |
| tracking (gameId, playId, nflId, frameId) duplicados | 0 |

**Registros huerfanos**

| Chequeo | Cantidad |
|---|---|
| plays_sin_game | 0 |
| games_sin_plays | 0 |
| pff_sin_play | 0 |
| pff_sin_player | 0 |
| plays_sin_pff | 0 |
| tracking_jugadas_sin_play | 0 |
| plays_sin_tracking | 0 |
| tracking_nflId_sin_player | 0 |

Cardinalidad: plays->pff = 1:N (22.0 filas por jugada en promedio, min 22.0, max 22.0); plays->tracking = 1:N por frame (frames por jugada: min 19, mediana 39.0, max 203). Jugadas con frames irregulares entre jugadores: 0.

Discrepancia README vs CSV en `pff_role`: valores reales `Coverage`=57765, `Pass Block`=46057, `Pass Route`=39513, `Pass Rush`=36362, `Pass`=8557 (el README usa minuscula en la segunda palabra). Se normaliza a minusculas antes de unir.

## 2. Valores faltantes

**Estructurales (esperados)**

- `balon_nflId_nulo_en_tracking`: estructural: filas con team=football (1 por frame)
- `foulName*/foulNFLId*/penaltyYards`: estructural: nulo cuando no hubo castigo
- `pff_hit/hurry/sack (pff)`: nulo = sin credito, no dato perdido
- `pff_nflIdBlockedPlayer/blockType`: nulo en jugadores que no bloquean
- `event (tracking)`: nulo en la mayoria de frames; solo se marca en eventos

Jugadas con castigo: 8.6% (el resto tiene foulName nulo).

Tracking: 8314178 filas = 7952692 de jugadores + 361486 del balon. Nulos en filas de jugador vs balon:

| Columna | Nulos jugador | Nulos balon |
|---|---|---|
| x | 0 | 0 |
| y | 0 | 0 |
| s | 0 | 0 |
| a | 0 | 0 |
| dis | 0 | 0 |
| o | 0 | 361486 |
| dir | 0 | 361486 |
| event | 7339728 | 333624 |
| jerseyNumber | 0 | 361486 |
| nflId | 0 | 361486 |

**Nulos no estructurales en plays (>0)**

| Columna | n | % |
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

## 3. Normalizacion tactica

Jugadas con playDirection=left: 4431, right: 4126. Para `left` se aplico x=120-x, y=53.3-y, o=(o+180)%360, dir=(dir+180)%360. Verificacion: en 100.0% de las jugadas la ofensiva queda a la izquierda de la defensa al snap (debe ser cercano a 100%). Las filas del balon se separaron de las de jugadores antes del calculo.

## 4. Estadisticas generales

- Jugadas: 8557. playResult medio 6.564 yardas, mediana 5.0.
- Tasa de jugadas explosivas (>=15 yd): 16.6%. Tasa de presion PFF: 37.6%.
- Marcador pre-snap de la ultima jugada (aprox. final), promedio: local 23.13, visitante 22.43.
- passResult: C=4620, I=2755, S=543, R=449, IN=190
- down: 1=3071, 2=2826, 3=2394, 4=231, 0=35
- offenseFormation: SHOTGUN=5481, EMPTY=1396, SINGLEBACK=1189, I_FORM=298, PISTOL=154, JUMBO=30, nan=7, WILDCAT=2
- dropBackType: TRADITIONAL=6542, SCRAMBLE=899, nan=528, DESIGNED_ROLLOUT_RIGHT=285, DESIGNED_ROLLOUT_LEFT=149, SCRAMBLE_ROLLOUT_RIGHT=125, SCRAMBLE_ROLLOUT_LEFT=23, DESIGNED_RUN=5, UNKNOWN=1
- pff_passCoverage: Cover-3=2665, Cover-1=2011, Cover-2=1085, Quarters=1033, Cover-6=805, Red Zone=376, Cover-0=270, 2-Man=200, Bracket=47, Prevent=32, Goal Line=25, Miscellaneous=8
- pff_passCoverageType: Zone=5588, Man=2481, Other=488
- pff_playAction: 0=6519, 1=2038

**Metricas derivadas (post-snap hasta fin de jugada)**

| Metrica | media | mediana | min | max | n |
|---|---|---|---|---|---|
| dev_time_s | 3.535 | 3.3 | 0.5 | 10.3 | 8557 |
| time_to_throw_s | 2.944 | 2.7 | 0.9 | 9.8 | 7547 |
| max_speed_off | 7.972 | 7.99 | 1.84 | 11.18 | 8557 |
| max_speed_def | 7.067 | 7.02 | 2.23 | 10.39 | 8557 |
| max_acc_off | 6.33 | 6.18 | 3.27 | 18.05 | 8557 |
| max_acc_def | 6.092 | 6.01 | 3.21 | 21.92 | 8557 |
| sep_min_route_yd | 0.73 | 0.674 | 0.063 | 4.113 | 8557 |
| sep_mean_route_yd | 3.475 | 3.458 | 1.092 | 9.573 | 8557 |
| sep_target_arrival_yd | 3.68 | 3.272 | 0.344 | 9.872 | 418 |

Separacion: distancia euclidiana entre cada receptor (pff_role = Pass route) y el defensor mas cercano; `sep_target_arrival_yd` usa el receptor mas cercano al balon en `pass_arrived` (proxy del objetivo).

## 5. Reglas y patrones

**por_cobertura**

| Grupo | n | yds prom | explosiva | presion | t lanzar | sep objetivo |
|---|---|---|---|---|---|---|
| 2-Man | 200 | 7.93 | 0.245 | 0.405 | 3.176 | 1.574 |
| Cover-0 | 270 | 5.037 | 0.119 | 0.511 | 2.492 | 1.279 |
| Cover-1 | 2011 | 6.655 | 0.182 | 0.404 | 2.856 | 2.95 |
| Cover-2 | 1085 | 6.509 | 0.166 | 0.341 | 3.016 | 4.795 |
| Cover-3 | 2665 | 6.904 | 0.175 | 0.363 | 2.952 | 3.992 |
| Cover-6 | 805 | 6.875 | 0.18 | 0.34 | 2.987 | 3.434 |
| Quarters | 1033 | 7.041 | 0.156 | 0.356 | 2.952 | 3.162 |
| Red Zone | 376 | 2.298 | 0.003 | 0.428 | 3.14 | 2.433 |

**por_tipo_cobertura**

| Grupo | n | yds prom | explosiva | presion | t lanzar | sep objetivo |
|---|---|---|---|---|---|---|
| Man | 2481 | 6.582 | 0.181 | 0.416 | 2.838 | 2.763 |
| Other | 488 | 3.219 | 0.039 | 0.42 | 3.194 | 2.508 |
| Zone | 5588 | 6.848 | 0.17 | 0.354 | 2.97 | 3.958 |

**por_formacion**

| Grupo | n | yds prom | explosiva | presion | t lanzar | sep objetivo |
|---|---|---|---|---|---|---|
| EMPTY | 1396 | 6.55 | 0.143 | 0.357 | 2.731 | 2.684 |
| I_FORM | 298 | 7.359 | 0.225 | 0.339 | 3.162 | 3.528 |
| PISTOL | 154 | 7.123 | 0.156 | 0.312 | 3.115 | 3.454 |
| SHOTGUN | 5481 | 6.276 | 0.157 | 0.386 | 2.913 | 3.826 |
| SINGLEBACK | 1189 | 7.741 | 0.224 | 0.364 | 3.264 | 4.275 |

**por_dropback**

| Grupo | n | yds prom | explosiva | presion | t lanzar | sep objetivo |
|---|---|---|---|---|---|---|
| DESIGNED_ROLLOUT_LEFT | 149 | 6.812 | 0.154 | 0.315 | 3.186 | 5.033 |
| DESIGNED_ROLLOUT_RIGHT | 285 | 6.021 | 0.133 | 0.256 | 3.041 | 4.394 |
| SCRAMBLE | 899 | 6.821 | 0.159 | 0.736 | 5.203 | 3.298 |
| SCRAMBLE_ROLLOUT_RIGHT | 125 | 6.752 | 0.16 | 0.448 | 4.711 | 2.899 |
| TRADITIONAL | 6542 | 6.795 | 0.167 | 0.318 | 2.705 | 3.662 |

**por_play_action**

| Grupo | n | yds prom | explosiva | presion | t lanzar | sep objetivo |
|---|---|---|---|---|---|---|
| 0 | 6519 | 6.169 | 0.144 | 0.372 | 2.814 | 3.526 |
| 1 | 2038 | 7.828 | 0.236 | 0.388 | 3.368 | 4.156 |

**por_down**

| Grupo | n | yds prom | explosiva | presion | t lanzar | sep objetivo |
|---|---|---|---|---|---|---|
| 1 | 3071 | 7.015 | 0.176 | 0.321 | 2.989 | 4.027 |
| 2 | 2826 | 6.629 | 0.167 | 0.354 | 2.844 | 3.518 |
| 3 | 2394 | 6.138 | 0.155 | 0.454 | 2.99 | 3.315 |
| 4 | 231 | 5.16 | 0.16 | 0.554 | 3.12 | 3.771 |

**por_defenders_in_box**

| Grupo | n | yds prom | explosiva | presion | t lanzar | sep objetivo |
|---|---|---|---|---|---|---|
| 4.0 | 486 | 6.634 | 0.148 | 0.399 | 3.054 | 4.284 |
| 5.0 | 1644 | 6.357 | 0.152 | 0.379 | 2.883 | 3.215 |
| 6.0 | 4003 | 6.58 | 0.164 | 0.373 | 2.917 | 3.713 |
| 7.0 | 1831 | 6.634 | 0.178 | 0.372 | 2.967 | 3.718 |
| 8.0 | 475 | 7.32 | 0.217 | 0.377 | 3.108 | 3.914 |

**por_resultado**

| Grupo | n | yds prom | explosiva | presion | t lanzar | sep objetivo |
|---|---|---|---|---|---|---|
| C | 4620 | 11.681 | 0.271 | 0.245 | 2.791 | 3.904 |
| I | 2755 | 0.913 | 0.036 | 0.441 | 3.175 | 2.906 |
| IN | 190 | 0.0 | 0.0 | 0.395 | 3.332 | 3.126 |
| R | 449 | 7.165 | 0.134 | 0.559 | 3.8 | - |
| S | 543 | -6.499 | 0.011 | 1.0 | 2.975 | - |

**por_pass_rushers**

| Grupo | n | yds prom | explosiva | presion | t lanzar | sep objetivo |
|---|---|---|---|---|---|---|
| <=3 | 439 | 7.362 | 0.15 | 0.237 | 3.215 | 2.598 |
| 4 | 6011 | 6.532 | 0.16 | 0.351 | 2.997 | 3.787 |
| 5 | 1689 | 6.492 | 0.187 | 0.467 | 2.768 | 3.555 |
| 6+ | 418 | 6.483 | 0.175 | 0.517 | 2.606 | 2.699 |

**por_tiempo_hasta_lanzar**

| Grupo | n | yds prom | explosiva | presion | t lanzar | sep objetivo |
|---|---|---|---|---|---|---|
| <=2.0 | 1135 | 5.989 | 0.071 | 0.114 | 1.827 | 2.665 |
| 2-2.5 | 1872 | 6.87 | 0.14 | 0.214 | 2.312 | 3.8 |
| 2.5-3 | 1885 | 7.78 | 0.202 | 0.31 | 2.789 | 4.031 |
| 3-4 | 1814 | 9.019 | 0.253 | 0.389 | 3.446 | 4.003 |
| >4 | 841 | 6.7 | 0.196 | 0.703 | 5.126 | 3.542 |

**presion_vs_no**

| Grupo | n | yds prom | explosiva | presion | t lanzar | sep objetivo |
|---|---|---|---|---|---|---|
| 0 | 5341 | 8.147 | 0.186 | 0.0 | 2.694 | 3.515 |
| 1 | 3216 | 3.935 | 0.132 | 1.0 | 3.477 | 4.065 |

**Correlaciones con playResult**: time_to_throw_s=0.02, presion=-0.192, n_pass_rush=-0.012, sep_target_arrival_yd=0.243, max_speed_off=0.131, dev_time_s=-0.049, defendersInBox=0.005, yardsToGo=0.038, yds_to_endzone=0.116

## 6. Clustering K-Means (numpy, Z-score)

Variables: down, yardsToGo, yds_to_endzone, score_diff_off, defendersInBox, time_event_s, n_pass_rush, presion, sep_target_arrival_yd, max_speed_off, playResult. N=8557. Nulos imputados con mediana. Init k-means++, 10 semillas, se elige la menor inercia. Silhouette sobre muestra de 2500. Estabilidad = coincidencia entre dos semillas distintas.

### k3: varianza explicada 19.0%, silhouette 0.115, estabilidad 0.998

| Cluster | Etiqueta sugerida | n | % | down | yardsToGo | yds_to_endzone | score_diff_off | defendersInBox | time_event_s | n_pass_rush | presion | sep_target_arrival_yd | max_speed_off | playResult | explosiva | sack | incompleto |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Pases rapidos / alta frecuencia | 3667 | 42.85 | 1.557 | 10.327 | 58.388 | -4.203 | 5.935 | 2.745 | 4.095 | 0.025 | 4.356 | 7.947 | 9.2 | 0.213 | 0.0 | 0.253 |
| 1 | Jugadas explosivas / exito grande | 2368 | 27.67 | 2.609 | 5.353 | 37.739 | -1.42 | 6.279 | 2.67 | 4.514 | 0.302 | 1.9 | 7.585 | 5.886 | 0.133 | 0.031 | 0.372 |
| 2 | Jugadas bajo presion | 2522 | 29.47 | 1.96 | 9.56 | 54.263 | -3.962 | 5.909 | 4.134 | 4.226 | 0.955 | 4.208 | 8.372 | 3.367 | 0.128 | 0.186 | 0.375 |

### k4: varianza explicada 23.49%, silhouette 0.098, estabilidad 0.995

| Cluster | Etiqueta sugerida | n | % | down | yardsToGo | yds_to_endzone | score_diff_off | defendersInBox | time_event_s | n_pass_rush | presion | sep_target_arrival_yd | max_speed_off | playResult | explosiva | sack | incompleto |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Jugadas explosivas / exito grande | 1648 | 19.26 | 1.519 | 9.556 | 59.619 | -0.198 | 6.485 | 3.271 | 4.263 | 0.139 | 3.581 | 8.65 | 16.93 | 0.513 | 0.0 | 0.192 |
| 1 | Jugadas bajo presion | 2154 | 25.17 | 2.017 | 9.544 | 53.432 | -4.207 | 5.866 | 4.279 | 4.2 | 0.962 | 3.869 | 8.371 | 1.159 | 0.065 | 0.216 | 0.403 |
| 2 | Pases rapidos / alta frecuencia | 2625 | 30.68 | 1.684 | 10.33 | 57.086 | -6.478 | 5.624 | 2.479 | 4.061 | 0.078 | 4.708 | 7.546 | 5.955 | 0.085 | 0.002 | 0.278 |
| 3 | Situacion larga (3ra y largo / campo propio) | 2130 | 24.89 | 2.611 | 5.274 | 36.211 | -1.115 | 6.313 | 2.676 | 4.521 | 0.333 | 1.816 | 7.569 | 4.76 | 0.099 | 0.035 | 0.394 |
