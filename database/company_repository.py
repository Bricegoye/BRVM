from psycopg import Connection

from models.company import Company


class CompanyRepository:

    def __init__(self, conn: Connection):
        self.conn = conn

    def save(self, companies: list[Company]):

        with self.conn.cursor() as cur:

            for company in companies:

                cur.execute(
                    """
                    INSERT INTO companies (
                        symbol,
                        company_name,
                        sector_id,
                        is_active
                    )
                    VALUES (%s,%s,%s,%s)
                    ON CONFLICT(symbol)
                    DO NOTHING
                    """,
                    (
                        company.symbol,
                        company.name,
                        1,
                        True,
                    ),
                )

        self.conn.commit()

    def get_company_id(self, symbol: str):

        with self.conn.cursor() as cur:

            cur.execute(
                """
                SELECT company_id
                FROM companies
                WHERE symbol=%s
                """,
                (symbol,),
            )

            row = cur.fetchone()

            if row:
                return row[0]

            return None