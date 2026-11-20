/**
 * Copia real de las respuestas de la API (generada desde backend/main.py con TestClient).
 * Solo se usa cuando USE_MOCK = true en src/services/api.ts (se carga con import dinámico).
 * Tracking: solo 3 frames de una jugada para no inflar el bundle.
 */
import type {
  ChatResponse,
  FeaturedPlay,
  OverviewResponse,
  PlayTrackingResponse,
  ResearchInsightsResponse,
} from '../types/nfl'

export const mockOverview: OverviewResponse = {
  "kpis": {
    "juegos": 122,
    "jugadas": 8557,
    "semanas": [
      1,
      8
    ],
    "yardas_promedio": 6.564,
    "yardas_mediana": 5.0,
    "tasa_explosiva": 0.1658,
    "tasa_presion": 0.3758,
    "tasa_completo": 0.5399,
    "tasa_sack": 0.0635,
    "tasa_intercepcion": 0.0222,
    "tiempo_lanzar_promedio_s": 2.9058,
    "sep_objetivo_promedio_yd": 3.6999,
    "hip_flip_promedio_deg": 136.7277,
    "tasa_trampa_presion": 0.1122,
    "cobertura_sep_objetivo": 8557,
    "cobertura_hip_flip": 8554
  },
  "coberturas": {
    "Cover-3": 2665,
    "Cover-1": 2011,
    "Cover-2": 1085,
    "Quarters": 1033,
    "Cover-6": 805,
    "Red Zone": 376,
    "Cover-0": 270,
    "2-Man": 200,
    "Bracket": 47,
    "Prevent": 32,
    "Goal Line": 25,
    "Miscellaneous": 8
  },
  "tipo_cobertura": {
    "Zone": 5588,
    "Man": 2481,
    "Other": 488
  },
  "formaciones": {
    "SHOTGUN": 5481,
    "EMPTY": 1396,
    "SINGLEBACK": 1189,
    "I_FORM": 298,
    "PISTOL": 154,
    "JUMBO": 30,
    "nan": 7,
    "WILDCAT": 2
  },
  "curva_tiempo_bolsa": [
    {
      "t_desde_s": 1.0,
      "t_hasta_s": 1.5,
      "n": 46.0,
      "yds": 7.0,
      "explosiva": 0.13,
      "presion": 0.065,
      "completo": 0.848,
      "sep_objetivo": 4.485
    },
    {
      "t_desde_s": 1.5,
      "t_hasta_s": 2.0,
      "n": 897.0,
      "yds": 5.955,
      "explosiva": 0.071,
      "presion": 0.108,
      "completo": 0.761,
      "sep_objetivo": 3.339
    },
    {
      "t_desde_s": 2.0,
      "t_hasta_s": 2.5,
      "n": 1821.0,
      "yds": 6.769,
      "explosiva": 0.132,
      "presion": 0.204,
      "completo": 0.659,
      "sep_objetivo": 3.376
    },
    {
      "t_desde_s": 2.5,
      "t_hasta_s": 3.0,
      "n": 1958.0,
      "yds": 7.715,
      "explosiva": 0.196,
      "presion": 0.312,
      "completo": 0.603,
      "sep_objetivo": 3.909
    },
    {
      "t_desde_s": 3.0,
      "t_hasta_s": 3.5,
      "n": 1308.0,
      "yds": 8.689,
      "explosiva": 0.243,
      "presion": 0.344,
      "completo": 0.598,
      "sep_objetivo": 4.283
    },
    {
      "t_desde_s": 3.5,
      "t_hasta_s": 4.0,
      "n": 663.0,
      "yds": 8.561,
      "explosiva": 0.244,
      "presion": 0.44,
      "completo": 0.537,
      "sep_objetivo": 4.326
    },
    {
      "t_desde_s": 4.0,
      "t_hasta_s": 4.5,
      "n": 338.0,
      "yds": 8.95,
      "explosiva": 0.246,
      "presion": 0.559,
      "completo": 0.518,
      "sep_objetivo": 4.213
    },
    {
      "t_desde_s": 4.5,
      "t_hasta_s": 5.0,
      "n": 198.0,
      "yds": 6.293,
      "explosiva": 0.192,
      "presion": 0.697,
      "completo": 0.389,
      "sep_objetivo": 3.422
    },
    {
      "t_desde_s": 5.0,
      "t_hasta_s": 5.5,
      "n": 120.0,
      "yds": 5.208,
      "explosiva": 0.183,
      "presion": 0.842,
      "completo": 0.392,
      "sep_objetivo": 3.834
    },
    {
      "t_desde_s": 5.5,
      "t_hasta_s": 6.0,
      "n": 107.0,
      "yds": 6.57,
      "explosiva": 0.178,
      "presion": 0.757,
      "completo": 0.346,
      "sep_objetivo": 2.602
    },
    {
      "t_desde_s": 6.0,
      "t_hasta_s": 6.5,
      "n": 145.0,
      "yds": 4.186,
      "explosiva": 0.138,
      "presion": 0.855,
      "completo": 0.276,
      "sep_objetivo": 2.592
    }
  ],
  "reglas_tiempo_bolsa": {
    "<=2.0": {
      "n": 1285.0,
      "yds": 6.01,
      "explosiva": 0.073,
      "presion": 0.12,
      "t_throw": 1.813,
      "sep_objetivo": 3.315,
      "soe": -0.352,
      "hip_flip": 124.739,
      "trampa": 0.031
    },
    "2-2.5": {
      "n": 1927.0,
      "yds": 7.031,
      "explosiva": 0.153,
      "presion": 0.228,
      "t_throw": 2.316,
      "sep_objetivo": 3.493,
      "soe": -0.138,
      "hip_flip": 134.463,
      "trampa": 0.062
    },
    "2.5-3": {
      "n": 1822.0,
      "yds": 7.797,
      "explosiva": 0.201,
      "presion": 0.32,
      "t_throw": 2.788,
      "sep_objetivo": 3.995,
      "soe": 0.292,
      "hip_flip": 134.495,
      "trampa": 0.107
    },
    "3-4": {
      "n": 1754.0,
      "yds": 8.877,
      "explosiva": 0.254,
      "presion": 0.397,
      "t_throw": 3.44,
      "sep_objetivo": 4.345,
      "soe": 0.535,
      "hip_flip": 140.693,
      "trampa": 0.131
    },
    ">4": {
      "n": 816.0,
      "yds": 6.495,
      "explosiva": 0.19,
      "presion": 0.716,
      "t_throw": 5.135,
      "sep_objetivo": 3.442,
      "soe": -0.32,
      "hip_flip": 149.202,
      "trampa": 0.164
    }
  },
  "reglas_cobertura": {
    "2-Man": {
      "n": 200.0,
      "yds": 7.93,
      "explosiva": 0.245,
      "presion": 0.405,
      "t_throw": 3.142,
      "sep_objetivo": 2.392,
      "soe": -0.0,
      "hip_flip": 122.027,
      "trampa": 0.05
    },
    "Cover-0": {
      "n": 270.0,
      "yds": 5.037,
      "explosiva": 0.119,
      "presion": 0.511,
      "t_throw": 2.453,
      "sep_objetivo": 2.744,
      "soe": 0.0,
      "hip_flip": 118.719,
      "trampa": 0.126
    },
    "Cover-1": {
      "n": 2011.0,
      "yds": 6.655,
      "explosiva": 0.182,
      "presion": 0.404,
      "t_throw": 2.815,
      "sep_objetivo": 2.563,
      "soe": 0.0,
      "hip_flip": 123.298,
      "trampa": 0.061
    },
    "Cover-2": {
      "n": 1085.0,
      "yds": 6.509,
      "explosiva": 0.166,
      "presion": 0.341,
      "t_throw": 2.98,
      "sep_objetivo": 5.075,
      "soe": -0.0,
      "hip_flip": 153.067,
      "trampa": 0.16
    },
    "Cover-3": {
      "n": 2665.0,
      "yds": 6.904,
      "explosiva": 0.175,
      "presion": 0.363,
      "t_throw": 2.917,
      "sep_objetivo": 4.155,
      "soe": -0.0,
      "hip_flip": 140.404,
      "trampa": 0.131
    },
    "Cover-6": {
      "n": 805.0,
      "yds": 6.875,
      "explosiva": 0.18,
      "presion": 0.34,
      "t_throw": 2.951,
      "sep_objetivo": 4.067,
      "soe": -0.0,
      "hip_flip": 144.469,
      "trampa": 0.122
    },
    "Quarters": {
      "n": 1033.0,
      "yds": 7.041,
      "explosiva": 0.156,
      "presion": 0.356,
      "t_throw": 2.907,
      "sep_objetivo": 3.911,
      "soe": -0.0,
      "hip_flip": 140.804,
      "trampa": 0.129
    },
    "Red Zone": {
      "n": 376.0,
      "yds": 2.298,
      "explosiva": 0.003,
      "presion": 0.428,
      "t_throw": 3.102,
      "sep_objetivo": 2.809,
      "soe": -0.0,
      "hip_flip": 131.004,
      "trampa": 0.088
    }
  },
  "reglas_formacion": {
    "EMPTY": {
      "n": 1396.0,
      "yds": 6.55,
      "explosiva": 0.143,
      "presion": 0.357,
      "t_throw": 2.692,
      "sep_objetivo": 3.25,
      "soe": -0.406,
      "hip_flip": 140.133,
      "trampa": 0.072
    },
    "I_FORM": {
      "n": 298.0,
      "yds": 7.359,
      "explosiva": 0.225,
      "presion": 0.339,
      "t_throw": 3.13,
      "sep_objetivo": 4.018,
      "soe": 0.2,
      "hip_flip": 129.458,
      "trampa": 0.107
    },
    "PISTOL": {
      "n": 154.0,
      "yds": 7.123,
      "explosiva": 0.156,
      "presion": 0.312,
      "t_throw": 3.042,
      "sep_objetivo": 4.366,
      "soe": 0.496,
      "hip_flip": 143.077,
      "trampa": 0.117
    },
    "SHOTGUN": {
      "n": 5481.0,
      "yds": 6.276,
      "explosiva": 0.157,
      "presion": 0.386,
      "t_throw": 2.873,
      "sep_objetivo": 3.701,
      "soe": 0.021,
      "hip_flip": 137.03,
      "trampa": 0.122
    },
    "SINGLEBACK": {
      "n": 1189.0,
      "yds": 7.741,
      "explosiva": 0.224,
      "presion": 0.364,
      "t_throw": 3.23,
      "sep_objetivo": 4.099,
      "soe": 0.274,
      "hip_flip": 132.926,
      "trampa": 0.118
    }
  },
  "reglas_play_action": {
    "0": {
      "n": 6519.0,
      "yds": 6.169,
      "explosiva": 0.144,
      "presion": 0.372,
      "t_throw": 2.775,
      "sep_objetivo": 3.582,
      "soe": -0.078,
      "hip_flip": 137.208,
      "trampa": 0.109
    },
    "1": {
      "n": 2038.0,
      "yds": 7.828,
      "explosiva": 0.236,
      "presion": 0.388,
      "t_throw": 3.33,
      "sep_objetivo": 4.077,
      "soe": 0.25,
      "hip_flip": 135.19,
      "trampa": 0.122
    }
  }
}

export const mockResearch: ResearchInsightsResponse = {
  "clusters": {
    "varianza_explicada_pct": 22.87,
    "silhouette_muestra": 0.099,
    "estabilidad_semillas": 0.743,
    "clusters": [
      {
        "cluster": 0,
        "n": 2205,
        "pct": 25.77,
        "centroide_real": {
          "down": 2.029,
          "yardsToGo": 9.295,
          "yds_to_endzone": 53.08,
          "score_diff_off": -4.364,
          "defendersInBox": 5.835,
          "time_event_s": 4.287,
          "n_pass_rush": 4.098,
          "presion": 0.949,
          "sep_target_arrival_yd": 3.607,
          "max_speed_off": 8.358,
          "playResult": 2.082
        },
        "centroide_z": {
          "down": 0.072,
          "yardsToGo": 0.146,
          "yds_to_endzone": 0.069,
          "score_diff_off": -0.098,
          "defendersInBox": -0.186,
          "time_event_s": 1.017,
          "n_pass_rush": -0.229,
          "presion": 1.183,
          "sep_target_arrival_yd": -0.035,
          "max_speed_off": 0.452,
          "playResult": -0.422
        },
        "tasa_explosiva": 0.0957,
        "tasa_sack": 0.205,
        "tasa_incompleto": 0.3846,
        "soe_promedio": -0.1547,
        "hip_flip_promedio": 145.1268,
        "tasa_trampa": 0.3234,
        "cobertura_top": {
          "Cover-3": 696,
          "Cover-1": 474,
          "Quarters": 301
        },
        "etiqueta": "Bolsa Colapsada (Bajo Presión)"
      },
      {
        "cluster": 1,
        "n": 2889,
        "pct": 33.76,
        "centroide_real": {
          "down": 1.466,
          "yardsToGo": 10.833,
          "yds_to_endzone": 61.893,
          "score_diff_off": -3.925,
          "defendersInBox": 5.986,
          "time_event_s": 2.834,
          "n_pass_rush": 4.056,
          "presion": 0.06,
          "sep_target_arrival_yd": 4.796,
          "max_speed_off": 8.136,
          "playResult": 10.571
        },
        "centroide_z": {
          "down": -0.574,
          "yardsToGo": 0.539,
          "yds_to_endzone": 0.442,
          "score_diff_off": -0.055,
          "defendersInBox": -0.036,
          "time_event_s": -0.224,
          "n_pass_rush": -0.294,
          "presion": -0.652,
          "sep_target_arrival_yd": 0.418,
          "max_speed_off": 0.192,
          "playResult": 0.378
        },
        "tasa_explosiva": 0.2579,
        "tasa_sack": 0.0,
        "tasa_incompleto": 0.2229,
        "soe_promedio": 0.7314,
        "hip_flip_promedio": 140.3926,
        "tasa_trampa": 0.0204,
        "cobertura_top": {
          "Cover-3": 1102,
          "Cover-2": 516,
          "Quarters": 426
        },
        "etiqueta": "Bolsa Limpia / Jugadas Explosivas"
      },
      {
        "cluster": 2,
        "n": 2151,
        "pct": 25.14,
        "centroide_real": {
          "down": 2.442,
          "yardsToGo": 6.283,
          "yds_to_endzone": 39.576,
          "score_diff_off": -3.789,
          "defendersInBox": 5.803,
          "time_event_s": 2.5,
          "n_pass_rush": 4.0,
          "presion": 0.121,
          "sep_target_arrival_yd": 2.836,
          "max_speed_off": 7.449,
          "playResult": 5.745
        },
        "centroide_z": {
          "down": 0.545,
          "yardsToGo": -0.624,
          "yds_to_endzone": -0.503,
          "score_diff_off": -0.042,
          "defendersInBox": -0.218,
          "time_event_s": -0.509,
          "n_pass_rush": -0.379,
          "presion": -0.526,
          "sep_target_arrival_yd": -0.33,
          "max_speed_off": -0.612,
          "playResult": -0.077
        },
        "tasa_explosiva": 0.1065,
        "tasa_sack": 0.0102,
        "tasa_incompleto": 0.3431,
        "soe_promedio": -0.606,
        "hip_flip_promedio": 131.6616,
        "tasa_trampa": 0.0195,
        "cobertura_top": {
          "Cover-1": 621,
          "Cover-3": 492,
          "Quarters": 248
        },
        "etiqueta": "Zona Roja / Compresión de Campo"
      },
      {
        "cluster": 3,
        "n": 1312,
        "pct": 15.33,
        "centroide_real": {
          "down": 2.184,
          "yardsToGo": 7.124,
          "yds_to_endzone": 45.235,
          "score_diff_off": 0.265,
          "defendersInBox": 6.777,
          "time_event_s": 2.651,
          "n_pass_rush": 5.338,
          "presion": 0.526,
          "sep_target_arrival_yd": 2.859,
          "max_speed_off": 7.819,
          "playResult": 6.615
        },
        "centroide_z": {
          "down": 0.249,
          "yardsToGo": -0.409,
          "yds_to_endzone": -0.263,
          "score_diff_off": 0.355,
          "defendersInBox": 0.749,
          "time_event_s": -0.38,
          "n_pass_rush": 1.655,
          "presion": 0.31,
          "sep_target_arrival_yd": -0.321,
          "max_speed_off": -0.179,
          "playResult": 0.005
        },
        "tasa_explosiva": 0.1784,
        "tasa_sack": 0.0526,
        "tasa_incompleto": 0.4002,
        "soe_promedio": -0.3571,
        "hip_flip_promedio": 122.8493,
        "tasa_trampa": 0.1113,
        "cobertura_top": {
          "Cover-1": 529,
          "Cover-3": 375,
          "Cover-0": 211
        },
        "etiqueta": "Blitz / Caja Cargada"
      }
    ]
  },
  "rankings": {
    "receptores_soe": [
      {
        "nflId": 53464,
        "n": 34,
        "valor": 2.332,
        "team": "DEN",
        "sep_objetivo": 6.251,
        "yds": 3.912,
        "displayName": "Javonte Williams",
        "officialPosition": "RB"
      },
      {
        "nflId": 47969,
        "n": 47,
        "valor": 2.04,
        "team": "NYJ",
        "sep_objetivo": 5.718,
        "yds": 5.638,
        "displayName": "Ty Johnson",
        "officialPosition": "RB"
      },
      {
        "nflId": 47853,
        "n": 41,
        "valor": 1.826,
        "team": "LA",
        "sep_objetivo": 5.761,
        "yds": 12.122,
        "displayName": "Darrell Henderson",
        "officialPosition": "RB"
      },
      {
        "nflId": 47879,
        "n": 36,
        "valor": 1.676,
        "team": "BUF",
        "sep_objetivo": 5.175,
        "yds": 4.028,
        "displayName": "Dawson Knox",
        "officialPosition": "TE"
      },
      {
        "nflId": 46526,
        "n": 55,
        "valor": 1.573,
        "team": "KC",
        "sep_objetivo": 5.436,
        "yds": 5.945,
        "displayName": "Darrel Williams",
        "officialPosition": "RB"
      },
      {
        "nflId": 44975,
        "n": 35,
        "valor": 1.454,
        "team": "TEN",
        "sep_objetivo": 5.215,
        "yds": 4.657,
        "displayName": "Jeremy McNichols",
        "officialPosition": "RB"
      },
      {
        "nflId": 45573,
        "n": 65,
        "valor": 1.442,
        "team": "LAC",
        "sep_objetivo": 5.173,
        "yds": 5.938,
        "displayName": "Austin Ekeler",
        "officialPosition": "RB"
      },
      {
        "nflId": 53555,
        "n": 51,
        "valor": 1.306,
        "team": "CAR",
        "sep_objetivo": 5.293,
        "yds": 4.294,
        "displayName": "Chuba Hubbard",
        "officialPosition": "RB"
      },
      {
        "nflId": 52733,
        "n": 55,
        "valor": 1.287,
        "team": "JAX",
        "sep_objetivo": 5.175,
        "yds": 5.309,
        "displayName": "James Robinson",
        "officialPosition": "RB"
      },
      {
        "nflId": 41286,
        "n": 32,
        "valor": 1.261,
        "team": "JAX",
        "sep_objetivo": 5.543,
        "yds": 7.0,
        "displayName": "Carlos Hyde",
        "officialPosition": "RB"
      },
      {
        "nflId": 47857,
        "n": 49,
        "valor": 1.238,
        "team": "BUF",
        "sep_objetivo": 4.774,
        "yds": 4.939,
        "displayName": "Devin Singletary",
        "officialPosition": "RB"
      },
      {
        "nflId": 43362,
        "n": 48,
        "valor": 1.228,
        "team": "LV",
        "sep_objetivo": 4.617,
        "yds": 7.083,
        "displayName": "Kenyan Drake",
        "officialPosition": "RB"
      },
      {
        "nflId": 53579,
        "n": 57,
        "valor": 1.179,
        "team": "PHI",
        "sep_objetivo": 4.778,
        "yds": 4.351,
        "displayName": "Kenneth Gainwell",
        "officialPosition": "RB"
      },
      {
        "nflId": 52449,
        "n": 47,
        "valor": 1.095,
        "team": "IND",
        "sep_objetivo": 4.984,
        "yds": 6.277,
        "displayName": "Jonathan Taylor",
        "officialPosition": "RB"
      },
      {
        "nflId": 52443,
        "n": 92,
        "valor": 1.045,
        "team": "DET",
        "sep_objetivo": 4.897,
        "yds": 4.598,
        "displayName": "D'Andre Swift",
        "officialPosition": "RB"
      }
    ],
    "receptores_hip_flip_inducido": [
      {
        "nflId": 40641,
        "n": 31,
        "valor": 155.919,
        "team": "IND",
        "sep_objetivo": 3.198,
        "yds": 7.419,
        "displayName": "Jack Doyle",
        "officialPosition": "TE"
      },
      {
        "nflId": 53555,
        "n": 51,
        "valor": 151.238,
        "team": "CAR",
        "sep_objetivo": 5.293,
        "yds": 4.294,
        "displayName": "Chuba Hubbard",
        "officialPosition": "RB"
      },
      {
        "nflId": 41282,
        "n": 36,
        "valor": 150.384,
        "team": "GB",
        "sep_objetivo": 2.946,
        "yds": 7.611,
        "displayName": "Davante Adams",
        "officialPosition": "WR"
      },
      {
        "nflId": 53435,
        "n": 51,
        "valor": 149.355,
        "team": "MIA",
        "sep_objetivo": 3.226,
        "yds": 4.725,
        "displayName": "Jaylen Waddle",
        "officialPosition": "WR"
      },
      {
        "nflId": 40011,
        "n": 97,
        "valor": 148.601,
        "team": "KC",
        "sep_objetivo": 3.063,
        "yds": 7.979,
        "displayName": "Travis Kelce",
        "officialPosition": "TE"
      },
      {
        "nflId": 42033,
        "n": 34,
        "valor": 148.051,
        "team": "TB",
        "sep_objetivo": 2.766,
        "yds": 7.118,
        "displayName": "Cameron Brate",
        "officialPosition": "TE"
      },
      {
        "nflId": 38947,
        "n": 47,
        "valor": 147.298,
        "team": "BUF",
        "sep_objetivo": 3.396,
        "yds": 6.255,
        "displayName": "Cole Beasley",
        "officialPosition": "WR"
      },
      {
        "nflId": 46111,
        "n": 54,
        "valor": 146.797,
        "team": "MIA",
        "sep_objetivo": 2.724,
        "yds": 8.519,
        "displayName": "Mike Gesicki",
        "officialPosition": "TE"
      },
      {
        "nflId": 46203,
        "n": 73,
        "valor": 146.79,
        "team": "ARI",
        "sep_objetivo": 4.398,
        "yds": 9.534,
        "displayName": "Chase Edmonds",
        "officialPosition": "RB"
      },
      {
        "nflId": 42489,
        "n": 36,
        "valor": 146.774,
        "team": "BUF",
        "sep_objetivo": 2.587,
        "yds": 7.25,
        "displayName": "Stefon Diggs",
        "officialPosition": "WR"
      },
      {
        "nflId": 44896,
        "n": 37,
        "valor": 145.844,
        "team": "TB",
        "sep_objetivo": 2.474,
        "yds": 8.811,
        "displayName": "Chris Godwin",
        "officialPosition": "WR"
      },
      {
        "nflId": 45102,
        "n": 41,
        "valor": 145.641,
        "team": "IND",
        "sep_objetivo": 3.402,
        "yds": 8.0,
        "displayName": "Zach Pascal",
        "officialPosition": "WR"
      },
      {
        "nflId": 44975,
        "n": 35,
        "valor": 145.399,
        "team": "TEN",
        "sep_objetivo": 5.215,
        "yds": 4.657,
        "displayName": "Jeremy McNichols",
        "officialPosition": "RB"
      },
      {
        "nflId": 40078,
        "n": 37,
        "valor": 145.027,
        "team": "SF",
        "sep_objetivo": 4.68,
        "yds": 8.811,
        "displayName": "Kyle Juszczyk",
        "officialPosition": "FB"
      },
      {
        "nflId": 39989,
        "n": 44,
        "valor": 144.876,
        "team": "LA",
        "sep_objetivo": 3.025,
        "yds": 5.977,
        "displayName": "Robert Woods",
        "officialPosition": "WR"
      }
    ],
    "defensores_hip_flip": [
      {
        "nflId": 43641,
        "n": 56,
        "valor": 159.924,
        "team": "CIN",
        "sep_objetivo": 3.641,
        "yds": 7.214,
        "displayName": "Mike Hilton",
        "officialPosition": "CB"
      },
      {
        "nflId": 46190,
        "n": 42,
        "valor": 157.192,
        "team": "BUF",
        "sep_objetivo": 3.537,
        "yds": 6.524,
        "displayName": "Taron Johnson",
        "officialPosition": "CB"
      },
      {
        "nflId": 42391,
        "n": 43,
        "valor": 156.698,
        "team": "LV",
        "sep_objetivo": 3.306,
        "yds": 6.372,
        "displayName": "Denzel Perryman",
        "officialPosition": "ILB"
      },
      {
        "nflId": 41269,
        "n": 30,
        "valor": 156.37,
        "team": "NE",
        "sep_objetivo": 3.583,
        "yds": 4.033,
        "displayName": "Kyle Van Noy",
        "officialPosition": "OLB"
      },
      {
        "nflId": 47888,
        "n": 31,
        "valor": 154.444,
        "team": "NO",
        "sep_objetivo": 3.448,
        "yds": 11.387,
        "displayName": "Chauncey Gardner-Johnson",
        "officialPosition": "SS"
      },
      {
        "nflId": 53596,
        "n": 40,
        "valor": 154.326,
        "team": "LV",
        "sep_objetivo": 4.37,
        "yds": 5.625,
        "displayName": "Nate Hobbs",
        "officialPosition": "CB"
      },
      {
        "nflId": 46194,
        "n": 34,
        "valor": 154.191,
        "team": "PHI",
        "sep_objetivo": 3.747,
        "yds": 4.471,
        "displayName": "Avonte Maddox",
        "officialPosition": "CB"
      },
      {
        "nflId": 46085,
        "n": 49,
        "valor": 153.607,
        "team": "BUF",
        "sep_objetivo": 3.505,
        "yds": 5.204,
        "displayName": "Tremaine Edmunds",
        "officialPosition": "MLB"
      },
      {
        "nflId": 43373,
        "n": 42,
        "valor": 152.46,
        "team": "WAS",
        "sep_objetivo": 3.435,
        "yds": 5.952,
        "displayName": "Kendall Fuller",
        "officialPosition": "CB"
      },
      {
        "nflId": 46775,
        "n": 31,
        "valor": 150.051,
        "team": "NE",
        "sep_objetivo": 2.951,
        "yds": 6.323,
        "displayName": "J.C. Jackson",
        "officialPosition": "CB"
      },
      {
        "nflId": 44839,
        "n": 32,
        "valor": 149.928,
        "team": "BUF",
        "sep_objetivo": 3.646,
        "yds": 4.688,
        "displayName": "Tre'Davious White",
        "officialPosition": "CB"
      },
      {
        "nflId": 42388,
        "n": 67,
        "valor": 149.288,
        "team": "MIN",
        "sep_objetivo": 3.404,
        "yds": 7.478,
        "displayName": "Eric Kendricks",
        "officialPosition": "ILB"
      },
      {
        "nflId": 44869,
        "n": 35,
        "valor": 149.188,
        "team": "HOU",
        "sep_objetivo": 3.61,
        "yds": 7.0,
        "displayName": "Zach Cunningham",
        "officialPosition": "ILB"
      },
      {
        "nflId": 52663,
        "n": 58,
        "valor": 148.233,
        "team": "NYG",
        "sep_objetivo": 5.136,
        "yds": 5.586,
        "displayName": "Tae Crowder",
        "officialPosition": "ILB"
      },
      {
        "nflId": 48780,
        "n": 45,
        "valor": 148.032,
        "team": "LA",
        "sep_objetivo": 3.505,
        "yds": 5.956,
        "displayName": "Troy Reeder",
        "officialPosition": "ILB"
      }
    ],
    "min_jugadas": 30
  },
  "trampa_presion": {
    "definicion": "presion PFF == 1 y sep_target_arrival_yd > 3.5 y playResult < yardsToGo",
    "n": 960,
    "pct_de_jugadas": 11.22,
    "pct_de_jugadas_con_presion": 29.85,
    "yardas_promedio": -0.474,
    "yardas_faltantes_promedio": 10.1115,
    "sep_objetivo_promedio": 6.2205,
    "tiempo_lanzar_promedio": 3.3171,
    "por_resultado": {
      "I": 389,
      "C": 282,
      "S": 200,
      "R": 54,
      "IN": 35
    },
    "por_down": {
      "1": 335,
      "3": 299,
      "2": 295,
      "4": 31
    },
    "por_cobertura": {
      "Cover-3": {
        "n": 348,
        "tasa_sobre_presion": 0.36
      },
      "Cover-2": {
        "n": 174,
        "tasa_sobre_presion": 0.47
      },
      "Quarters": {
        "n": 133,
        "tasa_sobre_presion": 0.361
      },
      "Cover-1": {
        "n": 123,
        "tasa_sobre_presion": 0.151
      },
      "Cover-6": {
        "n": 98,
        "tasa_sobre_presion": 0.358
      },
      "Cover-0": {
        "n": 34,
        "tasa_sobre_presion": 0.246
      },
      "Red Zone": {
        "n": 33,
        "tasa_sobre_presion": 0.205
      },
      "2-Man": {
        "n": 10,
        "tasa_sobre_presion": 0.123
      },
      "Prevent": {
        "n": 3,
        "tasa_sobre_presion": 0.273
      },
      "Bracket": {
        "n": 3,
        "tasa_sobre_presion": 0.158
      },
      "Miscellaneous": {
        "n": 1,
        "tasa_sobre_presion": 0.333
      }
    },
    "por_equipo_ofensivo": {
      "NYJ": {
        "n": 47,
        "tasa_sobre_presion": 0.42
      },
      "MIA": {
        "n": 46,
        "tasa_sobre_presion": 0.338
      },
      "DET": {
        "n": 44,
        "tasa_sobre_presion": 0.338
      },
      "CAR": {
        "n": 42,
        "tasa_sobre_presion": 0.333
      },
      "IND": {
        "n": 37,
        "tasa_sobre_presion": 0.327
      },
      "PHI": {
        "n": 35,
        "tasa_sobre_presion": 0.304
      },
      "BAL": {
        "n": 35,
        "tasa_sobre_presion": 0.318
      },
      "JAX": {
        "n": 35,
        "tasa_sobre_presion": 0.333
      },
      "NYG": {
        "n": 35,
        "tasa_sobre_presion": 0.312
      },
      "DEN": {
        "n": 35,
        "tasa_sobre_presion": 0.294
      }
    },
    "comparacion_presion_sep_alta": {
      "trampa_yds": -0.474,
      "presion_sep_alta_convierte_yds": 16.9368
    }
  },
  "metodologia": {
    "fuente": "NFL Big Data Bowl 2023 (semanas 1-8, jugadas de pase)",
    "normalizacion": "ataque siempre a la derecha; x=120-x, y=53.3-y, o/dir +180 cuando playDirection=left",
    "llegada": "primer evento de pass_arrived, pass_outcome_caught, pass_outcome_incomplete, pass_outcome_interception, pass_outcome_touchdown tras el snap; si no hay, penultimo frame",
    "hip_flip_nota": "max |o-dir| (0-180) del Coverage mas cercano al objetivo, snap->llegada, solo frames con s >= 1.0 yd/s",
    "soe_nota": "sep_target_arrival_yd - media de (pff_passCoverage, zona_campo)"
  }
}

export const mockPlays: FeaturedPlay[] = [
  {"gameId": 2021091907, "playId": 1438, "week": 2, "quarter": 2, "down": 1, "yardsToGo": 10, "possessionTeam": "PHI", "defensiveTeam": "SF", "playDescription": "(7:12) (Shotgun) J.Hurts pass deep right to Q.Watkins to SF 6 for 91 yards (D.Lenoir; J.Tartt).", "passResult": "C", "playResult": 91, "prePenaltyPlayResult": 91, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-1", "pff_passCoverageType": "Man", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 97, "time_to_throw_s": 2.6, "presion": 1, "sep_target_arrival_yd": 1.6513, "sep_esperada_yd": 2.5703, "SOE": -0.919, "hip_flip_deg": 93.72, "checkdown_trap": 0, "max_speed_off": 9.24, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 47836, "cov_def_nflId": 46139, "snap_frame": 7, "arrival_frame": 37, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "Miles Sanders", "cov_def_name": "Fred Warner"},
  {"gameId": 2021102500, "playId": 326, "week": 7, "quarter": 1, "down": 2, "yardsToGo": 10, "possessionTeam": "SEA", "defensiveTeam": "NO", "playDescription": "(10:22) G.Smith pass deep right to D.Metcalf for 84 yards, TOUCHDOWN.", "passResult": "C", "playResult": 84, "prePenaltyPlayResult": 84, "offenseFormation": "SINGLEBACK", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 84, "time_to_throw_s": 3.0, "presion": 0, "sep_target_arrival_yd": 7.5389, "sep_esperada_yd": 4.2128, "SOE": 3.326, "hip_flip_deg": 106.4, "checkdown_trap": 0, "max_speed_off": 8.45, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 43460, "cov_def_nflId": 34465, "snap_frame": 7, "arrival_frame": 41, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "Alex Collins", "cov_def_name": "Malcolm Jenkins"},
  {"gameId": 2021102400, "playId": 2522, "week": 7, "quarter": 3, "down": 3, "yardsToGo": 2, "possessionTeam": "CIN", "defensiveTeam": "BAL", "playDescription": "(6:02) (Shotgun) J.Burrow pass short right to J.Chase for 82 yards, TOUCHDOWN.", "passResult": "C", "playResult": 82, "prePenaltyPlayResult": 82, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-1", "pff_passCoverageType": "Man", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 82, "time_to_throw_s": 2.0, "presion": 0, "sep_target_arrival_yd": 0.7122, "sep_esperada_yd": 2.5703, "SOE": -1.8581, "hip_flip_deg": 45.05, "checkdown_trap": 0, "max_speed_off": 6.3, "cluster_id": 2, "cluster_label": "Zona Roja / Compresión de Campo", "target_nflId": 44927, "cov_def_nflId": 44859, "snap_frame": 7, "arrival_frame": 31, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "Samaje Perine", "cov_def_name": "Tyus Bowser"},
  {"gameId": 2021091204, "playId": 2596, "week": 1, "quarter": 3, "down": 3, "yardsToGo": 8, "possessionTeam": "SF", "defensiveTeam": "DET", "playDescription": "(8:08) (Shotgun) J.Garoppolo pass deep right to D.Samuel for 79 yards, TOUCHDOWN [J.Collins].", "passResult": "C", "playResult": 79, "prePenaltyPlayResult": 79, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-1", "pff_passCoverageType": "Man", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 79, "time_to_throw_s": 2.5, "presion": 1, "sep_target_arrival_yd": 1.7322, "sep_esperada_yd": 2.5703, "SOE": -0.8381, "hip_flip_deg": 75.43, "checkdown_trap": 0, "max_speed_off": 8.28, "cluster_id": 3, "cluster_label": "Blitz / Caja Cargada", "target_nflId": 38613, "cov_def_nflId": 53957, "snap_frame": 7, "arrival_frame": 36, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "Mohamed Sanu", "cov_def_name": "A.J. Parker"},
  {"gameId": 2021091909, "playId": 1797, "week": 2, "quarter": 2, "down": 1, "yardsToGo": 10, "possessionTeam": "ARI", "defensiveTeam": "MIN", "playDescription": "(1:46) (Shotgun) K.Murray pass deep left to R.Moore for 77 yards, TOUCHDOWN.", "passResult": "C", "playResult": 77, "prePenaltyPlayResult": 77, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 77, "time_to_throw_s": 5.6, "presion": 1, "sep_target_arrival_yd": 2.614, "sep_esperada_yd": 4.2128, "SOE": -1.5989, "hip_flip_deg": 179.83, "checkdown_trap": 0, "max_speed_off": 9.09, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 46203, "cov_def_nflId": 43343, "snap_frame": 7, "arrival_frame": 67, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "Chase Edmonds", "cov_def_name": "Mackensie Alexander"},
  {"gameId": 2021100310, "playId": 2711, "week": 4, "quarter": 3, "down": 1, "yardsToGo": 10, "possessionTeam": "SF", "defensiveTeam": "SEA", "playDescription": "(2:22) (Shotgun) T.Lance pass deep right to D.Samuel for 76 yards, TOUCHDOWN. Caught at SF 48.  52-YAC", "passResult": "C", "playResult": 76, "prePenaltyPlayResult": 76, "offenseFormation": "PISTOL", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 76, "time_to_throw_s": 3.3, "presion": 0, "sep_target_arrival_yd": 3.0973, "sep_esperada_yd": 4.2128, "SOE": -1.1156, "hip_flip_deg": 165.34, "checkdown_trap": 0, "max_speed_off": 8.76, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 44959, "cov_def_nflId": 38577, "snap_frame": 6, "arrival_frame": 43, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "George Kittle", "cov_def_name": "Bobby Wagner"},
  {"gameId": 2021092611, "playId": 2280, "week": 3, "quarter": 3, "down": 3, "yardsToGo": 10, "possessionTeam": "LA", "defensiveTeam": "TB", "playDescription": "(14:12) (No Huddle, Shotgun) M.Stafford pass deep right to D.Jackson for 75 yards, TOUCHDOWN.", "passResult": "C", "playResult": 75, "prePenaltyPlayResult": 75, "offenseFormation": "SHOTGUN", "pff_passCoverage": "2-Man", "pff_passCoverageType": "Man", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 75, "time_to_throw_s": 3.9, "presion": 1, "sep_target_arrival_yd": 2.3531, "sep_esperada_yd": 2.5226, "SOE": -0.1696, "hip_flip_deg": 77.75, "checkdown_trap": 0, "max_speed_off": 8.72, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 46100, "cov_def_nflId": 47788, "snap_frame": 6, "arrival_frame": 49, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "Sony Michel", "cov_def_name": "Devin White"},
  {"gameId": 2021101710, "playId": 3874, "week": 6, "quarter": 4, "down": 1, "yardsToGo": 10, "possessionTeam": "NE", "defensiveTeam": "DAL", "playDescription": "(2:21) (Shotgun) M.Jones pass deep left to K.Bourne for 75 yards, TOUCHDOWN.", "passResult": "C", "playResult": 75, "prePenaltyPlayResult": 75, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-1", "pff_passCoverageType": "Man", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 75, "time_to_throw_s": 2.8, "presion": 0, "sep_target_arrival_yd": 0.8587, "sep_esperada_yd": 2.5703, "SOE": -1.7116, "hip_flip_deg": 92.57, "checkdown_trap": 0, "max_speed_off": 8.63, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 39212, "cov_def_nflId": 53441, "snap_frame": 7, "arrival_frame": 39, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "Brandon Bolden", "cov_def_name": "Micah Parsons"},
  {"gameId": 2021091209, "playId": 3093, "week": 1, "quarter": 4, "down": 1, "yardsToGo": 10, "possessionTeam": "KC", "defensiveTeam": "CLE", "playDescription": "(10:24) (Shotgun) P.Mahomes pass deep right to T.Hill for 75 yards, TOUCHDOWN [J.Elliott].", "passResult": "C", "playResult": 75, "prePenaltyPlayResult": 75, "offenseFormation": "EMPTY", "pff_passCoverage": "Quarters", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 75, "time_to_throw_s": 4.7, "presion": 1, "sep_target_arrival_yd": 0.686, "sep_esperada_yd": 3.8753, "SOE": -3.1893, "hip_flip_deg": 121.66, "checkdown_trap": 0, "max_speed_off": 9.27, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 40011, "cov_def_nflId": 53481, "snap_frame": 6, "arrival_frame": 57, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "Travis Kelce", "cov_def_name": "Jeremiah Owusu-Koramoah"},
  {"gameId": 2021103112, "playId": 2072, "week": 8, "quarter": 3, "down": 3, "yardsToGo": 8, "possessionTeam": "DAL", "defensiveTeam": "MIN", "playDescription": "(14:18) (Shotgun) C.Rush pass deep middle to C.Wilson for 73 yards, TOUCHDOWN.", "passResult": "C", "playResult": 73, "prePenaltyPlayResult": 73, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-2", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 73, "time_to_throw_s": 2.8, "presion": 0, "sep_target_arrival_yd": 6.6022, "sep_esperada_yd": 5.2251, "SOE": 1.3772, "hip_flip_deg": 139.03, "checkdown_trap": 0, "max_speed_off": 8.25, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 46206, "cov_def_nflId": 42388, "snap_frame": 6, "arrival_frame": 38, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "Dalton Schultz", "cov_def_name": "Eric Kendricks"},
  {"gameId": 2021101008, "playId": 327, "week": 5, "quarter": 1, "down": 3, "yardsToGo": 7, "possessionTeam": "NO", "defensiveTeam": "WAS", "playDescription": "(11:23) (Shotgun) J.Winston pass deep middle to D.Harris for 72 yards, TOUCHDOWN.", "passResult": "C", "playResult": 72, "prePenaltyPlayResult": 72, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 72, "time_to_throw_s": 2.8, "presion": 0, "sep_target_arrival_yd": 5.8364, "sep_esperada_yd": 4.2128, "SOE": 1.6236, "hip_flip_deg": 156.38, "checkdown_trap": 0, "max_speed_off": 9.59, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 42437, "cov_def_nflId": 52624, "snap_frame": 13, "arrival_frame": 45, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "Ty Montgomery", "cov_def_name": "Kamren Curl"},
  {"gameId": 2021101009, "playId": 1117, "week": 5, "quarter": 2, "down": 3, "yardsToGo": 10, "possessionTeam": "LAC", "defensiveTeam": "CLE", "playDescription": "(11:53) (No Huddle, Shotgun) J.Herbert pass deep middle to M.Williams for 72 yards, TOUCHDOWN [M.Garrett].", "passResult": "C", "playResult": 72, "prePenaltyPlayResult": 72, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Quarters", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 72, "time_to_throw_s": 3.1, "presion": 0, "sep_target_arrival_yd": 1.2844, "sep_esperada_yd": 3.8753, "SOE": -2.5909, "hip_flip_deg": 126.97, "checkdown_trap": 0, "max_speed_off": 9.35, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 52520, "cov_def_nflId": 53481, "snap_frame": 6, "arrival_frame": 41, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "Joshua Kelley", "cov_def_name": "Jeremiah Owusu-Koramoah"},
  {"gameId": 2021101009, "playId": 3207, "week": 5, "quarter": 4, "down": 2, "yardsToGo": 3, "possessionTeam": "CLE", "defensiveTeam": "LAC", "playDescription": "(10:53) (No Huddle, Shotgun) B.Mayfield pass short middle to D.Njoku for 71 yards, TOUCHDOWN.", "passResult": "C", "playResult": 71, "prePenaltyPlayResult": 71, "offenseFormation": "EMPTY", "pff_passCoverage": "Quarters", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 71, "time_to_throw_s": 3.3, "presion": 0, "sep_target_arrival_yd": 1.5521, "sep_esperada_yd": 3.8753, "SOE": -2.3232, "hip_flip_deg": 167.0, "checkdown_trap": 0, "max_speed_off": 9.51, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 43370, "cov_def_nflId": 46117, "snap_frame": 6, "arrival_frame": 43, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "Austin Hooper", "cov_def_name": "Uchenna Nwosu"},
  {"gameId": 2021101002, "playId": 1717, "week": 5, "quarter": 2, "down": 2, "yardsToGo": 5, "possessionTeam": "CIN", "defensiveTeam": "GB", "playDescription": "(:50) (No Huddle, Shotgun) J.Burrow pass deep right to J.Chase for 70 yards, TOUCHDOWN.", "passResult": "C", "playResult": 70, "prePenaltyPlayResult": 70, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-6", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 70, "time_to_throw_s": 7.9, "presion": 0, "sep_target_arrival_yd": 7.8657, "sep_esperada_yd": 4.1102, "SOE": 3.7555, "hip_flip_deg": 168.51, "checkdown_trap": 0, "max_speed_off": 9.81, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 44927, "cov_def_nflId": 44845, "snap_frame": 6, "arrival_frame": 89, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "Samaje Perine", "cov_def_name": "Kevin King"},
  {"gameId": 2021091206, "playId": 1687, "week": 1, "quarter": 2, "down": 2, "yardsToGo": 20, "possessionTeam": "SEA", "defensiveTeam": "IND", "playDescription": "(:51) (Shotgun) R.Wilson pass deep middle to T.Lockett for 69 yards, TOUCHDOWN.", "passResult": "C", "playResult": 69, "prePenaltyPlayResult": 69, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-6", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 69, "time_to_throw_s": 3.8, "presion": 0, "sep_target_arrival_yd": 1.7441, "sep_esperada_yd": 4.1102, "SOE": -2.3661, "hip_flip_deg": 165.92, "checkdown_trap": 0, "max_speed_off": 8.88, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 45062, "cov_def_nflId": 47872, "snap_frame": 8, "arrival_frame": 50, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "Chris Carson", "cov_def_name": "Bobby Okereke"},
  {"gameId": 2021101706, "playId": 819, "week": 6, "quarter": 1, "down": 1, "yardsToGo": 10, "possessionTeam": "NYG", "defensiveTeam": "LA", "playDescription": "(3:07) (No Huddle) D.Jones pass incomplete deep right.", "passResult": "I", "playResult": 0, "prePenaltyPlayResult": 0, "offenseFormation": "SINGLEBACK", "pff_passCoverage": "Cover-6", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 68, "time_to_throw_s": 5.4, "presion": 1, "sep_target_arrival_yd": 22.2449, "sep_esperada_yd": 4.1102, "SOE": 18.1346, "hip_flip_deg": 157.28, "checkdown_trap": 1, "max_speed_off": 8.83, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 43425, "cov_def_nflId": 46191, "snap_frame": 6, "arrival_frame": 64, "arrival_source": "penultimate_frame", "tags": ["soe", "trampa_presion"], "primary_tag": "soe", "target_name": "Devontae Booker", "cov_def_name": "Kenny Young"},
  {"gameId": 2021091903, "playId": 353, "week": 2, "quarter": 1, "down": 1, "yardsToGo": 10, "possessionTeam": "LA", "defensiveTeam": "IND", "playDescription": "(6:47) M.Stafford pass short left to D.Henderson to IND 49 for 23 yards (J.Blackmon; B.Okereke).", "passResult": "C", "playResult": 23, "prePenaltyPlayResult": 23, "offenseFormation": "SINGLEBACK", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 72, "time_to_throw_s": 5.0, "presion": 0, "sep_target_arrival_yd": 20.7216, "sep_esperada_yd": 4.2128, "SOE": 16.5088, "hip_flip_deg": 179.24, "checkdown_trap": 0, "max_speed_off": 9.41, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 47853, "cov_def_nflId": 47892, "snap_frame": 6, "arrival_frame": 60, "arrival_source": "penultimate_frame", "tags": ["soe", "explosiva"], "primary_tag": "soe", "target_name": "Darrell Henderson", "cov_def_name": "Khari Willis"},
  {"gameId": 2021093000, "playId": 2387, "week": 4, "quarter": 3, "down": 2, "yardsToGo": 6, "possessionTeam": "JAX", "defensiveTeam": "CIN", "playDescription": "(4:21) (Shotgun) T.Lawrence pass deep left to J.Agnew ran ob at CIN 46 for 27 yards.", "passResult": "C", "playResult": 27, "prePenaltyPlayResult": 27, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-1", "pff_passCoverageType": "Man", "pff_playAction": 1, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 73, "time_to_throw_s": 4.5, "presion": 1, "sep_target_arrival_yd": 16.528, "sep_esperada_yd": 2.5703, "SOE": 13.9576, "hip_flip_deg": 174.05, "checkdown_trap": 0, "max_speed_off": 9.07, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 52733, "cov_def_nflId": 47855, "snap_frame": 6, "arrival_frame": 55, "arrival_source": "penultimate_frame", "tags": ["soe", "explosiva"], "primary_tag": "soe", "target_name": "James Robinson", "cov_def_name": "Germaine Pratt"},
  {"gameId": 2021100309, "playId": 1520, "week": 4, "quarter": 2, "down": 3, "yardsToGo": 10, "possessionTeam": "LA", "defensiveTeam": "ARI", "playDescription": "(8:36) (No Huddle, Shotgun) M.Stafford pass short right to V.Jefferson to LA 39 for 14 yards (I.Simmons).", "passResult": "C", "playResult": 14, "prePenaltyPlayResult": 14, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 75, "time_to_throw_s": 3.6, "presion": 0, "sep_target_arrival_yd": 17.8621, "sep_esperada_yd": 4.2128, "SOE": 13.6493, "hip_flip_deg": 178.24, "checkdown_trap": 0, "max_speed_off": 7.76, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 47853, "cov_def_nflId": 52416, "snap_frame": 6, "arrival_frame": 46, "arrival_source": "penultimate_frame", "tags": ["soe"], "primary_tag": "soe", "target_name": "Darrell Henderson", "cov_def_name": "Isaiah Simmons"},
  {"gameId": 2021091200, "playId": 4346, "week": 1, "quarter": 4, "down": 4, "yardsToGo": 13, "possessionTeam": "ATL", "defensiveTeam": "PHI", "playDescription": "(3:19) (Shotgun) M.Ryan sacked at ATL 31 for -10 yards (J.Hargrave).", "passResult": "S", "playResult": -10, "prePenaltyPlayResult": -10, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Quarters", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Medio Campo (41-60)", "yds_to_endzone": 59, "time_to_throw_s": null, "presion": 1, "sep_target_arrival_yd": 16.7445, "sep_esperada_yd": 4.1244, "SOE": 12.6201, "hip_flip_deg": 145.31, "checkdown_trap": 1, "max_speed_off": 8.4, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 42469, "cov_def_nflId": 42929, "snap_frame": 8, "arrival_frame": 49, "arrival_source": "penultimate_frame", "tags": ["soe", "trampa_presion"], "primary_tag": "soe", "target_name": "Mike Davis", "cov_def_name": "Alex Singleton"},
  {"gameId": 2021091906, "playId": 2909, "week": 2, "quarter": 4, "down": 1, "yardsToGo": 10, "possessionTeam": "NYJ", "defensiveTeam": "NE", "playDescription": "(14:19) Z.Wilson pass incomplete short right to Mi.Carter.", "passResult": "I", "playResult": 0, "prePenaltyPlayResult": 0, "offenseFormation": "SINGLEBACK", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Medio Campo (41-60)", "yds_to_endzone": 55, "time_to_throw_s": 4.2, "presion": 1, "sep_target_arrival_yd": 16.9015, "sep_esperada_yd": 4.3849, "SOE": 12.5166, "hip_flip_deg": 176.18, "checkdown_trap": 1, "max_speed_off": 9.52, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 53536, "cov_def_nflId": 42116, "snap_frame": 6, "arrival_frame": 52, "arrival_source": "penultimate_frame", "tags": ["soe", "trampa_presion"], "primary_tag": "soe", "target_name": "Michael Carter", "cov_def_name": "Adrian Phillips"},
  {"gameId": 2021101800, "playId": 3550, "week": 6, "quarter": 4, "down": 3, "yardsToGo": 17, "possessionTeam": "BUF", "defensiveTeam": "TEN", "playDescription": "(8:14) (Shotgun) J.Allen pass incomplete deep right to J.Kumerow.", "passResult": "I", "playResult": 0, "prePenaltyPlayResult": 0, "offenseFormation": "PISTOL", "pff_passCoverage": "Cover-2", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 70, "time_to_throw_s": 3.4, "presion": 0, "sep_target_arrival_yd": 17.4648, "sep_esperada_yd": 5.2251, "SOE": 12.2397, "hip_flip_deg": 147.59, "checkdown_trap": 0, "max_speed_off": 10.07, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 52494, "cov_def_nflId": 45335, "snap_frame": 6, "arrival_frame": 44, "arrival_source": "penultimate_frame", "tags": ["soe"], "primary_tag": "soe", "target_name": "Zack Moss", "cov_def_name": "Breon Borders"},
  {"gameId": 2021103101, "playId": 2813, "week": 8, "quarter": 3, "down": 1, "yardsToGo": 8, "possessionTeam": "BUF", "defensiveTeam": "MIA", "playDescription": "(3:56) (Shotgun) J.Allen pass short right to G.Davis for 8 yards, TOUCHDOWN. PENALTY on MIA-J.Phillips, Face Mask (15 Yards), 15 yards, enforced between downs.", "passResult": "C", "playResult": 8, "prePenaltyPlayResult": 8, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-1", "pff_passCoverageType": "Man", "pff_playAction": 1, "zona_campo": "Zona Roja (<=20)", "yds_to_endzone": 8, "time_to_throw_s": 4.2, "presion": 1, "sep_target_arrival_yd": 14.5127, "sep_esperada_yd": 2.2805, "SOE": 12.2322, "hip_flip_deg": 65.63, "checkdown_trap": 0, "max_speed_off": 8.41, "cluster_id": 3, "cluster_label": "Blitz / Caja Cargada", "target_nflId": 52536, "cov_def_nflId": 43327, "snap_frame": 7, "arrival_frame": 53, "arrival_source": "penultimate_frame", "tags": ["soe"], "primary_tag": "soe", "target_name": "Gabe Davis", "cov_def_name": "Xavien Howard"},
  {"gameId": 2021091201, "playId": 4074, "week": 1, "quarter": 4, "down": 1, "yardsToGo": 10, "possessionTeam": "BUF", "defensiveTeam": "PIT", "playDescription": "(2:00) (Shotgun) J.Allen pass short right to D.Knox pushed ob at PIT 37 for 13 yards (T.Norwood).", "passResult": "C", "playResult": 13, "prePenaltyPlayResult": 13, "offenseFormation": "EMPTY", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Medio Campo (41-60)", "yds_to_endzone": 50, "time_to_throw_s": 3.2, "presion": 0, "sep_target_arrival_yd": 16.2237, "sep_esperada_yd": 4.3849, "SOE": 11.8388, "hip_flip_deg": 175.36, "checkdown_trap": 0, "max_speed_off": 7.81, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 47879, "cov_def_nflId": 53674, "snap_frame": 6, "arrival_frame": 42, "arrival_source": "penultimate_frame", "tags": ["soe"], "primary_tag": "soe", "target_name": "Dawson Knox", "cov_def_name": "Tre Norwood"},
  {"gameId": 2021091600, "playId": 1759, "week": 2, "quarter": 2, "down": 1, "yardsToGo": 10, "possessionTeam": "WAS", "defensiveTeam": "NYG", "playDescription": "(2:05) (No Huddle, Shotgun) T.Heinicke pass short right to A.Humphries ran ob at NYG 31 for 7 yards (D.Holmes).", "passResult": "C", "playResult": 7, "prePenaltyPlayResult": 7, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-6", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Ataque (21-40)", "yds_to_endzone": 38, "time_to_throw_s": 2.9, "presion": 0, "sep_target_arrival_yd": 15.6709, "sep_esperada_yd": 4.1479, "SOE": 11.523, "hip_flip_deg": 74.44, "checkdown_trap": 0, "max_speed_off": 8.57, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 43010, "cov_def_nflId": 52518, "snap_frame": 7, "arrival_frame": 40, "arrival_source": "penultimate_frame", "tags": ["soe"], "primary_tag": "soe", "target_name": "Adam Humphries", "cov_def_name": "Darnay Holmes"},
  {"gameId": 2021102402, "playId": 648, "week": 7, "quarter": 1, "down": 1, "yardsToGo": 10, "possessionTeam": "ATL", "defensiveTeam": "MIA", "playDescription": "(4:03) M.Ryan pass short right to H.Hurst pushed ob at MIA 49 for 11 yards (A.Van Ginkel).", "passResult": "C", "playResult": 11, "prePenaltyPlayResult": 11, "offenseFormation": "SINGLEBACK", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Medio Campo (41-60)", "yds_to_endzone": 60, "time_to_throw_s": 3.1, "presion": 0, "sep_target_arrival_yd": 15.8984, "sep_esperada_yd": 4.3849, "SOE": 11.5135, "hip_flip_deg": 178.7, "checkdown_trap": 0, "max_speed_off": 8.06, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 46094, "cov_def_nflId": 47934, "snap_frame": 6, "arrival_frame": 41, "arrival_source": "penultimate_frame", "tags": ["soe"], "primary_tag": "soe", "target_name": "Hayden Hurst", "cov_def_name": "Andrew Van Ginkel"},
  {"gameId": 2021092613, "playId": 931, "week": 3, "quarter": 2, "down": 2, "yardsToGo": 8, "possessionTeam": "GB", "defensiveTeam": "SF", "playDescription": "(15:00) (Shotgun) Aa.Rodgers pass short right to M.Valdes-Scantling to GB 43 for no gain (J.Ward). Penalty on GB-Y.Nijman, Ineligible Downfield Pass, declined. Caught at GB 35.  8-YAC", "passResult": "C", "playResult": 0, "prePenaltyPlayResult": 0, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-1", "pff_passCoverageType": "Man", "pff_playAction": 0, "zona_campo": "Medio Campo (41-60)", "yds_to_endzone": 57, "time_to_throw_s": 3.1, "presion": 1, "sep_target_arrival_yd": 13.5788, "sep_esperada_yd": 2.648, "SOE": 10.9308, "hip_flip_deg": 92.15, "checkdown_trap": 1, "max_speed_off": 8.3, "cluster_id": 3, "cluster_label": "Blitz / Caja Cargada", "target_nflId": 46243, "cov_def_nflId": 41256, "snap_frame": 7, "arrival_frame": 42, "arrival_source": "penultimate_frame", "tags": ["soe", "trampa_presion"], "primary_tag": "soe", "target_name": "Marquez Valdes-Scantling", "cov_def_name": "Jimmie Ward"},
  {"gameId": 2021091300, "playId": 692, "week": 1, "quarter": 1, "down": 2, "yardsToGo": 10, "possessionTeam": "BAL", "defensiveTeam": "LV", "playDescription": "(4:03) (Shotgun) L.Jackson pass short left to T.Williams to LV 44 for 21 yards (C.Hayward).", "passResult": "C", "playResult": 21, "prePenaltyPlayResult": 21, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 65, "time_to_throw_s": 3.8, "presion": 0, "sep_target_arrival_yd": 15.1227, "sep_esperada_yd": 4.2128, "SOE": 10.9098, "hip_flip_deg": 179.07, "checkdown_trap": 0, "max_speed_off": 9.61, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 53180, "cov_def_nflId": 43797, "snap_frame": 6, "arrival_frame": 48, "arrival_source": "penultimate_frame", "tags": ["soe", "explosiva"], "primary_tag": "soe", "target_name": "Ty'Son Williams", "cov_def_name": "Cory Littleton"},
  {"gameId": 2021091202, "playId": 2586, "week": 1, "quarter": 3, "down": 3, "yardsToGo": 19, "possessionTeam": "NYJ", "defensiveTeam": "CAR", "playDescription": "(7:50) (Shotgun) Z.Wilson pass short left to T.Johnson pushed ob at NYJ 29 for 11 yards (S.Thompson).", "passResult": "C", "playResult": 11, "prePenaltyPlayResult": 11, "offenseFormation": "EMPTY", "pff_passCoverage": "Cover-6", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 82, "time_to_throw_s": 4.4, "presion": 0, "sep_target_arrival_yd": 14.9504, "sep_esperada_yd": 4.1102, "SOE": 10.8401, "hip_flip_deg": 179.04, "checkdown_trap": 0, "max_speed_off": 9.35, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 47969, "cov_def_nflId": 42368, "snap_frame": 6, "arrival_frame": 54, "arrival_source": "penultimate_frame", "tags": ["soe"], "primary_tag": "soe", "target_name": "Ty Johnson", "cov_def_name": "Shaq Thompson"},
  {"gameId": 2021092300, "playId": 971, "week": 3, "quarter": 2, "down": 2, "yardsToGo": 8, "possessionTeam": "CAR", "defensiveTeam": "HOU", "playDescription": "(11:34) (Shotgun) S.Darnold pass incomplete short right to C.Hubbard.", "passResult": "I", "playResult": 0, "prePenaltyPlayResult": 0, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Red Zone", "pff_passCoverageType": "Other", "pff_playAction": 0, "zona_campo": "Zona Roja (<=20)", "yds_to_endzone": 12, "time_to_throw_s": 3.1, "presion": 0, "sep_target_arrival_yd": 13.3725, "sep_esperada_yd": 2.8086, "SOE": 10.5639, "hip_flip_deg": 149.03, "checkdown_trap": 0, "max_speed_off": 7.38, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 53555, "cov_def_nflId": 44964, "snap_frame": 7, "arrival_frame": 42, "arrival_source": "penultimate_frame", "tags": ["soe"], "primary_tag": "soe", "target_name": "Chuba Hubbard", "cov_def_name": "Desmond King"},
  {"gameId": 2021091912, "playId": 796, "week": 2, "quarter": 1, "down": 3, "yardsToGo": 6, "possessionTeam": "SEA", "defensiveTeam": "TEN", "playDescription": "(1:30) (Shotgun) R.Wilson pass short right to F.Swain to SEA 38 for 9 yards (J.Jenkins; D.Cruikshank).", "passResult": "C", "playResult": 9, "prePenaltyPlayResult": 9, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-2", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 71, "time_to_throw_s": 2.4, "presion": 0, "sep_target_arrival_yd": 4.6646, "sep_esperada_yd": 5.2251, "SOE": -0.5605, "hip_flip_deg": 180.0, "checkdown_trap": 0, "max_speed_off": 7.62, "cluster_id": 2, "cluster_label": "Zona Roja / Compresión de Campo", "target_nflId": 52622, "cov_def_nflId": 38569, "snap_frame": 6, "arrival_frame": 34, "arrival_source": "penultimate_frame", "tags": ["hip_flip"], "primary_tag": "hip_flip", "target_name": "Freddie Swain", "cov_def_name": "Janoris Jenkins"},
  {"gameId": 2021100400, "playId": 1077, "week": 4, "quarter": 2, "down": 3, "yardsToGo": 2, "possessionTeam": "LAC", "defensiveTeam": "LV", "playDescription": "(13:43) (Shotgun) J.Herbert pass incomplete deep right to M.Williams.", "passResult": "I", "playResult": 0, "prePenaltyPlayResult": 0, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 82, "time_to_throw_s": 2.4, "presion": 1, "sep_target_arrival_yd": 4.7538, "sep_esperada_yd": 4.2128, "SOE": 0.541, "hip_flip_deg": 180.0, "checkdown_trap": 1, "max_speed_off": 8.87, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 46320, "cov_def_nflId": 43797, "snap_frame": 6, "arrival_frame": 34, "arrival_source": "penultimate_frame", "tags": ["hip_flip", "trampa_presion"], "primary_tag": "hip_flip", "target_name": "Justin Jackson", "cov_def_name": "Cory Littleton"},
  {"gameId": 2021101005, "playId": 918, "week": 5, "quarter": 2, "down": 2, "yardsToGo": 10, "possessionTeam": "MIN", "defensiveTeam": "DET", "playDescription": "(14:24) (Shotgun) K.Cousins pass incomplete short right to J.Jefferson.", "passResult": "I", "playResult": 0, "prePenaltyPlayResult": 0, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-6", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Medio Campo (41-60)", "yds_to_endzone": 52, "time_to_throw_s": 2.3, "presion": 0, "sep_target_arrival_yd": 1.0418, "sep_esperada_yd": 3.9504, "SOE": -2.9086, "hip_flip_deg": 180.0, "checkdown_trap": 0, "max_speed_off": 7.12, "cluster_id": 2, "cluster_label": "Zona Roja / Compresión de Campo", "target_nflId": 40488, "cov_def_nflId": 53957, "snap_frame": 6, "arrival_frame": 33, "arrival_source": "penultimate_frame", "tags": ["hip_flip"], "primary_tag": "hip_flip", "target_name": "Adam Thielen", "cov_def_name": "A.J. Parker"},
  {"gameId": 2021100700, "playId": 1492, "week": 5, "quarter": 2, "down": 1, "yardsToGo": 10, "possessionTeam": "LA", "defensiveTeam": "SEA", "playDescription": "(2:11) (No Huddle) M.Stafford pass short right to R.Woods ran ob at SEA 15 for 6 yards.", "passResult": "C", "playResult": 6, "prePenaltyPlayResult": 6, "offenseFormation": "SINGLEBACK", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Ataque (21-40)", "yds_to_endzone": 21, "time_to_throw_s": 3.6, "presion": 0, "sep_target_arrival_yd": 3.92, "sep_esperada_yd": 3.878, "SOE": 0.042, "hip_flip_deg": 180.0, "checkdown_trap": 0, "max_speed_off": 8.32, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 44881, "cov_def_nflId": 44818, "snap_frame": 6, "arrival_frame": 46, "arrival_source": "penultimate_frame", "tags": ["hip_flip"], "primary_tag": "hip_flip", "target_name": "Cooper Kupp", "cov_def_name": "Jamal Adams"},
  {"gameId": 2021102402, "playId": 2375, "week": 7, "quarter": 3, "down": 2, "yardsToGo": 10, "possessionTeam": "MIA", "defensiveTeam": "ATL", "playDescription": "(8:09) (No Huddle, Shotgun) T.Tagovailoa pass short left to J.Waddle ran ob at ATL 23 for 14 yards (E.Harris).", "passResult": "C", "playResult": 14, "prePenaltyPlayResult": 14, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-2", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Ataque (21-40)", "yds_to_endzone": 37, "time_to_throw_s": 3.2, "presion": 0, "sep_target_arrival_yd": 5.4369, "sep_esperada_yd": 4.7586, "SOE": 0.6784, "hip_flip_deg": 179.99, "checkdown_trap": 0, "max_speed_off": 7.57, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 48017, "cov_def_nflId": 43341, "snap_frame": 6, "arrival_frame": 42, "arrival_source": "penultimate_frame", "tags": ["hip_flip"], "primary_tag": "hip_flip", "target_name": "Myles Gaskin", "cov_def_name": "Deion Jones"},
  {"gameId": 2021091203, "playId": 2186, "week": 1, "quarter": 2, "down": 2, "yardsToGo": 20, "possessionTeam": "MIN", "defensiveTeam": "CIN", "playDescription": "(:20) (Shotgun) K.Cousins pass incomplete short right to K.Osborn. Penalty on MIN, Illegal Formation, declined.", "passResult": "I", "playResult": 0, "prePenaltyPlayResult": 0, "offenseFormation": "EMPTY", "pff_passCoverage": "Cover-1", "pff_passCoverageType": "Man", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 70, "time_to_throw_s": 2.8, "presion": 1, "sep_target_arrival_yd": 2.299, "sep_esperada_yd": 2.5703, "SOE": -0.2714, "hip_flip_deg": 179.99, "checkdown_trap": 0, "max_speed_off": 8.0, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 52584, "cov_def_nflId": 43641, "snap_frame": 6, "arrival_frame": 38, "arrival_source": "penultimate_frame", "tags": ["hip_flip"], "primary_tag": "hip_flip", "target_name": "K.J. Osborn", "cov_def_name": "Mike Hilton"},
  {"gameId": 2021092612, "playId": 1394, "week": 3, "quarter": 2, "down": 2, "yardsToGo": 3, "possessionTeam": "SEA", "defensiveTeam": "MIN", "playDescription": "(4:43) R.Wilson pass short left to W.Dissly pushed ob at MIN 33 for 39 yards (E.Kendricks).", "passResult": "C", "playResult": 39, "prePenaltyPlayResult": 39, "offenseFormation": "SINGLEBACK", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 72, "time_to_throw_s": 2.4, "presion": 0, "sep_target_arrival_yd": 2.7763, "sep_esperada_yd": 4.2128, "SOE": -1.4366, "hip_flip_deg": 179.99, "checkdown_trap": 0, "max_speed_off": 8.89, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 46189, "cov_def_nflId": 42388, "snap_frame": 7, "arrival_frame": 35, "arrival_source": "penultimate_frame", "tags": ["hip_flip", "explosiva"], "primary_tag": "hip_flip", "target_name": "Will Dissly", "cov_def_name": "Eric Kendricks"},
  {"gameId": 2021092607, "playId": 962, "week": 3, "quarter": 1, "down": 2, "yardsToGo": 13, "possessionTeam": "PIT", "defensiveTeam": "CIN", "playDescription": "(:46) (Shotgun) B.Roethlisberger pass short left to C.Claypool to PIT 40 for 6 yards (M.Hilton, A.Davis-Gaither).", "passResult": "C", "playResult": 6, "prePenaltyPlayResult": 6, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-2", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 66, "time_to_throw_s": 2.8, "presion": 0, "sep_target_arrival_yd": 0.507, "sep_esperada_yd": 5.2251, "SOE": -4.7181, "hip_flip_deg": 179.99, "checkdown_trap": 0, "max_speed_off": 7.55, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 52457, "cov_def_nflId": 43641, "snap_frame": 6, "arrival_frame": 38, "arrival_source": "penultimate_frame", "tags": ["hip_flip"], "primary_tag": "hip_flip", "target_name": "Chase Claypool", "cov_def_name": "Mike Hilton"},
  {"gameId": 2021092602, "playId": 386, "week": 3, "quarter": 1, "down": 3, "yardsToGo": 6, "possessionTeam": "DET", "defensiveTeam": "BAL", "playDescription": "(10:01) (Shotgun) J.Goff sacked at DET 40 for -12 yards (C.Clark).", "passResult": "S", "playResult": -12, "prePenaltyPlayResult": -12, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-2", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Medio Campo (41-60)", "yds_to_endzone": 48, "time_to_throw_s": null, "presion": 1, "sep_target_arrival_yd": 5.4092, "sep_esperada_yd": 5.1417, "SOE": 0.2675, "hip_flip_deg": 179.99, "checkdown_trap": 1, "max_speed_off": 8.0, "cluster_id": 3, "cluster_label": "Blitz / Caja Cargada", "target_nflId": 48053, "cov_def_nflId": 52436, "snap_frame": 6, "arrival_frame": 42, "arrival_source": "penultimate_frame", "tags": ["hip_flip", "trampa_presion"], "primary_tag": "hip_flip", "target_name": "Trinity Benson", "cov_def_name": "Patrick Queen"},
  {"gameId": 2021092600, "playId": 258, "week": 3, "quarter": 1, "down": 2, "yardsToGo": 9, "possessionTeam": "BUF", "defensiveTeam": "WAS", "playDescription": "(11:01) (Shotgun) Jos.Allen pass deep right to E.Sanders for 28 yards, TOUCHDOWN. Caught along sideline.", "passResult": "C", "playResult": 28, "prePenaltyPlayResult": 28, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-2", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Ataque (21-40)", "yds_to_endzone": 28, "time_to_throw_s": 5.5, "presion": 1, "sep_target_arrival_yd": 3.7305, "sep_esperada_yd": 4.7586, "SOE": -1.0281, "hip_flip_deg": 179.98, "checkdown_trap": 0, "max_speed_off": 8.68, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 44985, "cov_def_nflId": 53503, "snap_frame": 6, "arrival_frame": 65, "arrival_source": "penultimate_frame", "tags": ["hip_flip", "explosiva"], "primary_tag": "hip_flip", "target_name": "Isaiah McKenzie", "cov_def_name": "Benjamin St-Juste"},
  {"gameId": 2021103108, "playId": 54, "week": 8, "quarter": 1, "down": 1, "yardsToGo": 10, "possessionTeam": "LAC", "defensiveTeam": "NE", "playDescription": "(15:00) (Shotgun) J.Herbert pass short right to J.Cook to LAC 37 for 12 yards (J.Bentley).", "passResult": "C", "playResult": 12, "prePenaltyPlayResult": 12, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-2", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 75, "time_to_throw_s": 2.7, "presion": 0, "sep_target_arrival_yd": 2.7821, "sep_esperada_yd": 5.2251, "SOE": -2.4429, "hip_flip_deg": 179.98, "checkdown_trap": 0, "max_speed_off": 7.85, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 34540, "cov_def_nflId": 46212, "snap_frame": 7, "arrival_frame": 38, "arrival_source": "penultimate_frame", "tags": ["hip_flip"], "primary_tag": "hip_flip", "target_name": "Jared Cook", "cov_def_name": "Ja'Whaun Bentley"},
  {"gameId": 2021092300, "playId": 2377, "week": 3, "quarter": 3, "down": 2, "yardsToGo": 9, "possessionTeam": "CAR", "defensiveTeam": "HOU", "playDescription": "(9:57) (Shotgun) S.Darnold pass short left to Dj.Moore to CAR 20 for 10 yards (Z.Cunningham).", "passResult": "C", "playResult": 10, "prePenaltyPlayResult": 10, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-2", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 90, "time_to_throw_s": 1.7, "presion": 0, "sep_target_arrival_yd": 1.5219, "sep_esperada_yd": 5.2251, "SOE": -3.7032, "hip_flip_deg": 179.98, "checkdown_trap": 0, "max_speed_off": 6.15, "cluster_id": 2, "cluster_label": "Zona Roja / Compresión de Campo", "target_nflId": 45785, "cov_def_nflId": 44869, "snap_frame": 7, "arrival_frame": 28, "arrival_source": "penultimate_frame", "tags": ["hip_flip"], "primary_tag": "hip_flip", "target_name": "Dan Arnold", "cov_def_name": "Zach Cunningham"},
  {"gameId": 2021092300, "playId": 319, "week": 3, "quarter": 1, "down": 2, "yardsToGo": 9, "possessionTeam": "CAR", "defensiveTeam": "HOU", "playDescription": "(9:49) (Shotgun) S.Darnold pass incomplete short left to Dj.Moore.", "passResult": "I", "playResult": 0, "prePenaltyPlayResult": 0, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-6", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 75, "time_to_throw_s": 6.1, "presion": 1, "sep_target_arrival_yd": 2.6538, "sep_esperada_yd": 4.1102, "SOE": -1.4565, "hip_flip_deg": 179.98, "checkdown_trap": 0, "max_speed_off": 8.65, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 44820, "cov_def_nflId": 44869, "snap_frame": 7, "arrival_frame": 72, "arrival_source": "penultimate_frame", "tags": ["hip_flip"], "primary_tag": "hip_flip", "target_name": "Christian McCaffrey", "cov_def_name": "Zach Cunningham"},
  {"gameId": 2021101000, "playId": 2340, "week": 5, "quarter": 3, "down": 2, "yardsToGo": 10, "possessionTeam": "ATL", "defensiveTeam": "NYJ", "playDescription": "(9:07) (Shotgun) M.Ryan pass incomplete short left to O.Zaccheaus [S.Lawson].", "passResult": "I", "playResult": 0, "prePenaltyPlayResult": 0, "offenseFormation": "EMPTY", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Medio Campo (41-60)", "yds_to_endzone": 60, "time_to_throw_s": 2.6, "presion": 1, "sep_target_arrival_yd": 2.9178, "sep_esperada_yd": 4.3849, "SOE": -1.4671, "hip_flip_deg": 179.98, "checkdown_trap": 0, "max_speed_off": 7.34, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 43429, "cov_def_nflId": 43301, "snap_frame": 6, "arrival_frame": 36, "arrival_source": "penultimate_frame", "tags": ["hip_flip"], "primary_tag": "hip_flip", "target_name": "Tajae Sharpe", "cov_def_name": "Sheldon Rankins"},
  {"gameId": 2021092605, "playId": 4020, "week": 3, "quarter": 4, "down": 3, "yardsToGo": 15, "possessionTeam": "NE", "defensiveTeam": "NO", "playDescription": "(:49) (No Huddle, Shotgun) M.Jones pass short middle to J.Meyers to NO 39 for 10 yards (M.Jenkins).", "passResult": "C", "playResult": 10, "prePenaltyPlayResult": 10, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Medio Campo (41-60)", "yds_to_endzone": 49, "time_to_throw_s": 3.4, "presion": 0, "sep_target_arrival_yd": 10.1801, "sep_esperada_yd": 4.3849, "SOE": 5.7952, "hip_flip_deg": 179.97, "checkdown_trap": 0, "max_speed_off": 8.84, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 48097, "cov_def_nflId": 42421, "snap_frame": 3, "arrival_frame": 41, "arrival_source": "penultimate_frame", "tags": ["hip_flip"], "primary_tag": "hip_flip", "target_name": "Jakobi Meyers", "cov_def_name": "P.J. Williams"},
  {"gameId": 2021101707, "playId": 1063, "week": 6, "quarter": 2, "down": 3, "yardsToGo": 10, "possessionTeam": "KC", "defensiveTeam": "WAS", "playDescription": "(13:30) (Shotgun) P.Mahomes pass short left to B.Pringle to WAS 34 for 7 yards (K.Fuller).", "passResult": "C", "playResult": 7, "prePenaltyPlayResult": 7, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Quarters", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Medio Campo (41-60)", "yds_to_endzone": 41, "time_to_throw_s": 3.7, "presion": 1, "sep_target_arrival_yd": 14.2659, "sep_esperada_yd": 4.1244, "SOE": 10.1415, "hip_flip_deg": 178.57, "checkdown_trap": 1, "max_speed_off": 8.68, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 46522, "cov_def_nflId": 43373, "snap_frame": 7, "arrival_frame": 48, "arrival_source": "penultimate_frame", "tags": ["trampa_presion"], "primary_tag": "trampa_presion", "target_name": "Byron Pringle", "cov_def_name": "Kendall Fuller"},
  {"gameId": 2021103102, "playId": 1614, "week": 8, "quarter": 2, "down": 1, "yardsToGo": 10, "possessionTeam": "CHI", "defensiveTeam": "SF", "playDescription": "(3:35) A.Bars reported in as eligible.  J.Fields sacked at SF 41 for -11 yards (N.Bosa). Penalty on CHI-A.Bars, Offensive Holding, declined.", "passResult": "S", "playResult": -11, "prePenaltyPlayResult": -11, "offenseFormation": "SINGLEBACK", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Ataque (21-40)", "yds_to_endzone": 30, "time_to_throw_s": null, "presion": 1, "sep_target_arrival_yd": 13.619, "sep_esperada_yd": 3.878, "SOE": 9.7411, "hip_flip_deg": 161.94, "checkdown_trap": 1, "max_speed_off": 8.39, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 46781, "cov_def_nflId": 48117, "snap_frame": 8, "arrival_frame": 53, "arrival_source": "penultimate_frame", "tags": ["trampa_presion"], "primary_tag": "trampa_presion", "target_name": "Ryan Nall", "cov_def_name": "Demetrius Flannigan-Fowles"},
  {"gameId": 2021091205, "playId": 1667, "week": 1, "quarter": 2, "down": 1, "yardsToGo": 10, "possessionTeam": "JAX", "defensiveTeam": "HOU", "playDescription": "(5:43) (Shotgun) T.Lawrence pass incomplete deep left to L.Shenault. HOU-V.Hargreaves was injured during the play. His return is Probable.  Penalty on JAX, Illegal Formation, declined. PENALTY on JAX-J.Taylor, Offensive Holding, 10 yards, enforced at HOU 47 - No Play.", "passResult": "I", "playResult": -10, "prePenaltyPlayResult": 0, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-2", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Medio Campo (41-60)", "yds_to_endzone": 47, "time_to_throw_s": 3.9, "presion": 1, "sep_target_arrival_yd": 13.2884, "sep_esperada_yd": 5.1417, "SOE": 8.1467, "hip_flip_deg": 133.34, "checkdown_trap": 1, "max_speed_off": 9.24, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 42516, "cov_def_nflId": 43300, "snap_frame": 6, "arrival_frame": 49, "arrival_source": "penultimate_frame", "tags": ["trampa_presion"], "primary_tag": "trampa_presion", "target_name": "James O'Shaughnessy", "cov_def_name": "Vernon Hargreaves"},
  {"gameId": 2021110100, "playId": 1351, "week": 8, "quarter": 2, "down": 1, "yardsToGo": 10, "possessionTeam": "KC", "defensiveTeam": "NYG", "playDescription": "(12:23) (Shotgun) P.Mahomes pass short left to Da.Williams to KC 39 for 7 yards (D.Holmes, A.Jackson) [A.Johnson].", "passResult": "C", "playResult": 7, "prePenaltyPlayResult": 7, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Quarters", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 68, "time_to_throw_s": 3.8, "presion": 1, "sep_target_arrival_yd": 13.2423, "sep_esperada_yd": 3.8753, "SOE": 9.367, "hip_flip_deg": 179.47, "checkdown_trap": 1, "max_speed_off": 8.63, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 46526, "cov_def_nflId": 52518, "snap_frame": 6, "arrival_frame": 48, "arrival_source": "penultimate_frame", "tags": ["trampa_presion"], "primary_tag": "trampa_presion", "target_name": "Darrel Williams", "cov_def_name": "Darnay Holmes"},
  {"gameId": 2021101009, "playId": 1436, "week": 5, "quarter": 2, "down": 3, "yardsToGo": 10, "possessionTeam": "LAC", "defensiveTeam": "CLE", "playDescription": "(7:35) (Shotgun) J.Herbert sacked at LAC 7 for -10 yards (M.McDowell). CLE-M.McDowell was injured during the play. His return is Probable. ", "passResult": "S", "playResult": -10, "prePenaltyPlayResult": -10, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 83, "time_to_throw_s": null, "presion": 1, "sep_target_arrival_yd": 13.0354, "sep_esperada_yd": 4.2128, "SOE": 8.8226, "hip_flip_deg": 163.53, "checkdown_trap": 1, "max_speed_off": 9.49, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 45573, "cov_def_nflId": 46162, "snap_frame": 6, "arrival_frame": 59, "arrival_source": "penultimate_frame", "tags": ["trampa_presion"], "primary_tag": "trampa_presion", "target_name": "Austin Ekeler", "cov_def_name": "Ronnie Harrison"},
  {"gameId": 2021103101, "playId": 1530, "week": 8, "quarter": 2, "down": 3, "yardsToGo": 6, "possessionTeam": "MIA", "defensiveTeam": "BUF", "playDescription": "(2:43) (Shotgun) T.Tagovailoa pass short left to P.Laird to BUF 43 for 11 yards (T.White). PENALTY on MIA, Illegal Shift, 5 yards, enforced at MIA 46 - No Play.", "passResult": "C", "playResult": -5, "prePenaltyPlayResult": 11, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-6", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Medio Campo (41-60)", "yds_to_endzone": 54, "time_to_throw_s": 3.6, "presion": 1, "sep_target_arrival_yd": 12.9401, "sep_esperada_yd": 3.9504, "SOE": 8.9898, "hip_flip_deg": 155.35, "checkdown_trap": 1, "max_speed_off": 8.3, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 48472, "cov_def_nflId": 44839, "snap_frame": 6, "arrival_frame": 46, "arrival_source": "penultimate_frame", "tags": ["trampa_presion"], "primary_tag": "trampa_presion", "target_name": "Patrick Laird", "cov_def_name": "Tre'Davious White"},
  {"gameId": 2021103101, "playId": 4401, "week": 8, "quarter": 4, "down": 3, "yardsToGo": 26, "possessionTeam": "MIA", "defensiveTeam": "BUF", "playDescription": "(2:32) (No Huddle, Shotgun) T.Tagovailoa pass deep middle intended for J.Waddle INTERCEPTED by J.Poyer at MIA 37. J.Poyer pushed ob at MIA 11 for 26 yards (D.Parker).", "passResult": "IN", "playResult": 0, "prePenaltyPlayResult": 0, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Quarters", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 81, "time_to_throw_s": 2.9, "presion": 1, "sep_target_arrival_yd": 12.9117, "sep_esperada_yd": 3.8753, "SOE": 9.0364, "hip_flip_deg": 139.64, "checkdown_trap": 1, "max_speed_off": 7.99, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 48472, "cov_def_nflId": 44976, "snap_frame": 1, "arrival_frame": 34, "arrival_source": "penultimate_frame", "tags": ["trampa_presion"], "primary_tag": "trampa_presion", "target_name": "Patrick Laird", "cov_def_name": "Matt Milano"},
  {"gameId": 2021101002, "playId": 2168, "week": 5, "quarter": 3, "down": 2, "yardsToGo": 11, "possessionTeam": "GB", "defensiveTeam": "CIN", "playDescription": "(7:14) (Shotgun) Aa.Rodgers pass short left to A.Jones to CIN 28 for 2 yards (M.Hilton; J.Tupou).", "passResult": "C", "playResult": 2, "prePenaltyPlayResult": 2, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-6", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Ataque (21-40)", "yds_to_endzone": 30, "time_to_throw_s": 3.0, "presion": 1, "sep_target_arrival_yd": 12.637, "sep_esperada_yd": 4.1479, "SOE": 8.4891, "hip_flip_deg": 143.42, "checkdown_trap": 1, "max_speed_off": 8.91, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 44995, "cov_def_nflId": 43641, "snap_frame": 6, "arrival_frame": 40, "arrival_source": "penultimate_frame", "tags": ["trampa_presion"], "primary_tag": "trampa_presion", "target_name": "Aaron Jones", "cov_def_name": "Mike Hilton"},
  {"gameId": 2021100300, "playId": 3708, "week": 4, "quarter": 4, "down": 1, "yardsToGo": 10, "possessionTeam": "WAS", "defensiveTeam": "ATL", "playDescription": "(7:16) C.Lucas reported in as eligible.  T.Heinicke scrambles right tackle to ATL 40 for 5 yards (D.Jones). PENALTY on WAS-T.McLaurin, Illegal Formation, 5 yards, enforced at ATL 45 - No Play.", "passResult": "R", "playResult": -5, "prePenaltyPlayResult": 5, "offenseFormation": "SINGLEBACK", "pff_passCoverage": "Cover-2", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Medio Campo (41-60)", "yds_to_endzone": 45, "time_to_throw_s": null, "presion": 1, "sep_target_arrival_yd": 12.6306, "sep_esperada_yd": 5.1417, "SOE": 7.4889, "hip_flip_deg": 173.06, "checkdown_trap": 1, "max_speed_off": 8.51, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 53960, "cov_def_nflId": 40095, "snap_frame": 6, "arrival_frame": 52, "arrival_source": "penultimate_frame", "tags": ["trampa_presion"], "primary_tag": "trampa_presion", "target_name": "Jaret Patterson", "cov_def_name": "Steven Means"},
  {"gameId": 2021091201, "playId": 589, "week": 1, "quarter": 1, "down": 3, "yardsToGo": 14, "possessionTeam": "BUF", "defensiveTeam": "PIT", "playDescription": "(5:21) (Shotgun) J.Allen pass incomplete deep left to C.Beasley. Penalty on BUF-J.Feliciano, Offensive Holding, declined.", "passResult": "I", "playResult": 0, "prePenaltyPlayResult": 0, "offenseFormation": "EMPTY", "pff_passCoverage": "Cover-2", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Medio Campo (41-60)", "yds_to_endzone": 55, "time_to_throw_s": 4.8, "presion": 1, "sep_target_arrival_yd": 12.5893, "sep_esperada_yd": 5.1417, "SOE": 7.4476, "hip_flip_deg": 179.46, "checkdown_trap": 1, "max_speed_off": 8.7, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 47857, "cov_def_nflId": 47793, "snap_frame": 6, "arrival_frame": 58, "arrival_source": "penultimate_frame", "tags": ["trampa_presion"], "primary_tag": "trampa_presion", "target_name": "Devin Singletary", "cov_def_name": "Devin Bush"},
  {"gameId": 2021103109, "playId": 3473, "week": 8, "quarter": 4, "down": 1, "yardsToGo": 10, "possessionTeam": "JAX", "defensiveTeam": "SEA", "playDescription": "(5:33) (Shotgun) T.Lawrence pass incomplete deep left to J.Agnew (S.Jones).", "passResult": "I", "playResult": 0, "prePenaltyPlayResult": 0, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-2", "pff_passCoverageType": "Zone", "pff_playAction": 1, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 69, "time_to_throw_s": 5.3, "presion": 1, "sep_target_arrival_yd": 12.4839, "sep_esperada_yd": 5.2251, "SOE": 7.2588, "hip_flip_deg": 130.73, "checkdown_trap": 1, "max_speed_off": 8.33, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 41286, "cov_def_nflId": 52435, "snap_frame": 6, "arrival_frame": 63, "arrival_source": "penultimate_frame", "tags": ["trampa_presion"], "primary_tag": "trampa_presion", "target_name": "Carlos Hyde", "cov_def_name": "Jordyn Brooks"},
  {"gameId": 2021103112, "playId": 4409, "week": 8, "quarter": 4, "down": 3, "yardsToGo": 9, "possessionTeam": "MIN", "defensiveTeam": "DAL", "playDescription": "(:20) (Shotgun) K.Cousins pass short right to T.Conklin to MIN 42 for 3 yards (A.Brown) [M.Parsons].", "passResult": "C", "playResult": 3, "prePenaltyPlayResult": 3, "offenseFormation": "EMPTY", "pff_passCoverage": "Cover-2", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 61, "time_to_throw_s": 3.5, "presion": 1, "sep_target_arrival_yd": 12.4199, "sep_esperada_yd": 5.2251, "SOE": 7.1948, "hip_flip_deg": 179.81, "checkdown_trap": 1, "max_speed_off": 9.33, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 46226, "cov_def_nflId": 43478, "snap_frame": 6, "arrival_frame": 45, "arrival_source": "penultimate_frame", "tags": ["trampa_presion"], "primary_tag": "trampa_presion", "target_name": "Tyler Conklin", "cov_def_name": "Anthony Brown"},
  {"gameId": 2021102404, "playId": 3366, "week": 7, "quarter": 4, "down": 3, "yardsToGo": 20, "possessionTeam": "CAR", "defensiveTeam": "NYG", "playDescription": "(12:08) (Shotgun) P.Walker sacked at CAR 9 for -6 yards (D.Lawrence).", "passResult": "S", "playResult": -6, "prePenaltyPlayResult": -6, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 85, "time_to_throw_s": null, "presion": 1, "sep_target_arrival_yd": 12.353, "sep_esperada_yd": 4.2128, "SOE": 8.1402, "hip_flip_deg": 81.99, "checkdown_trap": 1, "max_speed_off": 8.33, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 46140, "cov_def_nflId": 40031, "snap_frame": 6, "arrival_frame": 61, "arrival_source": "penultimate_frame", "tags": ["trampa_presion"], "primary_tag": "trampa_presion", "target_name": "Royce Freeman", "cov_def_name": "Logan Ryan"},
  {"gameId": 2021102400, "playId": 4015, "week": 7, "quarter": 4, "down": 4, "yardsToGo": 10, "possessionTeam": "BAL", "defensiveTeam": "CIN", "playDescription": "(2:18) (Shotgun) T.Huntley pass incomplete short middle to J.Oliver [B.Hill].", "passResult": "I", "playResult": 0, "prePenaltyPlayResult": 0, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-3", "pff_passCoverageType": "Zone", "pff_playAction": 0, "zona_campo": "Medio Campo (41-60)", "yds_to_endzone": 44, "time_to_throw_s": 3.3, "presion": 1, "sep_target_arrival_yd": 12.3181, "sep_esperada_yd": 4.3849, "SOE": 7.9332, "hip_flip_deg": 111.96, "checkdown_trap": 1, "max_speed_off": 8.54, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 53180, "cov_def_nflId": 52623, "snap_frame": 7, "arrival_frame": 44, "arrival_source": "penultimate_frame", "tags": ["trampa_presion"], "primary_tag": "trampa_presion", "target_name": "Ty'Son Williams", "cov_def_name": "Markus Bailey"},
  {"gameId": 2021100307, "playId": 4480, "week": 4, "quarter": 5, "down": 1, "yardsToGo": 10, "possessionTeam": "NYJ", "defensiveTeam": "TEN", "playDescription": "(9:04) Z.Wilson pass incomplete short left to T.Wesco.", "passResult": "I", "playResult": 0, "prePenaltyPlayResult": 0, "offenseFormation": "I_FORM", "pff_passCoverage": "Cover-1", "pff_passCoverageType": "Man", "pff_playAction": 1, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 64, "time_to_throw_s": 4.8, "presion": 1, "sep_target_arrival_yd": 12.2742, "sep_esperada_yd": 2.5703, "SOE": 9.7039, "hip_flip_deg": 175.31, "checkdown_trap": 1, "max_speed_off": 9.81, "cluster_id": 0, "cluster_label": "Bolsa Colapsada (Bajo Presión)", "target_nflId": 47904, "cov_def_nflId": 46091, "snap_frame": 6, "arrival_frame": 58, "arrival_source": "penultimate_frame", "tags": ["trampa_presion"], "primary_tag": "trampa_presion", "target_name": "Trevon Wesco", "cov_def_name": "Rashaan Evans"}
]

export const mockTracking: PlayTrackingResponse = {"gameId": 2021091907, "playId": 1438, "field": {"length": 120, "width": 53.3, "attack": "right"}, "play": {"gameId": 2021091907, "playId": 1438, "week": 2, "quarter": 2, "down": 1, "yardsToGo": 10, "possessionTeam": "PHI", "defensiveTeam": "SF", "playDescription": "(7:12) (Shotgun) J.Hurts pass deep right to Q.Watkins to SF 6 for 91 yards (D.Lenoir; J.Tartt).", "passResult": "C", "playResult": 91, "prePenaltyPlayResult": 91, "offenseFormation": "SHOTGUN", "pff_passCoverage": "Cover-1", "pff_passCoverageType": "Man", "pff_playAction": 0, "zona_campo": "Campo Propio (61+)", "yds_to_endzone": 97, "time_to_throw_s": 2.6, "presion": 1, "sep_target_arrival_yd": 1.6513, "sep_esperada_yd": 2.5703, "SOE": -0.919, "hip_flip_deg": 93.72, "checkdown_trap": 0, "max_speed_off": 9.24, "cluster_id": 1, "cluster_label": "Bolsa Limpia / Jugadas Explosivas", "target_nflId": 47836, "cov_def_nflId": 46139, "snap_frame": 7, "arrival_frame": 37, "arrival_source": "penultimate_frame", "tags": ["explosiva"], "primary_tag": "explosiva", "target_name": "Miles Sanders", "cov_def_name": "Fred Warner"}, "frames": [{"frameId": 7, "event": "ball_snap", "entities": [{"nflId": 37266, "displayName": "Jason Kelce", "jerseyNumber": 62, "team": "PHI", "pff_role": "pass block", "x": 12.21, "y": 23.39, "o": 99.5, "dir": 310.5, "s": 0.2}, {"nflId": 38673, "displayName": "Josh Norman", "jerseyNumber": 26, "team": "SF", "pff_role": "coverage", "x": 18.91, "y": 43.15, "o": 209.5, "dir": 101.8, "s": 0.74}, {"nflId": 39950, "displayName": "Lane Johnson", "jerseyNumber": 65, "team": "PHI", "pff_role": "pass block", "x": 11.44, "y": 20.27, "o": 100.6, "dir": 238.7, "s": 0.8}, {"nflId": 39983, "displayName": "Zach Ertz", "jerseyNumber": 86, "team": "PHI", "pff_role": "pass route", "x": 11.9, "y": 30.0, "o": 96.9, "dir": 36.9, "s": 0.62}, {"nflId": 41256, "displayName": "Jimmie Ward", "jerseyNumber": 1, "team": "SF", "pff_role": "coverage", "x": 13.98, "y": 30.24, "o": 264.7, "dir": 358.1, "s": 0.02}, {"nflId": 42030, "displayName": "K'Waun Williams", "jerseyNumber": 24, "team": "SF", "pff_role": "coverage", "x": 18.85, "y": 33.09, "o": 198.0, "dir": 311.8, "s": 0.03}, {"nflId": 42360, "displayName": "Arik Armstead", "jerseyNumber": 91, "team": "SF", "pff_role": "pass rush", "x": 14.01, "y": 20.81, "o": 310.1, "dir": 260.8, "s": 0.11}, {"nflId": 42389, "displayName": "Jaquiski Tartt", "jerseyNumber": 3, "team": "SF", "pff_role": "coverage", "x": 27.63, "y": 24.82, "o": 283.3, "dir": 257.2, "s": 0.02}, {"nflId": 43368, "displayName": "Isaac Seumalo", "jerseyNumber": 56, "team": "PHI", "pff_role": "pass block", "x": 11.54, "y": 25.25, "o": 91.5, "dir": 306.0, "s": 0.0}, {"nflId": 46139, "displayName": "Fred Warner", "jerseyNumber": 54, "team": "SF", "pff_role": "coverage", "x": 16.83, "y": 20.97, "o": 296.2, "dir": 271.0, "s": 0.01}, {"nflId": 46197, "displayName": "Kentavius Street", "jerseyNumber": 95, "team": "SF", "pff_role": "pass rush", "x": 13.68, "y": 23.35, "o": 300.1, "dir": 264.1, "s": 0.82}, {"nflId": 46302, "displayName": "Jordan Mailata", "jerseyNumber": 68, "team": "PHI", "pff_role": "pass block", "x": 10.98, "y": 26.49, "o": 60.9, "dir": 297.1, "s": 0.95}, {"nflId": 47785, "displayName": "Nick Bosa", "jerseyNumber": 97, "team": "SF", "pff_role": "pass rush", "x": 13.39, "y": 28.67, "o": 209.1, "dir": 255.8, "s": 0.78}, {"nflId": 47836, "displayName": "Miles Sanders", "jerseyNumber": 26, "team": "PHI", "pff_role": "pass route", "x": 7.71, "y": 20.98, "o": 48.8, "dir": 104.9, "s": 0.0}, {"nflId": 48268, "displayName": "Azeez Al-Shaair", "jerseyNumber": 51, "team": "SF", "pff_role": "pass rush", "x": 13.93, "y": 17.66, "o": 333.6, "dir": 322.1, "s": 0.3}, {"nflId": 52422, "displayName": "Javon Kinlaw", "jerseyNumber": 99, "team": "SF", "pff_role": "pass rush", "x": 13.67, "y": 26.05, "o": 273.0, "dir": 311.2, "s": 0.53}, {"nflId": 52429, "displayName": "Jalen Reagor", "jerseyNumber": 18, "team": "PHI", "pff_role": "pass route", "x": 11.31, "y": 43.59, "o": 100.6, "dir": 165.7, "s": 0.0}, {"nflId": 52461, "displayName": "Jalen Hurts", "jerseyNumber": 1, "team": "PHI", "pff_role": "pass", "x": 7.86, "y": 23.14, "o": 73.0, "dir": 277.3, "s": 0.06}, {"nflId": 52608, "displayName": "Quez Watkins", "jerseyNumber": 16, "team": "PHI", "pff_role": "pass route", "x": 12.09, "y": 10.14, "o": 127.6, "dir": 110.0, "s": 0.01}, {"nflId": 53439, "displayName": "DeVonta Smith", "jerseyNumber": 6, "team": "PHI", "pff_role": "pass route", "x": 11.27, "y": 32.9, "o": 109.1, "dir": 305.5, "s": 0.0}, {"nflId": 53466, "displayName": "Landon Dickerson", "jerseyNumber": 69, "team": "PHI", "pff_role": "pass block", "x": 11.71, "y": 21.87, "o": 99.7, "dir": 231.4, "s": 0.1}, {"nflId": 53601, "displayName": "Deommodore Lenoir", "jerseyNumber": 38, "team": "SF", "pff_role": "coverage", "x": 19.37, "y": 10.57, "o": 265.7, "dir": 202.7, "s": 0.0}, {"nflId": null, "displayName": "football", "jerseyNumber": null, "team": "football", "pff_role": null, "x": 12.71, "y": 23.35, "o": null, "dir": null, "s": 0.0}]}, {"frameId": 22, "event": null, "entities": [{"nflId": 37266, "displayName": "Jason Kelce", "jerseyNumber": 62, "team": "PHI", "pff_role": "pass block", "x": 9.3, "y": 23.52, "o": 72.9, "dir": 269.8, "s": 2.85}, {"nflId": 38673, "displayName": "Josh Norman", "jerseyNumber": 26, "team": "SF", "pff_role": "coverage", "x": 21.81, "y": 44.38, "o": 251.3, "dir": 33.7, "s": 2.71}, {"nflId": 39950, "displayName": "Lane Johnson", "jerseyNumber": 65, "team": "PHI", "pff_role": "pass block", "x": 8.61, "y": 19.07, "o": 120.6, "dir": 259.3, "s": 2.37}, {"nflId": 39983, "displayName": "Zach Ertz", "jerseyNumber": 86, "team": "PHI", "pff_role": "pass route", "x": 15.7, "y": 31.64, "o": 71.1, "dir": 99.5, "s": 3.7}, {"nflId": 41256, "displayName": "Jimmie Ward", "jerseyNumber": 1, "team": "SF", "pff_role": "coverage", "x": 16.11, "y": 31.85, "o": 242.5, "dir": 87.3, "s": 3.65}, {"nflId": 42030, "displayName": "K'Waun Williams", "jerseyNumber": 24, "team": "SF", "pff_role": "coverage", "x": 19.24, "y": 31.42, "o": 256.0, "dir": 177.5, "s": 3.51}, {"nflId": 42360, "displayName": "Arik Armstead", "jerseyNumber": 91, "team": "SF", "pff_role": "pass rush", "x": 9.7, "y": 20.89, "o": 293.5, "dir": 268.8, "s": 3.59}, {"nflId": 42389, "displayName": "Jaquiski Tartt", "jerseyNumber": 3, "team": "SF", "pff_role": "coverage", "x": 29.37, "y": 25.04, "o": 273.9, "dir": 88.2, "s": 2.65}, {"nflId": 43368, "displayName": "Isaac Seumalo", "jerseyNumber": 56, "team": "PHI", "pff_role": "pass block", "x": 8.75, "y": 25.24, "o": 20.9, "dir": 260.8, "s": 3.03}, {"nflId": 46139, "displayName": "Fred Warner", "jerseyNumber": 54, "team": "SF", "pff_role": "coverage", "x": 14.55, "y": 18.74, "o": 279.9, "dir": 214.9, "s": 4.0}, {"nflId": 46197, "displayName": "Kentavius Street", "jerseyNumber": 95, "team": "SF", "pff_role": "pass rush", "x": 10.06, "y": 23.66, "o": 254.7, "dir": 277.1, "s": 2.8}, {"nflId": 46302, "displayName": "Jordan Mailata", "jerseyNumber": 68, "team": "PHI", "pff_role": "pass block", "x": 7.26, "y": 26.82, "o": 340.8, "dir": 258.6, "s": 3.15}, {"nflId": 47785, "displayName": "Nick Bosa", "jerseyNumber": 97, "team": "SF", "pff_role": "pass rush", "x": 7.5, "y": 27.78, "o": 185.3, "dir": 259.2, "s": 5.07}, {"nflId": 47836, "displayName": "Miles Sanders", "jerseyNumber": 26, "team": "PHI", "pff_role": "pass route", "x": 7.09, "y": 18.94, "o": 114.0, "dir": 181.9, "s": 3.98}, {"nflId": 48268, "displayName": "Azeez Al-Shaair", "jerseyNumber": 51, "team": "SF", "pff_role": "pass rush", "x": 9.65, "y": 18.39, "o": 304.2, "dir": 261.4, "s": 3.85}, {"nflId": 52422, "displayName": "Javon Kinlaw", "jerseyNumber": 99, "team": "SF", "pff_role": "pass rush", "x": 9.32, "y": 25.45, "o": 212.8, "dir": 247.1, "s": 3.38}, {"nflId": 52429, "displayName": "Jalen Reagor", "jerseyNumber": 18, "team": "PHI", "pff_role": "pass route", "x": 14.41, "y": 45.3, "o": 144.5, "dir": 54.2, "s": 3.88}, {"nflId": 52461, "displayName": "Jalen Hurts", "jerseyNumber": 1, "team": "PHI", "pff_role": "pass", "x": 5.42, "y": 23.51, "o": 144.3, "dir": 267.0, "s": 2.37}, {"nflId": 52608, "displayName": "Quez Watkins", "jerseyNumber": 16, "team": "PHI", "pff_role": "pass route", "x": 17.98, "y": 9.67, "o": 105.8, "dir": 95.8, "s": 7.44}, {"nflId": 53439, "displayName": "DeVonta Smith", "jerseyNumber": 6, "team": "PHI", "pff_role": "pass route", "x": 14.04, "y": 31.6, "o": 177.0, "dir": 132.3, "s": 4.08}, {"nflId": 53466, "displayName": "Landon Dickerson", "jerseyNumber": 69, "team": "PHI", "pff_role": "pass block", "x": 9.09, "y": 21.48, "o": 127.7, "dir": 275.6, "s": 2.92}, {"nflId": 53601, "displayName": "Deommodore Lenoir", "jerseyNumber": 38, "team": "SF", "pff_role": "coverage", "x": 21.79, "y": 10.36, "o": 233.9, "dir": 98.8, "s": 4.22}, {"nflId": null, "displayName": "football", "jerseyNumber": null, "team": "football", "pff_role": null, "x": 5.38, "y": 23.51, "o": null, "dir": null, "s": 1.78}]}, {"frameId": 37, "event": null, "entities": [{"nflId": 37266, "displayName": "Jason Kelce", "jerseyNumber": 62, "team": "PHI", "pff_role": "pass block", "x": 6.27, "y": 22.83, "o": 99.4, "dir": 217.5, "s": 0.83}, {"nflId": 38673, "displayName": "Josh Norman", "jerseyNumber": 26, "team": "SF", "pff_role": "coverage", "x": 22.78, "y": 46.35, "o": 204.6, "dir": 35.5, "s": 0.3}, {"nflId": 39950, "displayName": "Lane Johnson", "jerseyNumber": 65, "team": "PHI", "pff_role": "pass block", "x": 6.55, "y": 18.77, "o": 102.5, "dir": 57.8, "s": 0.65}, {"nflId": 39983, "displayName": "Zach Ertz", "jerseyNumber": 86, "team": "PHI", "pff_role": "pass route", "x": 21.24, "y": 28.06, "o": 169.8, "dir": 151.1, "s": 5.47}, {"nflId": 41256, "displayName": "Jimmie Ward", "jerseyNumber": 1, "team": "SF", "pff_role": "coverage", "x": 22.41, "y": 29.24, "o": 124.8, "dir": 128.7, "s": 5.29}, {"nflId": 42030, "displayName": "K'Waun Williams", "jerseyNumber": 24, "team": "SF", "pff_role": "coverage", "x": 17.59, "y": 30.35, "o": 339.1, "dir": 344.6, "s": 4.74}, {"nflId": 42360, "displayName": "Arik Armstead", "jerseyNumber": 91, "team": "SF", "pff_role": "pass rush", "x": 4.74, "y": 22.29, "o": 331.1, "dir": 305.0, "s": 2.85}, {"nflId": 42389, "displayName": "Jaquiski Tartt", "jerseyNumber": 3, "team": "SF", "pff_role": "coverage", "x": 34.91, "y": 22.61, "o": 145.1, "dir": 126.3, "s": 6.24}, {"nflId": 43368, "displayName": "Isaac Seumalo", "jerseyNumber": 56, "team": "PHI", "pff_role": "pass block", "x": 5.61, "y": 23.28, "o": 356.1, "dir": 248.8, "s": 1.12}, {"nflId": 46139, "displayName": "Fred Warner", "jerseyNumber": 54, "team": "SF", "pff_role": "coverage", "x": 14.22, "y": 14.33, "o": 236.4, "dir": 153.1, "s": 3.41}, {"nflId": 46197, "displayName": "Kentavius Street", "jerseyNumber": 95, "team": "SF", "pff_role": "pass rush", "x": 7.21, "y": 23.22, "o": 200.1, "dir": 185.2, "s": 0.94}, {"nflId": 46302, "displayName": "Jordan Mailata", "jerseyNumber": 68, "team": "PHI", "pff_role": "pass block", "x": 4.3, "y": 24.71, "o": 93.2, "dir": 148.9, "s": 0.97}, {"nflId": 47785, "displayName": "Nick Bosa", "jerseyNumber": 97, "team": "SF", "pff_role": "pass rush", "x": 4.42, "y": 25.77, "o": 156.6, "dir": 111.2, "s": 2.05}, {"nflId": 47836, "displayName": "Miles Sanders", "jerseyNumber": 26, "team": "PHI", "pff_role": "pass route", "x": 12.64, "y": 13.85, "o": 122.3, "dir": 127.1, "s": 5.89}, {"nflId": 48268, "displayName": "Azeez Al-Shaair", "jerseyNumber": 51, "team": "SF", "pff_role": "pass rush", "x": 7.58, "y": 18.25, "o": 31.2, "dir": 63.3, "s": 2.1}, {"nflId": 52422, "displayName": "Javon Kinlaw", "jerseyNumber": 99, "team": "SF", "pff_role": "pass rush", "x": 6.02, "y": 24.13, "o": 179.5, "dir": 251.8, "s": 0.57}, {"nflId": 52429, "displayName": "Jalen Reagor", "jerseyNumber": 18, "team": "PHI", "pff_role": "pass route", "x": 17.63, "y": 47.9, "o": 184.7, "dir": 48.6, "s": 1.54}, {"nflId": 52461, "displayName": "Jalen Hurts", "jerseyNumber": 1, "team": "PHI", "pff_role": "pass", "x": 5.04, "y": 23.27, "o": 171.7, "dir": 3.8, "s": 1.11}, {"nflId": 52608, "displayName": "Quez Watkins", "jerseyNumber": 16, "team": "PHI", "pff_role": "pass route", "x": 30.31, "y": 6.46, "o": 94.9, "dir": 106.0, "s": 9.11}, {"nflId": 53439, "displayName": "DeVonta Smith", "jerseyNumber": 6, "team": "PHI", "pff_role": "pass route", "x": 16.39, "y": 32.35, "o": 249.4, "dir": 8.4, "s": 4.13}, {"nflId": 53466, "displayName": "Landon Dickerson", "jerseyNumber": 69, "team": "PHI", "pff_role": "pass block", "x": 4.64, "y": 23.17, "o": 165.0, "dir": 315.2, "s": 2.92}, {"nflId": 53601, "displayName": "Deommodore Lenoir", "jerseyNumber": 38, "team": "SF", "pff_role": "coverage", "x": 30.37, "y": 7.69, "o": 121.0, "dir": 106.9, "s": 7.6}, {"nflId": null, "displayName": "football", "jerseyNumber": null, "team": "football", "pff_role": null, "x": 12.93, "y": 19.08, "o": null, "dir": null, "s": 19.53}]}]}

export const mockChat: ChatResponse = {
  "reply": "Para el coach: [respuesta de ejemplo] La Trampa de Presión aparece en 960 jugadas (29.85% de las jugadas con presión).",
  "recommended_play": {
    "gameId": 2021091907,
    "playId": 1438,
    "reason": "Jugada de ejemplo"
  },
  "source": "local"
}
