from bs4 import BeautifulSoup

from models.market_activity import MarketActivity
from models.market_index import MarketIndex
from models.market_ranking import MarketRanking
from utils.date_parser import extract_brvm_session_date


class MarketSummaryParser:
    """
    Parser des données de synthèse BRVM.
    """

    @staticmethod
    def _to_float(value: str) -> float:
        value = (
            value.replace("FCFA", "")
            .replace("%", "")
            .replace(" ", "")
            .replace(",", ".")
        )
        return float(value)

    def parse_indices(self, html: str, table_index: int, category: str):

        soup = BeautifulSoup(html, "lxml")

        table = soup.find_all("table")[table_index]

        rows = table.find_all("tr")[1:]

        indices = []

        session_date = extract_brvm_session_date(html)

        for row in rows:

            cols = [td.get_text(strip=True) for td in row.find_all("td")]

            if len(cols) != 5:
                continue

            indices.append(
                MarketIndex(
                    session_date=session_date,
                    name=cols[0],
                    previous_close=self._to_float(cols[1]),
                    close_price=self._to_float(cols[2]),
                    variation_percent=self._to_float(cols[3]),
                    year_variation_percent=self._to_float(cols[4]),
                    category=category,
                )
            )

        return indices

    def parse_market_activity(self, html: str):

        soup = BeautifulSoup(html, "lxml")

        table = soup.find_all("table")[2]

        rows = table.find_all("tr")[1:4]

        activities = []

        session_date = extract_brvm_session_date(html)

        for row in rows:

            cols = [
                td.get_text(" ", strip=True)
                for td in row.find_all("td")
            ]

            if len(cols) < 2:
                continue

            activities.append(
                MarketActivity(
                    session_date=session_date,
                    label=cols[0],
                    value=self._to_float(cols[1]),
                )
            )

        return activities

    def parse_ranking(self, html: str, table_index: int, ranking_type: str):

        soup = BeautifulSoup(html, "lxml")

        table = soup.find_all("table")[table_index]

        rows = table.find_all("tr")[1:]

        rankings = []

        session_date = extract_brvm_session_date(html)

        for row in rows:

            cols = [td.get_text(strip=True) for td in row.find_all("td")]

            if len(cols) != 3:
                continue

            rankings.append(
                MarketRanking(
                    session_date=session_date,
                    ranking_type=ranking_type,
                    symbol=cols[0],
                    close_price=self._to_float(cols[1]),
                    variation_percent=self._to_float(cols[2]),
                )
            )

        return rankings