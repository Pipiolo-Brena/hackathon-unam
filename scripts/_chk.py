import pandas as pd
p = pd.read_csv('data/pffScoutingData.csv', usecols=['gameId', 'playId', 'nflId', 'pff_role'])
print(p.dtypes.to_dict())
print(p.pff_role.value_counts().to_dict())
r = p.set_index(['gameId', 'playId', 'nflId'])['pff_role']
k = tuple(int(v) for v in p.iloc[0][['gameId', 'playId', 'nflId']])
print(k, repr(r.get(k, 'MISSING')), r.index.is_unique)
