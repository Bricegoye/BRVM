from psycopg import Connection

from models.daily_price import DailyPrice
from database.company_repository import CompanyRepository


class DailyPriceRepository:

    def __init__(self, conn: Connection):
        self.conn = conn
        self.company_repository = CompanyRepository(conn)

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