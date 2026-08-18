from dataclasses import dataclass
from datetime import date


@dataclass(slots=True)
class MarketActivity:
    """
    Représente une statistique globale du marché.
    """

    session_date: date

    label: str

    value: float