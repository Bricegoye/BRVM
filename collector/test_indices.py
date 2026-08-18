from collector.client import BRVMClient
from collector.parsers.index_parser import IndexParser

client = BRVMClient()

html = client.session.get(
    "https://www.brvm.org/fr/indices"
).text

parser = IndexParser()

parser.parse(html)