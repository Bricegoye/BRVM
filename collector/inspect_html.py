from pathlib import Path

from bs4 import BeautifulSoup

html = Path("data/raw/market.html").read_text(encoding="utf-8")

soup = BeautifulSoup(html, "lxml")

table = soup.find_all("table")[3]

rows = table.find_all("tr")

print(f"Nombre de lignes : {len(rows)}")

print("-" * 80)

for row in rows[:10]:

    cols = [c.get_text(strip=True) for c in row.find_all(["td", "th"])]

    print(cols)