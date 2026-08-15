import unittest
from unittest.mock import MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.features.problem_import.clients.codeforces import CodeforcesProblemData
from app.features.problem_import.normalizer import normalize_codeforces
from app.features.problem_import.repository import ProblemImportRepository, TopicRepository
from app.features.problem_import.router import import_problem
from app.features.problem_import.schemas import ProblemImportRequest
from app.features.problem_import.service import ProblemImportService
from app.features.problems.repository import ProblemRepository
from app.features.problems.resolver import ProblemResolverService
from app.features.user_problems.repository import UserProblemRepository
from app.features.user_problems.schemas import UserProblemTrackRequest
from app.features.user_problems.service import UserProblemService
from app.features.users.models import User
from app.shared.enums import ProblemStatus


class TestMultiPlatformAPIEndpoints(unittest.TestCase):

    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=self.engine)
        Session = sessionmaker(bind=self.engine)
        self.db = Session()

        # Create test user
        self.test_user = User(
            id=1,
            username="testuser",
            email="test@example.com",
            password_hash="fakehash",
        )
        self.db.add(self.test_user)
        self.db.commit()

        self.mock_cf_client = MagicMock()
        self.mock_lc_client = MagicMock()

        self.import_service = ProblemImportService(
            problem_repository=ProblemRepository(),
            topic_repository=TopicRepository(),
            problem_import_repository=ProblemImportRepository(),
            leetcode_client=self.mock_lc_client,
            codeforces_client=self.mock_cf_client,
        )

        self.resolver = ProblemResolverService(
            problem_repository=ProblemRepository(),
            problem_import_service=self.import_service,
        )

        self.user_problem_service = UserProblemService(
            repository=UserProblemRepository(),
            problem_repository=ProblemRepository(),
            problem_resolver=self.resolver,
        )

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=self.engine)

    def test_track_codeforces_via_user_problems_track(self):
        self.mock_cf_client.fetch_problem.return_value = CodeforcesProblemData(
            contest_id=4,
            problem_index="A",
            title="Watermelon",
            rating=800,
            tags=["math", "brute force"],
        )

        req = UserProblemTrackRequest(
            leetcode_url="https://codeforces.com/problemset/problem/4/A",
            status=ProblemStatus.SOLVED,
            language="Python",
            notes="Classic Watermelon problem",
            time_taken_minutes=5,
            favorite=True,
        )

        user_problem = self.user_problem_service.track_problem_by_url(
            self.db,
            user_id=self.test_user.id,
            request=req,
        )

        self.assertIsNotNone(user_problem)
        self.assertEqual(user_problem.problem.title, "Watermelon")
        self.assertEqual(user_problem.problem.platform, "Codeforces")
        self.assertEqual(user_problem.problem.external_id, "4A")
        self.assertEqual(user_problem.problem.platform_rating, 800)
        self.assertEqual(user_problem.status, ProblemStatus.SOLVED)
        self.assertEqual(len(user_problem.problem.topics), 2)

    def test_import_codeforces_via_generic_import_endpoint(self):
        self.mock_cf_client.fetch_problem.return_value = CodeforcesProblemData(
            contest_id=158,
            problem_index="B",
            title="Taxi",
            rating=1100,
            tags=["greedy", "special problem"],
        )

        req = ProblemImportRequest(
            problem_url="https://codeforces.com/problemset/problem/158/B",
            status=ProblemStatus.NOT_STARTED,
            language="C++",
        )

        resp = import_problem(
            request=req,
            db=self.db,
            current_user=self.test_user,
            resolver=self.resolver,
            user_problem_service=self.user_problem_service,
        )

        self.assertTrue(resp.success)
        self.assertEqual(resp.data.tracked.problem.title, "Taxi")
        self.assertEqual(resp.data.tracked.problem.platform, "Codeforces")
        self.assertEqual(resp.data.tracked.problem.external_id, "158B")
        self.assertEqual(resp.data.tracked.problem.platform_rating, 1100)


if __name__ == "__main__":
    unittest.main()
