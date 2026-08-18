from dataclasses import dataclass
from datetime import date


@dataclass(slots=True)
class MarketRanking:
    """
    Représente une valeur du Top 5 ou du Flop 5.
    """

    session_date: date

    ranking_type: str

    symbol: str

    close_price: float

    variation_percent: float