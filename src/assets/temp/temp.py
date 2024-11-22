import pandas as pd

with open('song_infos.json', 'r', encoding='utf-8') as f:
    data = pd.read_json(f)

data.to_csv('song_infos.csv', index=False)
