import os
import unittest
from unittest.mock import MagicMock, patch
import httpx

from app.features.problem_import.clients.codechef import (
    CodeChefClient,
    parse_codechef_html,
)
from app.features.problem_import.exceptions import (
    CodeChefProblemNotFound,
    CodeChefUnavailable,
)


class TestCodeChefClient(unittest.TestCase):

    def setUp(self):
        fixture_path = os.path.join(os.path.dirname(__file__), "fixtures", "codechef_problem.html")
        with open(fixture_path, "r", encoding="utf-8") as f:
            self.sample_html = f.read()

    def test_parse_html_fixture(self):
        data = parse_codechef_html(
            html=self.sample_html,
            problem_code="START01",
            source_url="https://www.codechef.com/problems/START01",
        )
        self.assertEqual(data.external_id, "START01")
        self.assertEqual(data.title, "Number Mirror")
        self.assertEqual(data.source_url, "https://www.codechef.com/problems/START01")
        self.assertIsNone(data.rating)
        self.assertEqual(data.tags, [])

    def test_parse_html_alternate_title_suffixes(self):
        html_pipe = "<html><head><title>Add Two Numbers | CodeChef</title></head></html>"
        data_pipe = parse_codechef_html(html_pipe, "FLOW001", "https://www.codechef.com/problems/FLOW001")
        self.assertEqual(data_pipe.title, "Add Two Numbers")

        html_dash = "<html><head><title>Summer Heat - CodeChef</title></head></html>"
        data_dash = parse_codechef_html(html_dash, "COCONUT", "https://www.codechef.com/problems/COCONUT")
        self.assertEqual(data_dash.title, "Summer Heat")

        html_og = "<html><head><meta property='og:title' content='Chef and Strings Practice Problem'></head></html>"
        data_og = parse_codechef_html(html_og, "CHEFSTR1", "https://www.codechef.com/problems/CHEFSTR1")
        self.assertEqual(data_og.title, "Chef and Strings")

    def test_parse_html_empty_fallback(self):
        html_empty = "<html><head></head><body></body></html>"
        data = parse_codechef_html(html_empty, "CUSTOM01", "https://www.codechef.com/problems/CUSTOM01")
        self.assertEqual(data.title, "Problem CUSTOM01")

    @patch("httpx.Client")
    def test_fetch_problem_success(self, mock_client_cls):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.text = self.sample_html

        mock_client = MagicMock()
        mock_client.get.return_value = mock_resp
        mock_client.__enter__.return_value = mock_client
        mock_client_cls.return_value = mock_client

        client = CodeChefClient()
        data = client.fetch_problem("start01")

        self.assertEqual(data.external_id, "START01")
        self.assertEqual(data.title, "Number Mirror")
        mock_client.get.assert_called_once_with("https://www.codechef.com/problems/START01")

    @patch("httpx.Client")
    def test_fetch_problem_404_not_found(self, mock_client_cls):
        mock_resp = MagicMock()
        mock_resp.status_code = 404

        mock_client = MagicMock()
        mock_client.get.return_value = mock_resp
        mock_client.__enter__.return_value = mock_client
        mock_client_cls.return_value = mock_client

        client = CodeChefClient()
        with self.assertRaises(CodeChefProblemNotFound):
            client.fetch_problem("NOT_A_PROBLEM")

    @patch("httpx.Client")
    def test_fetch_problem_500_unavailable(self, mock_client_cls):
        mock_resp = MagicMock()
        mock_resp.status_code = 500

        mock_client = MagicMock()
        mock_client.get.return_value = mock_resp
        mock_client.__enter__.return_value = mock_client
        mock_client_cls.return_value = mock_client

        client = CodeChefClient()
        with self.assertRaises(CodeChefUnavailable):
            client.fetch_problem("START01")

    @patch("httpx.Client")
    def test_fetch_problem_timeout(self, mock_client_cls):
        mock_client = MagicMock()
        mock_client.get.side_effect = httpx.TimeoutException("Timeout")
        mock_client.__enter__.return_value = mock_client
        mock_client_cls.return_value = mock_client

        client = CodeChefClient()
        with self.assertRaises(CodeChefUnavailable):
            client.fetch_problem("START01")


if __name__ == "__main__":
    unittest.main()
