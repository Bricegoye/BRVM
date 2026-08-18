from pathlib import Path

from bs4 import BeautifulSoup

html = Path("data/raw/market.html").read_text(encoding="utf-8")

soup = BeautifulSoup(html, "lxml")

# Tableau des actions
table = soup.find_all("table")[3]

rows = table.find_all("tr")

print("=" * 80)
print(f"Nombre de lignes : {len(rows)}")
print("=" * 80)

for i, row in enumerate(rows[:10]):

    cols = [col.get_text(strip=True) for col in row.find_all(["td", "th"])]

    print(f"Ligne {i}")
    print(cols)
    print("-" * 80)