from collector.client import BRVMClient
from collector.parsers.market_summary_parser import MarketSummaryParser


client = BRVMClient()

html = client.session.get(
    "https://www.brvm.org/fr/indices"
).text

parser = MarketSummaryParser()

top5 = parser.parse_ranking(html, 0, "TOP5")
flop5 = parser.parse_ranking(html, 1, "FLOP5")

print("=" * 60)
print(f"Top 5 : {len(top5)}")
print(f"Flop 5 : {len(flop5)}")
print("=" * 60)

print()

print("=== PREMIER TOP ===")
print(top5[0])

print()

print("=== PREMIER FLOP ===")
print(flop5[0])