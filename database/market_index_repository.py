from psycopg import Connection

from models.market_index import MarketIndex


class MarketIndexRepository:

    def __init__(self, conn: Connection):
        self.conn = conn

    def save(self, indices: list[MarketIndex]):

        with self.conn.cursor() as cur:

            for index in indices:

                cur.execute(
                    """
                    INSERT INTO market_indices (
                        session_date,
                        name,
                        previous_close,
                        close_price,
                        variation_percent,
                        year_variation_percent,
                        category
                    )
                    VALUES (%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (
                        session_date,
                        name,
                        category
                    )
                    DO NOTHING;
                    """,
                    (
                        index.session_date,
                        index.name,
                        index.previous_close,
                        index.close_price,
                        index.variation_percent,
                        index.year_variation_percent,
                        index.category,
                    ),
                )

        self.conn.commit()