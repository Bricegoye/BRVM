from dataclasses import dataclass


@dataclass(slots=True)
class Company:
    """
    Société cotée à la BRVM.
    """

    symbol: str
    name: str