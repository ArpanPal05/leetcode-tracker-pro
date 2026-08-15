from dataclasses import dataclass
import urllib.parse

from app.features.problem_import.exceptions import InvalidCodeforcesURL


@dataclass
class CodeforcesURLIdentifier:
    contest_id: int
    problem_index: str
    external_id: str


def extract_codeforces_identifier(url: str) -> CodeforcesURLIdentifier:
    if not url or not isinstance(url, str):
        raise InvalidCodeforcesURL("Codeforces URL cannot be empty.")

    cleaned = url.strip()
    if not cleaned.startswith(("http://", "https://")):
        cleaned = "https://" + cleaned

    try:
        parsed = urllib.parse.urlparse(cleaned)
    except Exception as exc:
        raise InvalidCodeforcesURL(f"Malformed Codeforces URL: {url!r}") from exc

    path_parts = [p for p in parsed.path.strip("/").split("/") if p]

    # Format 1: /problemset/problem/{contestId}/{index}
    if len(path_parts) >= 4 and path_parts[0].lower() == "problemset" and path_parts[1].lower() == "problem":
        raw_contest_id = path_parts[2]
        raw_index = path_parts[3].upper()
    # Format 2: /contest/{contestId}/problem/{index}
    elif len(path_parts) >= 4 and path_parts[0].lower() == "contest" and path_parts[2].lower() == "problem":
        raw_contest_id = path_parts[1]
        raw_index = path_parts[3].upper()
    else:
        raise InvalidCodeforcesURL(
            f"Not a valid Codeforces problem URL: {url!r}. "
            "Expected format: https://codeforces.com/problemset/problem/{contestId}/{index}"
        )

    try:
        contest_id = int(raw_contest_id)
    except ValueError as exc:
        raise InvalidCodeforcesURL(
            f"Invalid Codeforces contest ID '{raw_contest_id}' in URL: {url!r}"
        ) from exc

    problem_index = raw_index.strip()
    if not problem_index:
        raise InvalidCodeforcesURL(f"Empty problem index in URL: {url!r}")

    external_id = f"{contest_id}{problem_index}"
    return CodeforcesURLIdentifier(
        contest_id=contest_id,
        problem_index=problem_index,
        external_id=external_id,
    )
