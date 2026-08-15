import urllib.parse

from app.features.problem_import.exceptions import InvalidCodeChefURL


def extract_codechef_problem_code(url: str) -> str:
    """
    Extracts the problem code from a CodeChef problem URL.
    
    Supported formats:
    - https://www.codechef.com/problems/{PROBLEM_CODE}
    - https://codechef.com/problems/{PROBLEM_CODE}/
    - https://www.codechef.com/problems/{PROBLEM_CODE}/description
    """
    if not url or not isinstance(url, str):
        raise InvalidCodeChefURL("CodeChef URL cannot be empty.")

    cleaned = url.strip()
    if not cleaned.startswith(("http://", "https://")):
        cleaned = "https://" + cleaned

    try:
        parsed = urllib.parse.urlparse(cleaned)
    except Exception as exc:
        raise InvalidCodeChefURL(f"Malformed CodeChef URL: {url!r}") from exc

    netloc = parsed.netloc.lower()
    if netloc.startswith("www."):
        netloc = netloc[4:]

    if netloc != "codechef.com" and not netloc.endswith(".codechef.com"):
        raise InvalidCodeChefURL(f"Not a CodeChef domain: {parsed.netloc!r}")

    path_parts = [p for p in parsed.path.strip("/").split("/") if p]

    # Expected: /problems/<problem_code>
    if len(path_parts) >= 2 and path_parts[0].lower() == "problems":
        problem_code = path_parts[1].strip().upper()
        if problem_code:
            return problem_code

    raise InvalidCodeChefURL(
        f"Not a valid CodeChef problem URL: {url!r}. "
        "Expected format: https://www.codechef.com/problems/{PROBLEM_CODE}"
    )
