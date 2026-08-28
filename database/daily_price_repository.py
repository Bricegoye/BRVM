from datetime import date
from decimal import Decimal

from psycopg import Connection

from models.daily_price import DailyPrice
from database.company_repository import CompanyRepository


class DailyPriceRepository:

    def __init__(self, conn: Connection):
        self.conn = conn
        self.company_repository = CompanyRepository(conn)

    @staticmethod
    def _decimal(value) -> Decimal | None:
        if value is None:
            return None

        return Decimal(str(value))

    def get_latest_session_date(self) -> date | None:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                SELECT MAX(trade_date)
                FROM daily_prices;
                """
            )

            row = cur.fetchone()

        if row is None:
            return None

        return row[0]

    def get_session_company_count(
        self,
        session_date: date,
    ) -> int:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(DISTINCT company_id)
                FROM daily_prices
                WHERE trade_date = %s;
                """,
                (session_date,),
            )

            row = cur.fetchone()

        return int(row[0]) if row else 0

    def get_session_snapshot(
        self,
        session_date: date,
    ) -> dict[str, tuple]:
        with self.conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    c.symbol,
                    dp.open_price,
                    dp.close_price,
                    dp.previous_close,
                    dp.variation_percent,
                    dp.volume
                FROM daily_prices dp
                INNER JOIN companies c
                    ON c.company_id = dp.company_id
                WHERE dp.trade_date = %s
                ORDER BY c.symbol;
                """,
                (session_date,),
            )

            rows = cur.fetchall()

        return {
            row[0]: (
                self._decimal(row[1]),
                self._decimal(row[2]),
                self._decimal(row[3]),
                self._decimal(row[4]),
                int(row[5]) if row[5] is not None else None,
            )
            for row in rows
        }

    def is_identical_to_latest(
        self,
        prices: list[DailyPrice],
    ) -> tuple[bool, date | None]:
        latest_session_date = self.get_latest_session_date()

        if latest_session_date is None:
            return False, None

        previous_snapshot = self.get_session_snapshot(
            latest_session_date
        )

        current_snapshot = {
            price.symbol: (
                self._decimal(price.open_price),
                self._decimal(price.close_price),
                self._decimal(price.previous_close),
                self._decimal(price.variation_percent),
                int(price.volume)
                if price.volume is not None
                else None,
            )
            for price in prices
        }

        if not current_snapshot:
            return False, latest_session_date

        if current_snapshot.keys() != previous_snapshot.keys():
            return False, latest_session_date

        return (
            current_snapshot == previous_snapshot,
            latest_session_date,
        )

    def save(self, prices: list[DailyPrice]):

        with self.conn.cursor() as cur:

            for price in prices:

                company_id = self.company_repository.get_company_id(
                    price.symbol
                )

                if company_id is None:
                    continue

                variation = (
                    price.close_price - price.previous_close
                )

                cur.execute(
                    """
                    INSERT INTO daily_prices (
                        company_id,
                        trade_date,
                        open_price,
                        close_price,
                        previous_close,
                        variation,
                        variation_percent,
                        volume
                    )
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (
                        company_id,
                        trade_date
                    )
                    DO NOTHING;
                    """,
                    (
                        company_id,
                        price.session_date,
                        price.open_price,
                        price.close_price,
                        price.previous_close,
                        variation,
                        price.variation_percent,
                        price.volume,
                    ),
                )

        self.conn.commit()