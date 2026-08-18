from dataclasses import dataclass
from datetime import datetime


@dataclass(slots=True)
class ImportRun:
    run_date: datetime
    status: str
    source: str
    rows_imported: int
    duration_seconds: float
    message: str | None = None