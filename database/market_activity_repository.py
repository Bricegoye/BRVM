from psycopg import Connection

from models.market_activity import MarketActivity


class MarketActivityRepository:

    def __init__(self, conn: Connection):
        self.conn = conn

    def save(self, activities: list[MarketActivity]):

        with self.conn.cursor() as cur:

            for activity in activities:

                cur.execute(
                    """
                    INSERT INTO market_activity (
                        session_date,
                        label,
                        value
                    )
                    VALUES (%s,%s,%s)
                    """,
                    (
                        activity.session_date,
                        activity.label,
                        activity.value,
                    ),
                )

        self.conn.commit()