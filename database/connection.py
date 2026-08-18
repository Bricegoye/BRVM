import os

import psycopg
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    """
    Ouvre une connexion PostgreSQL.
    """
    return psycopg.connect(
        host=os.getenv("DATABASE_HOST"),
        port=os.getenv("DATABASE_PORT"),
        dbname=os.getenv("DATABASE_NAME"),
        user=os.getenv("DATABASE_USER"),
        password=os.getenv("DATABASE_PASSWORD"),
    )


def test_connection():
    try:
        conn = get_connection()

        with conn.cursor() as cur:
            cur.execute("SELECT version();")
            version = cur.fetchone()

        print("✅ Connexion à Supabase réussie !")
        print(version[0])

        conn.close()

    except Exception as e:
        print("❌ Erreur :", e)


if __name__ == "__main__":
    test_connection()