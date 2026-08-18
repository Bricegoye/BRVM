from dataclasses import dataclass
from datetime import date


@dataclass(slots=True)
class MarketIndex:
    """
    Représente un indice BRVM.
    """

    session_date: date

    name: str

    previous_close: float

    close_price: float

    variation_percent: float

    year_variation_percent: float

    category: str