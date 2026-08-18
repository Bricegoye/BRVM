from bs4 import BeautifulSoup


class IndexParser:

    def parse(self, html: str):

        soup = BeautifulSoup(html, "lxml")

        tables = soup.find_all("table")

        print(f"Nombre de tableaux : {len(tables)}")

        for i, table in enumerate(tables):

            print("=" * 60)
            print(f"TABLEAU {i+1}")

            headers = [
                th.get_text(strip=True)
                for th in table.find_all("th")
            ]

            print(headers)