import unittest
from unittest.mock import patch

from app.features.problem_import.clients.codeforces import CodeforcesClient
from app.features.problem_import.exceptions import (
    CodeforcesProblemNotFound,
)

MOCK_PROBLEMSET_RESPONSE = {
    "status": "OK",
    "result": {
        "problems": [
            {
                "contestId": 4,
                "index": "A",
                "name": "Watermelon",
                "type": "PROGRAMMING",
                "rating": 800,
                "tags": ["brute force", "math"]
            },
            {
                "contestId": 158,
                "index": "B",
                "name": "Taxi",
                "type": "PROGRAMMING",
                "rating": 1100,
                "tags": ["greedy", "special problem"]
            }
        ]
    }
}


class TestCodeforcesClient(unittest.TestCase):

    def test_fetch_problem_success(self):
        client = CodeforcesClient()
        with patch.object(client, "_fetch_problemset_list", return_value=MOCK_PROBLEMSET_RESPONSE["result"]["problems"]):
            problem_data = client.fetch_problem(contest_id=4, problem_index="A")

            self.assertEqual(problem_data.contest_id, 4)
            self.assertEqual(problem_data.problem_index, "A")
            self.assertEqual(problem_data.title, "Watermelon")
            self.assertEqual(problem_data.rating, 800)
            self.assertIn("math", problem_data.tags)

    def test_fetch_problem_case_insensitive(self):
        client = CodeforcesClient()
        with patch.object(client, "_fetch_problemset_list", return_value=MOCK_PROBLEMSET_RESPONSE["result"]["problems"]):
            problem_data = client.fetch_problem(contest_id=4, problem_index="a")
            self.assertEqual(problem_data.problem_index, "A")
            self.assertEqual(problem_data.title, "Watermelon")

    def test_fetch_problem_not_found(self):
        client = CodeforcesClient()
        with patch.object(client, "_fetch_problemset_list", return_value=MOCK_PROBLEMSET_RESPONSE["result"]["problems"]):
            with self.assertRaises(CodeforcesProblemNotFound):
                client.fetch_problem(contest_id=99999, problem_index="Z")


if __name__ == "__main__":
    unittest.main()
