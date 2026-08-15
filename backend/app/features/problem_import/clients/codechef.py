from dataclasses import dataclass, field
import re
from bs4 import BeautifulSoup
import httpx

from app.features.problem_import.exceptions import (
    CodeChefParsingError,
    CodeChefProblemNotFound,
    CodeChefUnavailable,
)

_CODECHEF_PROBLEM_URL_TEMPLATE = "https://www.codechef.com/problems/{problem_code}"
_DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


@dataclass
class CodeChefProblemData:
    external_id: str
    title: str
    source_url: str
    rating: int | None = None
    tags: list[str] = field(default_factory=list)


def parse_codechef_html(html: str, problem_code: str, source_url: str) -> CodeChefProblemData:
    """
    Parses CodeChef problem HTML to extract problem title and metadata.
    Does not invent data; returns None/empty list if not found.
    """
    try:
        soup = BeautifulSoup(html, "html.parser")
    except Exception as exc:
        raise CodeChefParsingError(f"Failed to parse HTML for '{problem_code}': {exc}") from exc

    raw_title = ""
    title_tag = soup.find("title")
    if title_tag and title_tag.string:
        raw_title = title_tag.string.strip()

    # If title tag was empty, check og:title meta tag
    if not raw_title:
        og_title = soup.find("meta", property="og:title") or soup.find("meta", attrs={"name": "og:title"})
        if og_title and og_title.get("content"):
            raw_title = str(og_title["content"]).strip()

    title = raw_title
    # Strip common CodeChef title suffixes
    suffixes_to_strip = [
        " Practice Coding Problem",
        " Practice Problem",
        " | CodeChef",
        " - CodeChef",
        " Problem - CodeChef",
        " | CodeChef Problem",
    ]
    for suffix in suffixes_to_strip:
        if title.endswith(suffix):
            title = title[: -len(suffix)].strip()

    # Fallback to problem code if title could not be extracted
    if not title:
        title = f"Problem {problem_code}"

    # Extract tags/topics if reliably present in meta tags/HTML
    tags: list[str] = []

    return CodeChefProblemData(
        external_id=problem_code,
        title=title,
        source_url=source_url,
        rating=None,
        tags=tags,
    )


class CodeChefClient:
    _TIMEOUT_SECONDS = 15.0

    def __init__(self, timeout: float = _TIMEOUT_SECONDS):
        self._timeout = timeout

    def fetch_problem(self, problem_code: str) -> CodeChefProblemData:
        sanitized_code = problem_code.strip().upper()
        url = _CODECHEF_PROBLEM_URL_TEMPLATE.format(problem_code=sanitized_code)

        try:
            with httpx.Client(
                timeout=self._timeout,
                follow_redirects=True,
                headers=_DEFAULT_HEADERS,
            ) as client:
                resp = client.get(url)
        except httpx.TimeoutException as exc:
            raise CodeChefUnavailable(
                f"Timeout while connecting to CodeChef for problem '{sanitized_code}'."
            ) from exc
        except httpx.RequestError as exc:
            raise CodeChefUnavailable(
                f"Failed to reach CodeChef for problem '{sanitized_code}': {exc}"
            ) from exc

        if resp.status_code == 404:
            raise CodeChefProblemNotFound(
                f"Problem '{sanitized_code}' not found on CodeChef."
            )
        elif resp.status_code == 403 or resp.status_code == 429:
            raise CodeChefUnavailable(
                f"CodeChef rate limited or blocked request (HTTP {resp.status_code})."
            )
        elif resp.status_code >= 500:
            raise CodeChefUnavailable(
                f"CodeChef server error (HTTP {resp.status_code})."
            )
        elif resp.status_code != 200:
            raise CodeChefUnavailable(
                f"Unexpected HTTP status {resp.status_code} from CodeChef."
            )

        return parse_codechef_html(resp.text, sanitized_code, url)


_codechef_client_instance = CodeChefClient()


def get_codechef_client() -> CodeChefClient:
    return _codechef_client_instance
