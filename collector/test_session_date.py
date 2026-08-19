from collector.client import BRVMClient
from utils.date_parser import extract_brvm_session_date


client = BRVMClient()

html = client.fetch_market_page()

session_date = extract_brvm_session_date(html)

print("Date de séance BRVM :", session_date)