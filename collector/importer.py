from collector.client import BRVMClient
from collector.parsers.market_parser import MarketParser
from collector.parsers.market_summary_parser import MarketSummaryParser

from database.connection import get_connection
from database.company_repository import CompanyRepository
from database.daily_price_repository import DailyPriceRepository
from database.market_index_repository import MarketIndexRepository
from database.market_activity_repository import MarketActivityRepository
from database.market_ranking_repository import MarketRankingRepository


class Importer:

    def run(self):

        client = BRVMClient()

        # ==========================
        # Actions
        # ==========================

        html_actions = client.fetch_market_page()

        market_parser = MarketParser()

        companies, prices = market_parser.parse(html_actions)

        # ==========================
        # Résumé du marché
        # ==========================

        html_summary = client.session.get(
            "https://www.brvm.org/fr/indices"
        ).text

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

        activities = summary_parser.parse_market_activity(
            html_summary
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

        # ==========================
        # Base de données
        # ==========================

        conn = get_connection()

        CompanyRepository(conn).save(companies)

        DailyPriceRepository(conn).save(prices)

        MarketIndexRepository(conn).save(indices)

        MarketActivityRepository(conn).save(activities)

        MarketRankingRepository(conn).save(rankings)

        conn.close()

        print("=" * 60)
        print("Import terminé")
        print("=" * 60)
        print(f"Sociétés : {len(companies)}")
        print(f"Cotations : {len(prices)}")
        print(f"Indices : {len(indices)}")
        print(f"Activités : {len(activities)}")
        print(f"Rankings : {len(rankings)}")
        print("=" * 60)