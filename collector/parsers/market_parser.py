from datetime import date

from bs4 import BeautifulSoup

from models.company import Company
from models.daily_price import DailyPrice


class MarketParser:
    """
    Parse le tableau des actions BRVM.
    """

    @staticmethod
    def _to_int(value: str) -> int:
        return int(value.replace(" ", ""))

    @staticmethod
    def _to_float(value: str) -> float:
        return float(value.replace(" ", "").replace(",", "."))

    def parse(self, html: str):

        soup = BeautifulSoup(html, "lxml")

        table = soup.find_all("table")[3]

        rows = table.find_all("tr")[1:]

        companies = []

        prices = []

        session_date = date.today()

        for row in rows:

            cols = [td.get_text(strip=True) for td in row.find_all("td")]

            if len(cols) != 7:
                continue

            symbol = cols[0]
            company_name = cols[1]

            company = Company(
                symbol=symbol,
                name=company_name,
            )

            price = DailyPrice(
                session_date=session_date,
                symbol=symbol,
                volume=self._to_int(cols[2]),
                previous_close=self._to_float(cols[3]),
                open_price=self._to_float(cols[4]),
                close_price=self._to_float(cols[5]),
                variation_percent=self._to_float(cols[6]),
            )

            companies.append(company)
            prices.append(price)

        return companies, prices