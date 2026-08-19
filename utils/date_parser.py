import re
from datetime import date

from bs4 import BeautifulSoup


MONTHS_FR = {
    "janvier": 1,
    "février": 2,
    "fevrier": 2,
    "mars": 3,
    "avril": 4,
    "mai": 5,
    "juin": 6,
    "juillet": 7,
    "août": 8,
    "aout": 8,
    "septembre": 9,
    "octobre": 10,
    "novembre": 11,
    "décembre": 12,
    "decembre": 12,
}


def extract_brvm_session_date(html: str) -> date:
    """
    Extrait la date de la dernière mise à jour publiée par la BRVM.

    Exemple :
    'Dernière mise à jour : Mardi, 18 août, 2026 - 22:15'
    """

    soup = BeautifulSoup(html, "lxml")

    text = soup.get_text(" ", strip=True)

    pattern = (
        r"Dernière mise à jour\s*:\s*"
        r"[A-Za-zÀ-ÿ]+,\s*"
        r"(\d{1,2})\s+"
        r"([A-Za-zÀ-ÿ]+),\s*"
        r"(\d{4})"
    )

    match = re.search(pattern, text, re.IGNORECASE)

    if not match:
        raise ValueError(
            "Impossible de trouver la date de séance BRVM dans le HTML."
        )

    day = int(match.group(1))
    month_name = match.group(2).lower()
    year = int(match.group(3))

    month = MONTHS_FR.get(month_name)

    if month is None:
        raise ValueError(
            f"Mois BRVM inconnu : {month_name}"
        )

    return date(year, month, day)