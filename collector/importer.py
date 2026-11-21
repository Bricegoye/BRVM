from collections import Counter
from datetime import datetime, timezone
import time

from collector.client import BRVMClient
from collector.parsers.market_parser import MarketParser
from collector.parsers.market_summary_parser import MarketSummaryParser

from database.connection import get_connection
from database.company_repository import CompanyRepository
from database.daily_price_repository import DailyPriceRepository
from database.market_index_repository import MarketIndexRepository
from database.market_activity_repository import MarketActivityRepository
from database.market_ranking_repository import MarketRankingRepository
from database.import_run_repository import ImportRunRepository

from models.import_run import ImportRun


EXPECTED_PRICES = 48
EXPECTED_INDICES = 12
EXPECTED_ACTIVITIES = 3


class Importer:

    @staticmethod
    def _save_run(
        conn,
        start_time: float,
        status: str,
        rows_imported: int,
        message: str,
    ) -> None:
        ImportRunRepository(conn).save(
            ImportRun(
                run_date=datetime.now(timezone.utc),
                status=status,
                source="BRVM",
                rows_imported=rows_imported,
                duration_seconds=round(time.time() - start_time, 2),
                message=message,
            )
        )

    @staticmethod
    def _get_single_session_date(items, label: str):
        if not items:
            raise ValueError(f"Aucune donnée reçue pour {label}.")

        dates = {item.session_date for item in items}

        if len(dates) != 1:
            raise ValueError(
                f"Plusieurs dates détectées pour {label} : "
                f"{sorted(dates)}"
            )

        return next(iter(dates))

    @staticmethod
    def _validate_session_dates(
        prices,
        indices,
        activities,
        rankings=None,
    ):
        dates = {
            Importer._get_single_session_date(prices, "les actions"),
            Importer._get_single_session_date(indices, "les indices"),
            Importer._get_single_session_date(
                activities, "l'activité du marché"
            ),
        }

        if rankings:
            dates.add(
                Importer._get_single_session_date(
                    rankings, "les classements"
                )
            )

        if len(dates) != 1:
            raise ValueError(
                "Les pages BRVM ne présentent pas la même "
                f"date de séance : {sorted(dates)}"
            )

        return next(iter(dates))

    @staticmethod
    def _validate_counts(
        prices,
        indices,
        activities,
        rankings=None,
    ) -> None:
        errors = []

        for label, items, expected in (
            ("actions", prices, EXPECTED_PRICES),
            ("indices", indices, EXPECTED_INDICES),
            ("activités", activities, EXPECTED_ACTIVITIES),
        ):
            if len(items) != expected:
                errors.append(
                    f"{len(items)} {label} au lieu de {expected}"
                )

        symbols = [price.symbol for price in prices]

        if len(set(symbols)) != len(symbols):
            errors.append("symboles d'actions en double")

        if errors:
            raise ValueError(
                "Séance BRVM incomplète : " + " ; ".join(errors)
            )

    @staticmethod
    def _ranking_warning(rankings, session_date):
        counts = Counter(item.ranking_type for item in rankings)
        keys = {
            (item.ranking_type, item.symbol)
            for item in rankings
        }

        if counts != Counter({"TOP5": 5, "FLOP5": 5}):
            return (
                "Classements ignorés : "
                f"TOP5={counts.get('TOP5', 0)}, "
                f"FLOP5={counts.get('FLOP5', 0)} "
                "(5 attendus pour chaque catégorie)."
            )

        if len(keys) != len(rankings):
            return "Classements ignorés : symboles en double."

        if any(
            item.session_date != session_date
            for item in rankings
        ):
            return (
                "Classements ignorés : date différente "
                "de celle des cotations."
            )

        return None

    def run(self):
        start_time = time.time()
        conn = None
        session_date = None

        try:
            client = BRVMClient()

            html_actions = client.fetch_market_page()
            companies, prices = MarketParser().parse(html_actions)

            response = client.session.get(
                "https://www.brvm.org/fr/indices",
                timeout=30,
            )
            response.raise_for_status()
            html_summary = response.text

            parser = MarketSummaryParser()

            indices = []
            for table_index, category in (
                (3, "MAIN"),
                (4, "SECTOR"),
                (5, "TOTAL_RETURN"),
            ):
                indices.extend(
                    parser.parse_indices(
                        html_summary,
                        table_index,
                        category,
                    )
                )

            activities = parser.parse_market_activity(html_summary)

            # Les données principales restent obligatoires.
            session_date = self._validate_session_dates(
                prices, indices, activities
            )
            print(f"Séance extraite : {session_date}", flush=True)

            self._validate_counts(prices, indices, activities)

            # Les classements sont facultatifs.
            # Un snapshot incomplet n'est jamais enregistré.
            rankings = []
            warning = None

            try:
                rankings.extend(
                    parser.parse_ranking(html_summary, 0, "TOP5")
                )
                rankings.extend(
                    parser.parse_ranking(html_summary, 1, "FLOP5")
                )
                warning = self._ranking_warning(
                    rankings, session_date
                )
            except (ValueError, IndexError, TypeError) as exc:
                warning = (
                    "Classements ignorés : erreur de lecture "
                    f"({type(exc).__name__}) : {exc}"
                )

            if warning:
                rankings = []
                print(f"AVERTISSEMENT : {warning}", flush=True)

            def with_warning(message):
                if warning:
                    return f"{message} AVERTISSEMENT : {warning}"
                return message

            conn = get_connection()
            prices_repository = DailyPriceRepository(conn)
            latest_date = prices_repository.get_latest_session_date()

            if latest_date is not None and session_date < latest_date:
                message = with_warning(
                    f"Séance périmée : {session_date} est antérieure "
                    f"à la dernière séance {latest_date}."
                )
                self._save_run(conn, start_time, "STALE", 0, message)
                print(message)
                return

            if session_date == latest_date:
                existing_count = (
                    prices_repository.get_session_company_count(
                        session_date
                    )
                )

                if existing_count >= EXPECTED_PRICES:
                    message = with_warning(
                        f"Séance {session_date} déjà importée "
                        f"avec {existing_count} actions."
                    )
                    self._save_run(
                        conn, start_time, "SKIPPED", 0, message
                    )
                    print(message)
                    return

            is_identical, compared_date = (
                prices_repository.is_identical_to_latest(prices)
            )

            if is_identical and session_date != compared_date:
                message = with_warning(
                    f"Séance {session_date} ignorée : les "
                    f"{len(prices)} actions sont identiques "
                    f"à la séance {compared_date}."
                )
                self._save_run(conn, start_time, "STALE", 0, message)
                print(message)
                return

            CompanyRepository(conn).save(companies)
            prices_repository.save(prices)
            MarketIndexRepository(conn).save(indices)
            MarketActivityRepository(conn).save(activities)

            if rankings:
                MarketRankingRepository(conn).save(rankings)

            rows_imported = (
                len(companies)
                + len(prices)
                + len(indices)
                + len(activities)
                + len(rankings)
            )

            message = with_warning(
                f"Import de la séance {session_date} terminé."
            )
            self._save_run(
                conn,
                start_time,
                "SUCCESS",
                rows_imported,
                message,
            )

            print("=" * 60)
            print("Import terminé")
            print("=" * 60)
            print(f"Séance : {session_date}")
            print(f"Sociétés : {len(companies)}")
            print(f"Cotations : {len(prices)}")
            print(f"Indices : {len(indices)}")
            print(f"Activités : {len(activities)}")
            print(f"Rankings enregistrés : {len(rankings)}")
            if warning:
                print(f"AVERTISSEMENT : {warning}")
            print(f"Durée : {round(time.time() - start_time, 2)} secondes")
            print("=" * 60)

        except Exception as exc:
            if conn is None:
                try:
                    conn = get_connection()
                except Exception:
                    conn = None

            if conn is not None:
                try:
                    conn.rollback()
                    self._save_run(
                        conn,
                        start_time,
                        "ERROR",
                        0,
                        f"Séance {session_date or 'non déterminée'} : {exc}",
                    )
                except Exception:
                    pass

            raise

        finally:
            if conn is not None:
                conn.close()