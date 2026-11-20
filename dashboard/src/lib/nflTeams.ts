/** Alineación oficial de la temporada 2021 (dato público). Las abreviaturas siguen el dataset (LA = Rams). */
import type { Conference } from '../types/nfl'

export interface TeamInfo {
  abbr: string
  name: string
  conference: Conference
  division: string
}

const T = (abbr: string, name: string, conference: Conference, division: string): TeamInfo => ({
  abbr,
  name,
  conference,
  division: `${conference} ${division}`,
})

export const NFL_TEAMS: Record<string, TeamInfo> = Object.fromEntries(
  [
    T('BUF', 'Buffalo Bills', 'AFC', 'Este'),
    T('MIA', 'Miami Dolphins', 'AFC', 'Este'),
    T('NE', 'New England Patriots', 'AFC', 'Este'),
    T('NYJ', 'New York Jets', 'AFC', 'Este'),
    T('BAL', 'Baltimore Ravens', 'AFC', 'Norte'),
    T('CIN', 'Cincinnati Bengals', 'AFC', 'Norte'),
    T('CLE', 'Cleveland Browns', 'AFC', 'Norte'),
    T('PIT', 'Pittsburgh Steelers', 'AFC', 'Norte'),
    T('HOU', 'Houston Texans', 'AFC', 'Sur'),
    T('IND', 'Indianapolis Colts', 'AFC', 'Sur'),
    T('JAX', 'Jacksonville Jaguars', 'AFC', 'Sur'),
    T('TEN', 'Tennessee Titans', 'AFC', 'Sur'),
    T('DEN', 'Denver Broncos', 'AFC', 'Oeste'),
    T('KC', 'Kansas City Chiefs', 'AFC', 'Oeste'),
    T('LV', 'Las Vegas Raiders', 'AFC', 'Oeste'),
    T('LAC', 'Los Angeles Chargers', 'AFC', 'Oeste'),
    T('DAL', 'Dallas Cowboys', 'NFC', 'Este'),
    T('NYG', 'New York Giants', 'NFC', 'Este'),
    T('PHI', 'Philadelphia Eagles', 'NFC', 'Este'),
    T('WAS', 'Washington Football Team', 'NFC', 'Este'),
    T('CHI', 'Chicago Bears', 'NFC', 'Norte'),
    T('DET', 'Detroit Lions', 'NFC', 'Norte'),
    T('GB', 'Green Bay Packers', 'NFC', 'Norte'),
    T('MIN', 'Minnesota Vikings', 'NFC', 'Norte'),
    T('ATL', 'Atlanta Falcons', 'NFC', 'Sur'),
    T('CAR', 'Carolina Panthers', 'NFC', 'Sur'),
    T('NO', 'New Orleans Saints', 'NFC', 'Sur'),
    T('TB', 'Tampa Bay Buccaneers', 'NFC', 'Sur'),
    T('ARI', 'Arizona Cardinals', 'NFC', 'Oeste'),
    T('LA', 'Los Angeles Rams', 'NFC', 'Oeste'),
    T('SF', 'San Francisco 49ers', 'NFC', 'Oeste'),
    T('SEA', 'Seattle Seahawks', 'NFC', 'Oeste'),
  ].map((t) => [t.abbr, t]),
)

export const teamInfo = (abbr: string): TeamInfo | null => NFL_TEAMS[abbr] ?? null
