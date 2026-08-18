from psycopg import Connection

from models.import_run import ImportRun


class ImportRunRepository:

    def __init__(self, conn: Connection):
        self.conn = conn

    def save(self, run: ImportRun):

        with self.conn.cursor() as cur:

            cur.execute(
                """
                INSERT INTO import_runs (
                    run_date,
                    status,
                    source,
                    rows_imported,
                    duration_seconds,
                    message
                )
                VALUES (%s,%s,%s,%s,%s,%s)
                """,
                (
                    run.run_date,
                    run.status,
                    run.source,
                    run.rows_imported,
                    run.duration_seconds,
                    run.message,
                ),
            )

        self.conn.commit()