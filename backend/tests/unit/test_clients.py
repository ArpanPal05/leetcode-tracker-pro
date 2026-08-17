import json
import io
import urllib.error
import pytest
from unittest.mock import MagicMock, patch

from app.features.problem_import.client import (
    LeetCodeClient,
    LeetCodeProblemData,
    extract_slug_from_url,
)
from app.features.problem_import.clients.codechef import (
    CodeChefClient,
    parse_codechef_html,
)
from app.features.problem_import.clients.codeforces import CodeforcesClient
from app.features.problem_import.exceptions import (
    CodeChefProblemNotFound,
    CodeChefUnavailable,
    CodeforcesProblemNotFound,
    CodeforcesUnavailable,
    LeetCodeProblemNotFound,
    LeetCodeUnavailable,
)


# ==================== LEETCODE CLIENT TESTS ====================

def test_extract_slug_from_url_valid():
    assert extract_slug_from_url("https://leetcode.com/problems/two-sum") == "two-sum"
    assert extract_slug_from_url("https://leetcode.com/problems/two-sum/") == "two-sum"
    assert extract_slug_from_url("https://leetcode.com/problems/two-sum/description/") == "two-sum"


def test_extract_slug_from_url_invalid():
    with pytest.raises(ValueError):
        extract_slug_from_url("https://google.com")
    with pytest.raises(ValueError):
        extract_slug_from_url("https://leetcode.com/problems/")


@patch("urllib.request.urlopen")
def test_leetcode_client_success(mock_urlopen):
    mock_response_data = {
        "data": {
            "question": {
                "questionFrontendId": "1",
                "title": "Two Sum",
                "titleSlug": "two-sum",
                "difficulty": "Easy",
                "isPaidOnly": False,
                "acRate": 48.5,
                "topicTags": [
                    {"name": "Array", "slug": "array"},
                    {"name": "Hash Table", "slug": "hash-table"},
                ],
            }
        }
    }
    mock_fp = io.BytesIO(json.dumps(mock_response_data).encode("utf-8"))
    mock_urlopen.return_value.__enter__.return_value = mock_fp

    client = LeetCodeClient()
    data = client.fetch_problem("two-sum")

    assert isinstance(data, LeetCodeProblemData)
    assert data.title == "Two Sum"
    assert data.difficulty == "Easy"
    assert data.acceptance_rate == 48.5
    assert len(data.topic_tags) == 2
    assert data.topic_tags[0].name == "Array"


@patch("urllib.request.urlopen")
def test_leetcode_client_problem_not_found(mock_urlopen):
    mock_response_data = {"data": {"question": None}}
    mock_fp = io.BytesIO(json.dumps(mock_response_data).encode("utf-8"))
    mock_urlopen.return_value.__enter__.return_value = mock_fp

    client = LeetCodeClient()
    with pytest.raises(LeetCodeProblemNotFound):
        client.fetch_problem("nonexistent-slug")


@patch("urllib.request.urlopen")
def test_leetcode_client_network_error(mock_urlopen):
    mock_urlopen.side_effect = urllib.error.URLError("Connection refused")

    client = LeetCodeClient()
    with pytest.raises(LeetCodeUnavailable):
        client.fetch_problem("two-sum")


# ==================== CODEFORCES CLIENT TESTS ====================

@patch("urllib.request.urlopen")
def test_codeforces_client_success(mock_urlopen):
    mock_data = {
        "status": "OK",
        "result": {
            "problems": [
                {
                    "contestId": 4,
                    "index": "A",
                    "name": "Watermelon",
                    "type": "PROGRAMMING",
                    "rating": 800,
                    "tags": ["brute force", "math"],
                }
            ]
        },
    }
    mock_fp = io.BytesIO(json.dumps(mock_data).encode("utf-8"))
    mock_urlopen.return_value.__enter__.return_value = mock_fp

    client = CodeforcesClient()
    data = client.fetch_problem(4, "A")

    assert data.title == "Watermelon"
    assert data.rating == 800
    assert "math" in data.tags


@patch("urllib.request.urlopen")
def test_codeforces_client_problem_not_found(mock_urlopen):
    mock_data = {"status": "OK", "result": {"problems": []}}
    mock_fp = io.BytesIO(json.dumps(mock_data).encode("utf-8"))
    mock_urlopen.return_value.__enter__.return_value = mock_fp

    client = CodeforcesClient()
    with pytest.raises(CodeforcesProblemNotFound):
        client.fetch_problem(999, "Z")


@patch("urllib.request.urlopen")
def test_codeforces_client_api_error(mock_urlopen):
    mock_data = {"status": "FAILED", "comment": "Call limit exceeded"}
    mock_fp = io.BytesIO(json.dumps(mock_data).encode("utf-8"))
    mock_urlopen.return_value.__enter__.return_value = mock_fp

    client = CodeforcesClient()
    with pytest.raises(CodeforcesUnavailable, match="Call limit exceeded"):
        client.fetch_problem(1, "A")


# ==================== CODECHEF CLIENT TESTS ====================

def test_parse_codechef_html_valid():
    html = """
    <html>
      <head>
        <title>Number Mirror | CodeChef</title>
      </head>
      <body></body>
    </html>
    """
    data = parse_codechef_html(html, "START01", "https://www.codechef.com/problems/START01")
    assert data.external_id == "START01"
    assert data.title == "Number Mirror"


def test_parse_codechef_html_empty_fallback():
    html = "<html><head></head><body></body></html>"
    data = parse_codechef_html(html, "TEST01", "https://www.codechef.com/problems/TEST01")
    assert data.external_id == "TEST01"
    assert data.title == "Problem TEST01"


@patch("httpx.Client.get")
def test_codechef_client_404(mock_get):
    mock_resp = MagicMock()
    mock_resp.status_code = 404
    mock_get.return_value = mock_resp

    client = CodeChefClient()
    with pytest.raises(CodeChefProblemNotFound):
        client.fetch_problem("NONEXISTENT")
