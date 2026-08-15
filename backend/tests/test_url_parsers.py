import unittest

from app.features.problem_import.exceptions import (
    InvalidCodeforcesURL,
    InvalidLeetCodeURL,
)
from app.features.problem_import.parsers.codeforces import (
    extract_codeforces_identifier,
)
from app.features.problem_import.parsers.leetcode import (
    extract_slug_from_url,
)


class TestLeetCodeURLParser(unittest.TestCase):

    def test_valid_leetcode_url(self):
        url = "https://leetcode.com/problems/two-sum/"
        self.assertEqual(extract_slug_from_url(url), "two-sum")

    def test_valid_leetcode_url_without_trailing_slash(self):
        url = "https://leetcode.com/problems/3sum"
        self.assertEqual(extract_slug_from_url(url), "3sum")

    def test_valid_leetcode_url_with_subpath(self):
        url = "https://leetcode.com/problems/median-of-two-sorted-arrays/description/"
        self.assertEqual(extract_slug_from_url(url), "median-of-two-sorted-arrays")

    def test_invalid_leetcode_urls(self):
        invalid_urls = [
            "",
            "https://leetcode.com",
            "https://leetcode.com/problemset/all/",
            "https://google.com/problems/two-sum/",
            "not a url",
        ]
        for url in invalid_urls:
            with self.assertRaises(InvalidLeetCodeURL):
                extract_slug_from_url(url)


class TestCodeforcesURLParser(unittest.TestCase):

    def test_valid_problemset_url(self):
        url = "https://codeforces.com/problemset/problem/4/A"
        res = extract_codeforces_identifier(url)
        self.assertEqual(res.contest_id, 4)
        self.assertEqual(res.problem_index, "A")
        self.assertEqual(res.external_id, "4A")

    def test_valid_problemset_url_with_trailing_slash(self):
        url = "https://codeforces.com/problemset/problem/158/B/"
        res = extract_codeforces_identifier(url)
        self.assertEqual(res.contest_id, 158)
        self.assertEqual(res.problem_index, "B")
        self.assertEqual(res.external_id, "158B")

    def test_valid_contest_url(self):
        url = "https://codeforces.com/contest/1800/problem/E2"
        res = extract_codeforces_identifier(url)
        self.assertEqual(res.contest_id, 1800)
        self.assertEqual(res.problem_index, "E2")
        self.assertEqual(res.external_id, "1800E2")

    def test_invalid_codeforces_urls(self):
        invalid_urls = [
            "",
            "https://codeforces.com",
            "https://codeforces.com/problemset",
            "https://codeforces.com/problemset/problem",
            "https://codeforces.com/problemset/problem/notanumber/A",
            "https://codeforces.com/contest/4",
            "https://google.com",
        ]
        for url in invalid_urls:
            with self.assertRaises(InvalidCodeforcesURL):
                extract_codeforces_identifier(url)


if __name__ == "__main__":
    unittest.main()
