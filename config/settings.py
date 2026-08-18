import os
from dotenv import load_dotenv

# Charge les variables du fichier .env
load_dotenv()


class Settings:
    """
    Configuration globale de l'application.
    """

    BRVM_BASE_URL = os.getenv("BRVM_BASE_URL")
    BRVM_MARKET_URL = os.getenv("BRVM_MARKET_URL")

    DATABASE_HOST = os.getenv("DATABASE_HOST")
    DATABASE_PORT = os.getenv("DATABASE_PORT")
    DATABASE_NAME = os.getenv("DATABASE_NAME")
    DATABASE_USER = os.getenv("DATABASE_USER")
    DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")


# Instance unique accessible dans tout le projet
settings = Settings()