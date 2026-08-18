from pathlib import Path

import requests

from config.settings import settings
from utils.logger import setup_logger


logger = setup_logger()


class BRVMClient:
    """
    Client HTTP pour récupérer les pages de la BRVM.
    """

    def __init__(self):
        self.session = requests.Session()

        self.session.headers.update(
            {
                "User-Agent": (
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 "
                    "(KHTML, like Gecko) "
                    "Chrome/138.0 Safari/537.36"
                )
            }
        )

    def fetch_market_page(self) -> str:

        logger.info("Connexion au site BRVM...")

        response = self.session.get(
            settings.BRVM_MARKET_URL,
            timeout=30,
        )

        response.raise_for_status()

        logger.info("Téléchargement terminé.")

        return response.text

    def save_html(self, html: str, filename: str = "market.html"):

        raw_dir = Path("data/raw")
        raw_dir.mkdir(parents=True, exist_ok=True)

        filepath = raw_dir / filename

        filepath.write_text(html, encoding="utf-8")

        logger.info(f"HTML sauvegardé : {filepath}")