from collector.client import BRVMClient
from collector.parsers.market_summary_parser import MarketSummaryParser

client = BRVMClient()

html = client.session.get(
    "https://www.brvm.org/fr/indices"
).text

parser = MarketSummaryParser()

activities = parser.parse_market_activity(html)

print(f"Nombre d'activités : {len(activities)}")
print()

for activity in activities:
    print(activity)