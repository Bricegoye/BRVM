from datetime import datetime, timezone
import time

from collector.client import BRVMClient
from collector.parsers.market_parser import MarketParser
from collector.parsers.market_summary_parser import (
    MarketSummaryParser,
)

from database.connection import get_connection
from database.company_repository import CompanyRepository
from database.daily_price_repository import (
    DailyPriceRepository,
)
from database.market_index_repository import (
    MarketIndexRepository,
)
from database.market_activity_repository import (
    MarketActivityRepository,
)
from database.market_ranking_repository import (
    MarketRankingRepository,
)
from database.import_run_repository import (
    ImportRunRepository,
)

from models.import_run import ImportRun


EXPECTED_PRICES = 47
EXPECTED_INDICES = 12
EXPECTED_ACTIVITIES = 3
EXPECTED_RANKINGS = 10


class Importer:

    @staticmethod
    def _save_run(
        conn,
        start_time: float,
        status: str,
        rows_imported: int,
        message: str,
    ) -> None:
        duration = round(time.time() - start_time, 2)

        ImportRunRepository(conn).save(
            ImportRun(
                run_date=datetime.now(timezone.utc),
                status=status,
                source="BRVM",
                rows_imported=rows_imported,
                duration_seconds=duration,
                message=message,
            )
        )

    @staticmethod
    def _get_single_session_date(
        items,
        label: str,
    ):
        if not items:
            raise ValueError(
                f"Aucune donnée reçue pour {label}."
            )

        session_dates = {
            item.session_date
            for item in items
        }

        if len(session_dates) != 1:
            raise ValueError(
                f"Plusieurs dates détectées pour {label} : "
                f"{sorted(session_dates)}"
            )

        return next(iter(session_dates))

    @staticmethod
    def _validate_session_dates(
        prices,
        indices,
        activities,
        rankings,
    ):
        prices_date = Importer._get_single_session_date(
            prices,
            "les actions",
        )

        indices_date = Importer._get_single_session_date(
            indices,
            "les indices",
        )

        activities_date = Importer._get_single_session_date(
            activities,
            "l'activité du marché",
        )

        if rankings:
            rankings_date = Importer._get_single_session_date(
                rankings,
                "les classements",
            )
        else:
            rankings_date = prices_date

        parsed_dates = {
            prices_date,
            indices_date,
            activities_date,
            rankings_date,
        }

        if len(parsed_dates) != 1:
            raise ValueError(
                "Les pages BRVM ne présentent pas la même "
                f"date de séance : {sorted(parsed_dates)}"
            )

        return prices_date

    @staticmethod
    def _validate_counts(
        prices,
        indices,
        activities,
        rankings,
    ) -> None:
        errors = []

        if len(prices) != EXPECTED_PRICES:
            errors.append(
                f"{len(prices)} actions au lieu de "
                f"{EXPECTED_PRICES}"
            )

        if len(indices) != EXPECTED_INDICES:
            errors.append(
                f"{len(indices)} indices au lieu de "
                f"{EXPECTED_INDICES}"
            )

        if len(activities) != EXPECTED_ACTIVITIES:
            errors.append(
                f"{len(activities)} activités au lieu de "
                f"{EXPECTED_ACTIVITIES}"
            )

        if len(rankings) != EXPECTED_RANKINGS:
            errors.append(
                f"{len(rankings)} classements au lieu de "
                f"{EXPECTED_RANKINGS}"
            )

        if errors:
            raise ValueError(
                "Séance BRVM incomplète : "
                + " ; ".join(errors)
            )

    def run(self):

        start_time = time.time()
        conn = None

        try:
            client = BRVMClient()

            # Actions
            html_actions = client.fetch_market_page()

            market_parser = MarketParser()
            companies, prices = market_parser.parse(
                html_actions
            )

            # Résumé du marché
            response = client.session.get(
                "https://www.brvm.org/fr/indices",
                timeout=30,
            )
            response.raise_for_status()

            html_summary = response.text

            summary_parser = MarketSummaryParser()

            indices = []

            indices.extend(
                summary_parser.parse_indices(
                    html_summary,
                    3,
                    "MAIN",
                )
            )

            indices.extend(
                summary_parser.parse_indices(
                    html_summary,
                    4,
                    "SECTOR",
                )
            )

            indices.extend(
                summary_parser.parse_indices(
                    html_summary,
                    5,
                    "TOTAL_RETURN",
                )
            )

            activities = (
                summary_parser.parse_market_activity(
                    html_summary
                )
            )

            rankings = []

            rankings.extend(
                summary_parser.parse_ranking(
                    html_summary,
                    0,
                    "TOP5",
                )
            )

            rankings.extend(
                summary_parser.parse_ranking(
                    html_summary,
                    1,
                    "FLOP5",
                )
            )

            # Cohérence des dates extraites
            session_date = self._validate_session_dates(
                prices,
                indices,
                activities,
                rankings,
            )

            # Connexion avant les contrôles historiques
            conn = get_connection()

            daily_price_repository = (
                DailyPriceRepository(conn)
            )

            latest_session_date = (
                daily_price_repository
                .get_latest_session_date()
            )

            # Une date plus ancienne que la dernière date
            if (
                latest_session_date is not None
                and session_date < latest_session_date
            ):
                message = (
                    f"Séance périmée : {session_date} est "
                    f"antérieure à la dernière séance "
                    f"{latest_session_date}."
                )

                self._save_run(
                    conn,
                    start_time,
                    "STALE",
                    0,
                    message,
                )

                print(message)
                return

            # Une séance déjà entièrement importée
            if (
                latest_session_date is not None
                and session_date == latest_session_date
            ):
                existing_count = (
                    daily_price_repository
                    .get_session_company_count(
                        session_date
                    )
                )

                if existing_count >= len(prices):
                    message = (
                        f"Séance {session_date} déjà importée "
                        f"avec {existing_count} actions."
                    )

                    self._save_run(
                        conn,
                        start_time,
                        "SKIPPED",
                        0,
                        message,
                    )

                    print(message)
                    return

            # Nouvelle date mais snapshot identique
            (
                is_identical,
                compared_session_date,
            ) = daily_price_repository.is_identical_to_latest(
                prices
            )

            if (
                is_identical
                and session_date != compared_session_date
            ):
                message = (
                    f"Séance {session_date} ignorée : "
                    f"les {len(prices)} actions sont "
                    f"identiques à la séance "
                    f"{compared_session_date}."
                )

                self._save_run(
                    conn,
                    start_time,
                    "STALE",
                    0,
                    message,
                )

                print(message)
                return

            # Contrôle des quantités avant insertion
            self._validate_counts(
                prices,
                indices,
                activities,
                rankings,
            )

            # Enregistrement en base
            CompanyRepository(conn).save(companies)

            daily_price_repository.save(prices)

            MarketIndexRepository(conn).save(indices)

            MarketActivityRepository(conn).save(
                activities
            )

            MarketRankingRepository(conn).save(
                rankings
            )

            rows_imported = (
                len(companies)
                + len(prices)
                + len(indices)
                + len(activities)
                + len(rankings)
            )

            self._save_run(
                conn,
                start_time,
                "SUCCESS",
                rows_imported,
                (
                    f"Import de la séance {session_date} "
                    "terminé avec succès"
                ),
            )

            duration = round(
                time.time() - start_time,
                2,
            )

            print("=" * 60)
            print("Import terminé")
            print("=" * 60)
            print(f"Séance : {session_date}")
            print(f"Sociétés : {len(companies)}")
            print(f"Cotations : {len(prices)}")
            print(f"Indices : {len(indices)}")
            print(f"Activités : {len(activities)}")
            print(f"Rankings : {len(rankings)}")
            print(f"Durée : {duration} secondes")
            print("=" * 60)

        except Exception as exc:

            duration = round(
                time.time() - start_time,
                2,
            )

            if conn is None:
                try:
                    conn = get_connection()
                except Exception:
                    conn = None

            if conn is not None:
                try:
                    ImportRunRepository(conn).save(
                        ImportRun(
                            run_date=datetime.now(
                                timezone.utc
                            ),
                            status="ERROR",
                            source="BRVM",
                            rows_imported=0,
                            duration_seconds=duration,
                            message=str(exc),
                        )
                    )
                except Exception:
                    pass

            raise

        finally:
            if conn is not None:
                conn.close()