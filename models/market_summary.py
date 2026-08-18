from dataclasses import dataclass
from datetime import date


@dataclass(slots=True)
class MarketSummary:
    """
    Résumé de la séance de marché.
    """

    session_date: date

    total_volume: int

    total_value: float

    transactions: int