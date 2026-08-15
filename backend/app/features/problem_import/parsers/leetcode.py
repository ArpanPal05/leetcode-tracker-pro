import urllib.parse

from app.features.problem_import.exceptions import InvalidLeetCodeURL


def extract_slug_from_url(url: str) -> str:
    if not url or not isinstance(url, str):
        raise InvalidLeetCodeURL("LeetCode URL cannot be empty.")

    cleaned = url.strip()
    if not cleaned.startswith(("http://", "https://")):
        cleaned = "https://" + cleaned

    try:
        parsed = urllib.parse.urlparse(cleaned)
    except Exception as exc:
        raise InvalidLeetCodeURL(f"Malformed LeetCode URL: {url!r}") from exc

    netloc = parsed.netloc.lower()
    if netloc.startswith("www."):
        netloc = netloc[4:]

    if netloc != "leetcode.com" and not netloc.endswith(".leetcode.com"):
        raise InvalidLeetCodeURL(f"Not a LeetCode domain: {parsed.netloc!r}")

    path_parts = [p for p in parsed.path.strip("/").split("/") if p]

    # Standard format: /problems/<slug> or /problems/<slug>/description
    if len(path_parts) >= 2 and path_parts[0].lower() == "problems":
        slug = path_parts[1].strip()
        if slug:
            return slug

    raise InvalidLeetCodeURL(
        f"Not a valid LeetCode problem URL: {url!r}. Expected format: https://leetcode.com/problems/<slug>/"
    )
