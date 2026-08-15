import urllib.parse

from app.features.problem_import.exceptions import (
    InvalidProblemURL,
    UnsupportedPlatform,
)
from app.shared.enums import Platform


def detect_platform(url: str) -> Platform:
    if not url or not isinstance(url, str):
        raise InvalidProblemURL("Problem URL must be a non-empty string.")

    cleaned = url.strip()
    if not cleaned.startswith(("http://", "https://")):
        cleaned = "https://" + cleaned

    try:
        parsed = urllib.parse.urlparse(cleaned)
    except Exception as exc:
        raise InvalidProblemURL(f"Malformed URL: {url!r}") from exc

    netloc = parsed.netloc.lower()
    # Remove 'www.' prefix if present
    if netloc.startswith("www."):
        netloc = netloc[4:]

    if netloc == "leetcode.com" or netloc.endswith(".leetcode.com"):
        return Platform.LEETCODE

    if netloc == "codeforces.com" or netloc.endswith(".codeforces.com"):
        return Platform.CODEFORCES

    if netloc == "codechef.com" or netloc.endswith(".codechef.com"):
        return Platform.CODECHEF

    raise UnsupportedPlatform(
        f"Unsupported platform domain: {parsed.netloc!r}. Supported platforms: LeetCode, Codeforces, CodeChef."
    )
