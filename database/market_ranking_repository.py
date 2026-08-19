from psycopg import Connection

from models.market_ranking import MarketRanking


class MarketRankingRepository:

    def __init__(self, conn: Connection):
        self.conn = conn

    def save(self, rankings: list[MarketRanking]):

        if not rankings:
            return

        # Récupération des dates concernées par l'import
        session_dates = {
            ranking.session_date
            for ranking in rankings
        }

        with self.conn.cursor() as cur:

            # Le ranking représente un snapshot.
            # On remplace donc le classement existant de la séance.
            for session_date in session_dates:

                cur.execute(
                    """
                    DELETE FROM market_rankings
                    WHERE session_date = %s;
                    """,
                    (session_date,),
                )

            # Insertion du classement actuel
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