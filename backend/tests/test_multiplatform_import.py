import unittest
from unittest.mock import MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.features.problem_import.associations import problem_topics  # noqa: F401
from app.features.problem_import.client import LeetCodeProblemData, TopicTag
from app.features.problem_import.clients.codechef import CodeChefProblemData
from app.features.problem_import.clients.codeforces import CodeforcesProblemData
from app.features.problem_import.models import Topic  # noqa: F401
from app.features.problem_import.repository import ProblemImportRepository, TopicRepository
from app.features.problem_import.service import ProblemImportService
from app.features.problems.models import Problem
from app.features.problems.repository import ProblemRepository
from app.features.problems.resolver import ProblemResolverService
from app.features.user_problems.models import UserProblem  # noqa: F401
from app.features.users.models import User  # noqa: F401
from app.shared.enums import Difficulty, Platform


class TestMultiPlatformImport(unittest.TestCase):

    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=self.engine)
        Session = sessionmaker(bind=self.engine)
        self.db = Session()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=self.engine)

    def test_import_codechef_problem_success(self):
        mock_cc_client = MagicMock()
        mock_cc_client.fetch_problem.return_value = CodeChefProblemData(
            external_id="START01",
            title="Number Mirror",
            source_url="https://www.codechef.com/problems/START01",
            rating=None,
            tags=[],
        )

        mock_lc_client = MagicMock()
        mock_cf_client = MagicMock()

        import_service = ProblemImportService(
            problem_repository=ProblemRepository(),
            topic_repository=TopicRepository(),
            problem_import_repository=ProblemImportRepository(),
            leetcode_client=mock_lc_client,
            codeforces_client=mock_cf_client,
            codechef_client=mock_cc_client,
        )

        resolver = ProblemResolverService(
            problem_repository=ProblemRepository(),
            problem_import_service=import_service,
        )

        # 1. Resolve first time (imports from CodeChef)
        url = "https://www.codechef.com/problems/START01"
        problem = resolver.resolve_problem(self.db, url)

        self.assertIsNotNone(problem)
        self.assertEqual(problem.platform, Platform.CODECHEF)
        self.assertEqual(problem.external_id, "START01")
        self.assertEqual(problem.title, "Number Mirror")
        self.assertEqual(problem.difficulty, Difficulty.MEDIUM)
        self.assertIsNone(problem.platform_rating)
        mock_cc_client.fetch_problem.assert_called_once_with("START01")

        # 2. Resolve second time (cache hit, client must NOT be called)
        mock_cc_client.fetch_problem.reset_mock()
        second_problem = resolver.resolve_problem(self.db, url)
        self.assertEqual(second_problem.id, problem.id)
        mock_cc_client.fetch_problem.assert_not_called()

    def test_import_codeforces_problem_success(self):
        mock_cf_client = MagicMock()
        mock_cf_client.fetch_problem.return_value = CodeforcesProblemData(
            contest_id=4,
            problem_index="A",
            title="Watermelon",
            rating=800,
            tags=["brute force", "math"],
        )

        mock_lc_client = MagicMock()
        mock_cc_client = MagicMock()

        import_service = ProblemImportService(
            problem_repository=ProblemRepository(),
            topic_repository=TopicRepository(),
            problem_import_repository=ProblemImportRepository(),
            leetcode_client=mock_lc_client,
            codeforces_client=mock_cf_client,
            codechef_client=mock_cc_client,
        )

        resolver = ProblemResolverService(
            problem_repository=ProblemRepository(),
            problem_import_service=import_service,
        )

        # 1. Resolve first time (imports from Codeforces)
        url = "https://codeforces.com/problemset/problem/4/A"
        problem = resolver.resolve_problem(self.db, url)

        self.assertIsNotNone(problem)
        self.assertEqual(problem.platform, Platform.CODEFORCES)
        self.assertEqual(problem.external_id, "4A")
        self.assertEqual(problem.title, "Watermelon")
        self.assertEqual(problem.difficulty, Difficulty.EASY)
        self.assertEqual(problem.platform_rating, 800)
        self.assertEqual(len(problem.topics), 2)
        mock_cf_client.fetch_problem.assert_called_once_with(4, "A")

        # 2. Resolve second time (should reuse existing problem, NOT call client again)
        mock_cf_client.fetch_problem.reset_mock()
        second_problem = resolver.resolve_problem(self.db, url)
        self.assertEqual(second_problem.id, problem.id)
        mock_cf_client.fetch_problem.assert_not_called()

    def test_import_leetcode_problem_regression(self):
        mock_lc_client = MagicMock()
        mock_lc_client.fetch_problem.return_value = LeetCodeProblemData(
            frontend_question_id="1",
            title="Two Sum",
            slug="two-sum",
            difficulty="Easy",
            is_premium=False,
            acceptance_rate=50.2,
            topic_tags=[TopicTag(name="Array", slug="array"), TopicTag(name="Hash Table", slug="hash-table")],
        )

        mock_cf_client = MagicMock()
        mock_cc_client = MagicMock()

        import_service = ProblemImportService(
            problem_repository=ProblemRepository(),
            topic_repository=TopicRepository(),
            problem_import_repository=ProblemImportRepository(),
            leetcode_client=mock_lc_client,
            codeforces_client=mock_cf_client,
            codechef_client=mock_cc_client,
        )

        resolver = ProblemResolverService(
            problem_repository=ProblemRepository(),
            problem_import_service=import_service,
        )

        # 1. Resolve first time
        url = "https://leetcode.com/problems/two-sum/"
        problem = resolver.resolve_problem(self.db, url)

        self.assertIsNotNone(problem)
        self.assertEqual(problem.platform, Platform.LEETCODE)
        self.assertEqual(problem.external_id, "1")
        self.assertEqual(problem.slug, "two-sum")
        self.assertEqual(problem.title, "Two Sum")
        self.assertEqual(problem.difficulty, Difficulty.EASY)
        self.assertEqual(len(problem.topics), 2)
        mock_lc_client.fetch_problem.assert_called_once_with("two-sum")

        # 2. Resolve second time (cache hit)
        mock_lc_client.fetch_problem.reset_mock()
        second_problem = resolver.resolve_problem(self.db, url)
        self.assertEqual(second_problem.id, problem.id)
        mock_lc_client.fetch_problem.assert_not_called()


if __name__ == "__main__":
    unittest.main()

