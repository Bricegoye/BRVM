from psycopg import Connection

from models.market_ranking import MarketRanking


class MarketRankingRepository:

    def __init__(self, conn: Connection):
        self.conn = conn

    def save(self, rankings: list[MarketRanking]):

        with self.conn.cursor() as cur:

            for ranking in rankings:

                cur.execute(
                    """
                    INSERT INTO market_rankings (
                        session_date,
                        ranking_type,
                        symbol,
                        close_price,
                        variation_percent
                    )
                    VALUES (%s,%s,%s,%s,%s)
                    ON CONFLICT (
                        session_date,
                        ranking_type,
                        symbol
                    )
                    DO NOTHING;
                    """,
                    (
                        ranking.session_date,
                        ranking.ranking_type,
                        ranking.symbol,
                        ranking.close_price,
                        ranking.variation_percent,
                    ),
                )

        self.conn.commit()