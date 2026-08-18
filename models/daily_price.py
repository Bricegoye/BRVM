from dataclasses import dataclass
from datetime import date


@dataclass(slots=True)
class DailyPrice:
    """
    Cotation journalière d'une société.
    """

    session_date: date

    symbol: str

    volume: int

    previous_close: float

    open_price: float

    close_price: float

    variation_percent: float