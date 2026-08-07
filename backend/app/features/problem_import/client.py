import json
import urllib.error
import urllib.request
from dataclasses import dataclass, field

from app.features.problem_import.exceptions import (
    LeetCodeProblemNotFound,
    LeetCodeUnavailable,
)

_LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

_QUESTION_QUERY = """
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionFrontendId
    title
    titleSlug
    difficulty
    isPaidOnly
    acRate
    topicTags {
      name
      slug
    }
  }
}
"""


@dataclass
class TopicTag:
    name: str
    slug: str


@dataclass
class LeetCodeProblemData:
    frontend_question_id: str
    title: str
    slug: str
    difficulty: str          
    is_premium: bool
    acceptance_rate: float
    topic_tags: list[TopicTag] = field(default_factory=list)


class LeetCodeClient:

    _TIMEOUT_SECONDS = 10

    def fetch_problem(self, slug: str) -> LeetCodeProblemData:
        
        payload = json.dumps({
            "operationName": "questionData",
            "query": _QUESTION_QUERY,
            "variables": {"titleSlug": slug},
        }).encode("utf-8")

        req = urllib.request.Request(
            url=_LEETCODE_GRAPHQL_URL,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (compatible; DSATracker/1.0)",
                "Referer": "https://leetcode.com",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=self._TIMEOUT_SECONDS) as resp:
                raw = resp.read().decode("utf-8")
        except urllib.error.URLError as exc:
            raise LeetCodeUnavailable(
                f"Failed to reach LeetCode: {exc}"
            ) from exc

        try:
            body = json.loads(raw)
        except json.JSONDecodeError as exc:
            raise LeetCodeUnavailable(
                "LeetCode returned an unparseable response."
            ) from exc

        question = (body.get("data") or {}).get("question")

        if not question:
            raise LeetCodeProblemNotFound(
                f"No problem found on LeetCode for slug '{slug}'."
            )

        topic_tags = [
            TopicTag(name=t["name"], slug=t["slug"])
            for t in (question.get("topicTags") or [])
        ]

        return LeetCodeProblemData(
            frontend_question_id=str(question.get("questionFrontendId", "")),
            title=question["title"],
            slug=question["titleSlug"],
            difficulty=question["difficulty"],
            is_premium=bool(question.get("isPaidOnly", False)),
            acceptance_rate=float(question.get("acRate") or 0.0),
            topic_tags=topic_tags,
        )


def extract_slug_from_url(url: str) -> str:
    
    # Strip trailing slash and whitespace, then split on /problems/
    cleaned = url.strip().rstrip("/")
    prefix = "https://leetcode.com/problems/"

    if not cleaned.startswith(prefix):
        raise ValueError(f"Not a valid LeetCode problems URL: {url!r}")

    slug_part = cleaned[len(prefix):]

    # Guard against sub-paths like /problems/two-sum/description
    slug = slug_part.split("/")[0].strip()

    if not slug:
        raise ValueError(f"Could not extract slug from URL: {url!r}")

    return slug


def get_leetcode_client() -> LeetCodeClient:
    return LeetCodeClient()
