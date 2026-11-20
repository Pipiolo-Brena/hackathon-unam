# Reporte de arquitectura de datos

Generado por `scripts/01_analisis_y_clustering.py` en 39 s. 122 juegos, semanas 1-8, 8557 jugadas de pase. Solo pandas y numpy.

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

## 3. Normalizacion, llegada y receptor objetivo

left=4431, right=4126. Ofensiva a la izquierda de la defensa al snap tras normalizar: 100.0%.

El tracking termina 5 frames (mediana) despues del lanzamiento (100.0% de los pases con 5 frames o menos): el balon casi nunca llega al receptor dentro de los datos.

Fuente del frame de llegada: cruce_extrapolado=7095, pass_arrived=367, cruce_observado=95, ball_min_speed=35, sin_lanzamiento=953, pass_outcome_caught=12.

Fuente del receptor objetivo: descripcion=7035, trayectoria=569. Cuando hay nombre en la descripcion, la trayectoria del balon elige al mismo receptor en 91.98% de los casos (6471/7035).

Extrapolacion en cruce_extrapolado: mediana 0.46 s, p90 1.30 s, 0.59% topado en 2.5 s.

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
- sep_objetivo_promedio_yd: 3.5635
- hip_flip_promedio_deg: 142.9863
- tasa_trampa_presion: 0.0695
- pases_con_objetivo: 7604
- cobertura_hip_flip: 7603
- pct_objetivo_por_descripcion: 92.52

## 5. Metricas ineditas

- **sep_target_arrival_yd**: n=7604, media=3.563, p25=1.545, mediana=2.862, p75=4.861, max=25.015
- **SOE**: n=7604, media=-0.000, p25=-1.786, mediana=-0.609, p75=1.158, max=20.190
- **hip_flip_deg**: n=7603, media=142.986, p25=116.305, mediana=158.900, p75=176.515, max=180.000
- **dist_ball_target_yd**: n=7604, media=1.352, p25=0.260, mediana=0.617, p75=1.423, max=33.552
- sep_target_arrival_yd > 12 yd: 0.97% de los pases.
- hip_flip_deg base Man 134.7° vs Zone 147.4°.

**Trampa de Presion**: 595 jugadas (18.5% de las jugadas con presion, 24.21% de los pases lanzados bajo presion). Yardas promedio 1.29, faltaron 8.47 yd. Completos: 264 (3.67 yd). Resultado: {'I': 296, 'C': 264, 'IN': 24, 'S': 9, 'R': 2}.

**Top SOE WR/TE (min 15 targets)**

| Jugador | Pos | Equipo | n | valor | sep obj | SOE | hip flip |
|---|---|---|---|---|---|---|---|
| Rondale Moore | WR | ARI | 16 | 3.125 | 6.701 | 3.125 | 129.325 |
| Braxton Berrios | WR | NYJ | 21 | 1.261 | 4.81 | 1.261 | 136.536 |
| Freddie Swain | WR | SEA | 20 | 1.117 | 4.645 | 1.117 | 151.092 |
| Hayden Hurst | TE | ATL | 22 | 0.864 | 4.664 | 0.864 | 128.955 |
| Jonnu Smith | TE | NE | 25 | 0.828 | 4.372 | 0.828 | 132.325 |
| Noah Fant | TE | DEN | 52 | 0.782 | 4.339 | 0.782 | 135.519 |
| Elijah Moore | WR | NYJ | 30 | 0.774 | 4.183 | 0.774 | 144.719 |
| Maxx Williams | TE | ARI | 16 | 0.598 | 4.636 | 0.598 | 157.218 |
| Dallas Goedert | TE | PHI | 29 | 0.585 | 4.159 | 0.585 | 159.89 |
| Dawson Knox | TE | BUF | 24 | 0.577 | 4.2 | 0.577 | 137.418 |

**Top SOE RB/FB (min 15 targets)**

| Jugador | Pos | Equipo | n | valor | sep obj | SOE | hip flip |
|---|---|---|---|---|---|---|---|
| Darrel Williams | RB | KC | 27 | 3.134 | 6.929 | 3.134 | 142.635 |
| Ty Johnson | RB | NYJ | 24 | 2.783 | 6.386 | 2.783 | 150.512 |
| Javonte Williams | RB | DEN | 19 | 2.277 | 6.068 | 2.277 | 141.66 |
| Devin Singletary | RB | BUF | 16 | 2.275 | 6.059 | 2.275 | 139.554 |
| Kenyan Drake | RB | LV | 24 | 1.940 | 5.423 | 1.94 | 125.39 |
| Kenneth Gainwell | RB | PHI | 27 | 1.852 | 5.487 | 1.852 | 127.203 |
| Aaron Jones | RB | GB | 24 | 1.833 | 5.144 | 1.833 | 136.788 |
| Joe Mixon | RB | CIN | 15 | 1.832 | 5.33 | 1.832 | 128.361 |
| Michael Carter | RB | NYJ | 30 | 1.817 | 5.548 | 1.817 | 139.836 |
| Darrell Henderson | RB | LA | 19 | 1.783 | 5.407 | 1.783 | 127.299 |

**Top hip_flip defensores, solo cobertura Man (min 15)**

| Jugador | Pos | Equipo | n | valor | sep obj | SOE | hip flip |
|---|---|---|---|---|---|---|---|
| Anthony Averett | CB | BAL | 30 | 160.9 | 2.192 | -0.517 | 160.882 |
| Kendall Fuller | CB | WAS | 17 | 159.5 | 1.677 | -0.984 | 159.47 |
| Anthony Brown | CB | DAL | 21 | 158.3 | 2.392 | -0.239 | 158.251 |
| Mike Hughes | CB | KC | 16 | 158.0 | 2.044 | -0.586 | 157.973 |
| Janoris Jenkins | CB | TEN | 21 | 154.9 | 2.096 | -0.47 | 154.887 |
| Bryce Callahan | CB | DEN | 16 | 153.8 | 2.475 | -0.047 | 153.756 |
| J.C. Jackson | CB | NE | 36 | 153.6 | 2.77 | 0.13 | 153.577 |
| Jonathan Jones | CB | NE | 17 | 152.3 | 3.088 | 0.431 | 152.285 |
| Kristian Fulton | CB | TEN | 20 | 152.1 | 2.801 | 0.219 | 152.145 |
| William Jackson | CB | WAS | 15 | 151.7 | 2.351 | -0.242 | 151.743 |

**Top hip_flip inducido por WR/TE, solo Man (min 15)**

| Jugador | Pos | Equipo | n | valor | sep obj | SOE | hip flip |
|---|---|---|---|---|---|---|---|
| Corey Davis | WR | NYJ | 18 | 164.3 | 2.501 | -0.081 | 164.259 |
| DeVante Parker | WR | MIA | 15 | 162.2 | 1.459 | -1.234 | 162.221 |
| DeVonta Smith | WR | PHI | 16 | 159.0 | 1.979 | -0.656 | 159.034 |
| Amari Cooper | WR | DAL | 24 | 158.1 | 1.842 | -0.738 | 158.088 |
| Brandin Cooks | WR | HOU | 19 | 156.3 | 2.148 | -0.513 | 156.269 |
| Mike Williams | WR | LAC | 16 | 155.8 | 1.563 | -1.091 | 155.756 |
| A.J. Brown | WR | TEN | 24 | 155.4 | 2.407 | -0.224 | 155.414 |
| Stefon Diggs | WR | BUF | 26 | 154.2 | 2.562 | -0.044 | 154.172 |
| Marquez Callaway | WR | NO | 17 | 153.1 | 2.241 | -0.356 | 153.098 |
| DK Metcalf | WR | SEA | 15 | 151.6 | 1.653 | -0.99 | 151.601 |

## 6. Reglas

**por_cobertura**

| Grupo | n | yds | explosiva | presion | t lanzar | sep obj | SOE | hip flip | trampa |
|---|---|---|---|---|---|---|---|---|---|
| 2-Man | 200 | 7.93 | 0.245 | 0.405 | 3.142 | 2.882 | 0.0 | 134.467 | 0.04 |
| Cover-0 | 270 | 5.037 | 0.119 | 0.511 | 2.453 | 2.893 | -0.0 | 126.116 | 0.078 |
| Cover-1 | 2011 | 6.655 | 0.182 | 0.404 | 2.815 | 2.58 | 0.0 | 135.894 | 0.034 |
| Cover-2 | 1085 | 6.509 | 0.166 | 0.341 | 2.98 | 4.734 | 0.0 | 153.905 | 0.103 |
| Cover-3 | 2665 | 6.904 | 0.175 | 0.363 | 2.917 | 3.932 | -0.0 | 144.631 | 0.08 |
| Cover-6 | 805 | 6.875 | 0.18 | 0.34 | 2.951 | 3.952 | -0.0 | 150.773 | 0.092 |
| Quarters | 1033 | 7.041 | 0.156 | 0.356 | 2.907 | 3.642 | 0.0 | 145.105 | 0.076 |
| Red Zone | 376 | 2.298 | 0.003 | 0.428 | 3.102 | 2.731 | 0.0 | 132.55 | 0.037 |

**por_tipo_cobertura**

| Grupo | n | yds | explosiva | presion | t lanzar | sep obj | SOE | hip flip | trampa |
|---|---|---|---|---|---|---|---|---|---|
| Man | 2481 | 6.582 | 0.181 | 0.416 | 2.798 | 2.638 | 0.0 | 134.666 | 0.04 |
| Other | 488 | 3.219 | 0.039 | 0.42 | 3.154 | 2.725 | 0.0 | 133.414 | 0.039 |
| Zone | 5588 | 6.848 | 0.17 | 0.354 | 2.932 | 4.039 | -0.0 | 147.428 | 0.086 |

**por_formacion**

| Grupo | n | yds | explosiva | presion | t lanzar | sep obj | SOE | hip flip | trampa |
|---|---|---|---|---|---|---|---|---|---|
| EMPTY | 1396 | 6.55 | 0.143 | 0.357 | 2.692 | 3.317 | -0.209 | 143.879 | 0.054 |
| I_FORM | 298 | 7.359 | 0.225 | 0.339 | 3.13 | 3.966 | 0.305 | 138.004 | 0.054 |
| PISTOL | 154 | 7.123 | 0.156 | 0.312 | 3.042 | 4.182 | 0.522 | 144.066 | 0.065 |
| SHOTGUN | 5481 | 6.276 | 0.157 | 0.386 | 2.873 | 3.501 | -0.048 | 144.262 | 0.074 |
| SINGLEBACK | 1189 | 7.741 | 0.224 | 0.364 | 3.23 | 3.979 | 0.318 | 138.095 | 0.073 |

**por_play_action**

| Grupo | n | yds | explosiva | presion | t lanzar | sep obj | SOE | hip flip | trampa |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 6519 | 6.169 | 0.144 | 0.372 | 2.775 | 3.423 | -0.108 | 143.974 | 0.067 |
| 1 | 2038 | 7.828 | 0.236 | 0.388 | 3.33 | 4.017 | 0.349 | 139.787 | 0.076 |

**por_tiempo_bolsa**

| Grupo | n | yds | explosiva | presion | t lanzar | sep obj | SOE | hip flip | trampa |
|---|---|---|---|---|---|---|---|---|---|
| <=2.0 | 1285 | 6.01 | 0.073 | 0.12 | 1.813 | 3.324 | -0.201 | 130.879 | 0.025 |
| 2-2.5 | 1927 | 7.031 | 0.153 | 0.228 | 2.316 | 3.284 | -0.219 | 142.241 | 0.043 |
| 2.5-3 | 1822 | 7.797 | 0.201 | 0.32 | 2.788 | 3.658 | 0.097 | 142.629 | 0.081 |
| 3-4 | 1754 | 8.877 | 0.254 | 0.397 | 3.44 | 4.026 | 0.374 | 147.266 | 0.113 |
| >4 | 816 | 6.495 | 0.19 | 0.716 | 5.135 | 3.396 | -0.189 | 155.425 | 0.165 |

**por_zona_campo**

| Grupo | n | yds | explosiva | presion | t lanzar | sep obj | SOE | hip flip | trampa |
|---|---|---|---|---|---|---|---|---|---|
| Ataque (21-40) | 1560 | 6.178 | 0.183 | 0.378 | 2.875 | 3.523 | -0.0 | 143.518 | 0.07 |
| Campo Propio (61+) | 3613 | 7.301 | 0.182 | 0.364 | 2.904 | 3.674 | -0.0 | 143.959 | 0.071 |
| Medio Campo (41-60) | 2202 | 7.399 | 0.19 | 0.384 | 2.943 | 3.778 | -0.0 | 144.067 | 0.078 |
| Zona Roja (<=20) | 1182 | 3.266 | 0.049 | 0.393 | 2.882 | 2.875 | -0.0 | 137.249 | 0.05 |

**presion_vs_no**

| Grupo | n | yds | explosiva | presion | t lanzar | sep obj | SOE | hip flip | trampa |
|---|---|---|---|---|---|---|---|---|---|
| 0 | 5341 | 8.147 | 0.186 | 0.0 | 2.654 | 3.603 | 0.013 | 142.117 | 0.0 |
| 1 | 3216 | 3.935 | 0.132 | 1.0 | 3.433 | 3.481 | -0.027 | 144.807 | 0.185 |

Correlaciones con playResult: time_to_throw_s=0.015, presion=-0.192, sep_target_arrival_yd=0.197, SOE=0.192, hip_flip_deg=0.063, max_speed_off=0.131, yardsToGo=0.038, yds_to_endzone=0.116

## 7. Clustering K-Means (numpy, Z-score)

Variables: down, yardsToGo, yds_to_endzone, score_diff_off, defendersInBox, time_event_s, n_pass_rush, presion, sep_target_arrival_yd, max_speed_off, playResult. Etiqueta: si centroide yds_to_endzone <= 40 -> 'Zona Roja / Compresión de Campo'; resto por rasgo z dominante.

### k3: varianza explicada 18.45%, silhouette 0.111, estabilidad 0.987

| Cluster | Etiqueta | n | % | down | yardsToGo | yds_to_endzone | score_diff_off | defendersInBox | time_event_s | n_pass_rush | presion | sep_target_arrival_yd | max_speed_off | playResult | explosiva | sack | SOE | trampa |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Bolsa Limpia / Jugadas Explosivas | 3574 | 41.77 | 1.532 | 10.497 | 59.38 | -4.012 | 5.956 | 2.758 | 4.096 | 0.05 | 4.292 | 8.008 | 10.249 | 0.245 | 0.000 | 0.503 | 0.015 |
| 1 | Zona Roja / Compresión de Campo | 2503 | 29.25 | 2.565 | 5.537 | 38.047 | -1.836 | 6.223 | 2.526 | 4.489 | 0.271 | 2.616 | 7.528 | 5.32 | 0.111 | 0.024 | -0.597 | 0.026 |
| 2 | Bolsa Colapsada (Bajo Presión) | 2480 | 28.98 | 1.988 | 9.387 | 53.577 | -3.965 | 5.916 | 4.161 | 4.228 | 0.952 | 3.401 | 8.368 | 2.509 | 0.106 | 0.195 | -0.191 | 0.192 |

### k4: varianza explicada 23.19%, silhouette 0.098, estabilidad 0.744

| Cluster | Etiqueta | n | % | down | yardsToGo | yds_to_endzone | score_diff_off | defendersInBox | time_event_s | n_pass_rush | presion | sep_target_arrival_yd | max_speed_off | playResult | explosiva | sack | SOE | trampa |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Zona Roja / Compresión de Campo | 2104 | 24.59 | 2.628 | 5.161 | 35.717 | -1.737 | 6.311 | 2.578 | 4.584 | 0.326 | 2.509 | 7.582 | 4.997 | 0.105 | 0.030 | -0.643 | 0.034 |
| 1 | Pase Rápido Seguro | 2739 | 32.01 | 1.574 | 10.403 | 58.432 | -4.935 | 5.852 | 2.522 | 4.052 | 0.05 | 2.911 | 7.66 | 5.65 | 0.088 | 0.001 | -0.803 | 0.011 |
| 2 | Bolsa Limpia / Jugadas Explosivas | 1515 | 17.7 | 1.687 | 9.697 | 57.457 | -1.677 | 6.12 | 3.125 | 4.228 | 0.238 | 6.794 | 8.485 | 18.349 | 0.538 | 0.001 | 2.970 | 0.073 |
| 3 | Bolsa Colapsada (Bajo Presión) | 2199 | 25.7 | 2.016 | 9.373 | 53.699 | -4.117 | 5.891 | 4.289 | 4.191 | 0.924 | 2.908 | 8.38 | 1.083 | 0.065 | 0.216 | -0.673 | 0.174 |

## 8. Exportacion web

- `data/insights_partido.json`: 0.12 MB
- `data/featured_plays_tracking.json`: 2.20 MB, 60 jugadas (trampa_presion=15, explosiva=15, soe=15, hip_flip=15), todas con separacion entre 1.0 y 12.0 yd; trampa_presion = pases completos.