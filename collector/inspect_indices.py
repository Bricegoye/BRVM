from bs4 import BeautifulSoup

from collector.client import BRVMClient


client = BRVMClient()

html = client.session.get(
    "https://www.brvm.org/fr/indices"
).text

soup = BeautifulSoup(html, "lxml")

tables = soup.find_all("table")

table = tables[3]   # Tableau des indices principaux

rows = table.find_all("tr")

print("=" * 80)
print(f"Nombre de lignes : {len(rows)}")
print("=" * 80)

for i, row in enumerate(rows):

    cols = [td.get_text(strip=True) for td in row.find_all(["th", "td"])]

    print(f"Ligne {i}")
    print(cols)
    print("-" * 80)