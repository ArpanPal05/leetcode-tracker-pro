from dataclasses import dataclass, field
import json
import time
import urllib.error
import urllib.request

from app.features.problem_import.exceptions import (
    CodeforcesProblemNotFound,
    CodeforcesUnavailable,
)

_CODEFORCES_PROBLEMSET_API_URL = "https://codeforces.com/api/problemset.problems"


@dataclass
class CodeforcesProblemData:
    contest_id: int
    problem_index: str
    title: str
    rating: int | None
    tags: list[str] = field(default_factory=list)
    problem_type: str | None = None
    points: float | None = None


class CodeforcesClient:
    _TIMEOUT_SECONDS = 15
    _CACHE_TTL_SECONDS = 300  # 5 minutes cache for problemset list

    def __init__(self):
        self._cached_problems: list[dict] | None = None
        self._cache_timestamp: float = 0.0

    def _fetch_problemset_list(self) -> list[dict]:
        now = time.time()
        if self._cached_problems is not None and (now - self._cache_timestamp) < self._CACHE_TTL_SECONDS:
            return self._cached_problems

        req = urllib.request.Request(
            url=_CODEFORCES_PROBLEMSET_API_URL,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; DSATracker/1.0)",
                "Accept": "application/json",
            },
            method="GET",
        )

        try:
            with urllib.request.urlopen(req, timeout=self._TIMEOUT_SECONDS) as resp:
                raw = resp.read().decode("utf-8")
        except urllib.error.URLError as exc:
            raise CodeforcesUnavailable(
                f"Failed to reach Codeforces API: {exc}"
            ) from exc

        try:
            body = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise CodeforcesUnavailable(
                "Codeforces returned an unparseable response."
            ) from exc

        if body.get("status") != "OK":
            comment = body.get("comment", "Unknown Codeforces error")
            raise CodeforcesUnavailable(f"Codeforces API error: {comment}")

        problems = (body.get("result") or {}).get("problems")
        if not isinstance(problems, list):
            raise CodeforcesUnavailable("Codeforces API returned invalid problems list.")

        self._cached_problems = problems
        self._cache_timestamp = now
        return problems

    def fetch_problem(self, contest_id: int, problem_index: str) -> CodeforcesProblemData:
        problems = self._fetch_problemset_list()

        target_index = problem_index.strip().upper()

        for p in problems:
            if p.get("contestId") == contest_id and str(p.get("index", "")).strip().upper() == target_index:
                return CodeforcesProblemData(
                    contest_id=contest_id,
                    problem_index=target_index,
                    title=p.get("name", f"Problem {contest_id}{target_index}"),
                    rating=p.get("rating"),
                    tags=p.get("tags", []),
                    problem_type=p.get("type"),
                    points=p.get("points"),
                )

        raise CodeforcesProblemNotFound(
            f"Problem with contest ID {contest_id} and index '{problem_index}' not found on Codeforces."
        )


_codeforces_client_instance = CodeforcesClient()


def get_codeforces_client() -> CodeforcesClient:
    return _codeforces_client_instance
