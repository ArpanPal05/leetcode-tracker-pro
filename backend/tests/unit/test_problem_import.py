import pytest
from unittest.mock import MagicMock
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.features.problem_import.clients.codechef import CodeChefProblemData
from app.features.problem_import.clients.codeforces import CodeforcesProblemData
from app.features.problem_import.difficulty import (
    map_codeforces_rating_to_difficulty,
    map_codechef_rating_to_difficulty,
)
from app.features.problem_import.exceptions import (
    InvalidProblemURL,
    InvalidLeetCodeURL,
    InvalidCodeforcesURL,
    InvalidCodeChefURL,
    UnsupportedPlatform,
)
from app.features.problem_import.parsers.codechef import extract_codechef_problem_code
from app.features.problem_import.parsers.codeforces import extract_codeforces_identifier
from app.features.problem_import.parsers.detector import detect_platform
from app.features.problem_import.parsers.leetcode import extract_slug_from_url
from app.features.problem_import.repository import ProblemImportRepository, TopicRepository
from app.features.problem_import.service import ProblemImportService
from app.features.problem_import.models import Topic
from app.features.problems.models import Problem
from app.features.problems.repository import ProblemRepository
from app.features.problems.resolver import ProblemResolverService
from app.shared.enums import Difficulty, Platform


@pytest.fixture
def db():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def test_leetcode_url_parser_valid():
    url = "https://leetcode.com/problems/two-sum/description/"
    assert extract_slug_from_url(url) == "two-sum"


def test_leetcode_url_parser_invalid():
    url = "https://leetcode.com/discuss/general-discussion"
    with pytest.raises(InvalidLeetCodeURL):
        extract_slug_from_url(url)


def test_codeforces_url_parser_valid():
    url = "https://codeforces.com/problemset/problem/123/A"
    identifier = extract_codeforces_identifier(url)
    assert identifier.contest_id == 123
    assert identifier.problem_index == "A"
    assert identifier.external_id == "123A"


def test_codeforces_url_parser_invalid():
    url = "https://codeforces.com/blog/entry/123"
    with pytest.raises(InvalidCodeforcesURL):
        extract_codeforces_identifier(url)


def test_codechef_url_parser_valid():
    url = "https://www.codechef.com/problems/FLOW001"
    assert extract_codechef_problem_code(url) == "FLOW001"


def test_platform_detector():
    assert detect_platform("https://leetcode.com/problems/two-sum/") == Platform.LEETCODE
    assert detect_platform("https://codeforces.com/problemset/problem/1/A") == Platform.CODEFORCES
    assert detect_platform("https://www.codechef.com/problems/FLOW001") == Platform.CODECHEF

    with pytest.raises(UnsupportedPlatform):
        detect_platform("https://hackerrank.com/challenges/solve-me-first")


def test_difficulty_normalizer():
    assert map_codeforces_rating_to_difficulty(800) == Difficulty.EASY
    assert map_codeforces_rating_to_difficulty(1500) == Difficulty.MEDIUM
    assert map_codeforces_rating_to_difficulty(2100) == Difficulty.HARD
    assert map_codeforces_rating_to_difficulty(None) == Difficulty.MEDIUM

    assert map_codechef_rating_to_difficulty(1000) == Difficulty.EASY
    assert map_codechef_rating_to_difficulty(1600) == Difficulty.MEDIUM
    assert map_codechef_rating_to_difficulty(2000) == Difficulty.HARD
    assert map_codechef_rating_to_difficulty(None) == Difficulty.MEDIUM


def test_problem_import_service_existing_problem_returns_existing(db):
    problem_repo = ProblemRepository()
    topic_repo = TopicRepository()
    import_repo = ProblemImportRepository()

    existing_prob = Problem(
        title="Two Sum",
        slug="two-sum",
        platform=Platform.LEETCODE,
        external_id="two-sum",
        difficulty=Difficulty.EASY,
    )
    db.add(existing_prob)
    db.commit()

    service = ProblemImportService(
        problem_repository=problem_repo,
        topic_repository=topic_repo,
        problem_import_repository=import_repo,
    )

    resolver = ProblemResolverService(
        problem_repository=problem_repo,
        problem_import_service=service,
    )

    imported = resolver.resolve_problem(
        db, "https://leetcode.com/problems/two-sum/"
    )
    assert imported.id == existing_prob.id
    assert imported.title == "Two Sum"


def test_problem_import_service_new_codeforces_problem(db):
    problem_repo = ProblemRepository()
    topic_repo = TopicRepository()
    import_repo = ProblemImportRepository()

    mock_cf = MagicMock()
    mock_cf.fetch_problem.return_value = CodeforcesProblemData(
        contest_id=1,
        problem_index="A",
        title="Theatre Square",
        rating=1000,
        tags=["math", "geometry"],
    )

    service = ProblemImportService(
        problem_repository=problem_repo,
        topic_repository=topic_repo,
        problem_import_repository=import_repo,
        codeforces_client=mock_cf,
    )

    resolver = ProblemResolverService(
        problem_repository=problem_repo,
        problem_import_service=service,
    )

    imported = resolver.resolve_problem(
        db, "https://codeforces.com/problemset/problem/1/A"
    )

    assert imported.id is not None
    assert imported.title == "Theatre Square"
    assert imported.platform == Platform.CODEFORCES
    assert imported.external_id == "1A"
    assert len(imported.topics) == 2


def test_problem_import_service_topic_creation_and_reuse(db):
    problem_repo = ProblemRepository()
    topic_repo = TopicRepository()
    import_repo = ProblemImportRepository()

    existing_topic = Topic(name="Math", slug="math")
    db.add(existing_topic)
    db.commit()

    mock_cf = MagicMock()
    mock_cf.fetch_problem.return_value = CodeforcesProblemData(
        contest_id=2,
        problem_index="B",
        title="Winner",
        rating=1200,
        tags=["math", "implementation"],
    )

    service = ProblemImportService(
        problem_repository=problem_repo,
        topic_repository=topic_repo,
        problem_import_repository=import_repo,
        codeforces_client=mock_cf,
    )

    resolver = ProblemResolverService(
        problem_repository=problem_repo,
        problem_import_service=service,
    )

    imported = resolver.resolve_problem(
        db, "https://codeforces.com/problemset/problem/2/B"
    )

    all_topics = db.query(Topic).all()
    assert len(all_topics) == 2
    assert any(t.id == existing_topic.id for t in imported.topics)
