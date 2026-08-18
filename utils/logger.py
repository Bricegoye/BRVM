import logging
from pathlib import Path


def setup_logger(name: str = "brvm") -> logging.Logger:
    """
    Configure un logger commun à toute l'application.
    """

    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    logger = logging.getLogger(name)

    if logger.hasHandlers():
        return logger

    logger.setLevel(logging.INFO)

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Affichage console
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    # Fichier de log
    file_handler = logging.FileHandler(
        log_dir / "brvm.log",
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger