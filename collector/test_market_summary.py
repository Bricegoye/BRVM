from collector.client import BRVMClient
from collector.parsers.market_summary_parser import MarketSummaryParser

client = BRVMClient()

html = client.session.get(
    "https://www.brvm.org/fr/indices"
).text

parser = MarketSummaryParser()

main_indices = parser.parse_indices(html, 3, "MAIN")
sector_indices = parser.parse_indices(html, 4, "SECTOR")
total_return = parser.parse_indices(html, 5, "TOTAL_RETURN")

print("=" * 60)
print(f"Indices principaux : {len(main_indices)}")
print(f"Indices sectoriels : {len(sector_indices)}")
print(f"Indices Total Return : {len(total_return)}")
print("=" * 60)

print()

print("=== PREMIER INDICE PRINCIPAL ===")
print(main_indices[0])

print()

print("=== PREMIER INDICE SECTORIEL ===")
print(sector_indices[0])

print()

print("=== PREMIER INDICE TOTAL RETURN ===")
print(total_return[0])