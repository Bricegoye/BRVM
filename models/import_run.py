from dataclasses import dataclass
from datetime import datetime


@dataclass(slots=True)
class ImportRun:
    """
    Historique des imports.
    """

    started_at: datetime

    finished_at: datetime | None

    status: str

    records_imported: int

    error_message: str | None = None