import unittest

from app.features.problem_import.exceptions import (
    InvalidProblemURL,
    UnsupportedPlatform,
)
from app.features.problem_import.parsers.detector import detect_platform
from app.shared.enums import Platform


class TestPlatformDetector(unittest.TestCase):

    def test_detect_leetcode(self):
        self.assertEqual(detect_platform("https://leetcode.com/problems/two-sum/"), Platform.LEETCODE)
        self.assertEqual(detect_platform("http://www.leetcode.com/problems/reverse-integer"), Platform.LEETCODE)

    def test_detect_codeforces(self):
        self.assertEqual(detect_platform("https://codeforces.com/problemset/problem/4/A"), Platform.CODEFORCES)
        self.assertEqual(detect_platform("http://www.codeforces.com/contest/1800/problem/D"), Platform.CODEFORCES)

    def test_detect_codechef(self):
        self.assertEqual(detect_platform("https://www.codechef.com/problems/START01"), Platform.CODECHEF)
        self.assertEqual(detect_platform("http://codechef.com/problems/FLOW001/"), Platform.CODECHEF)

    def test_detect_unsupported_platform(self):
        unsupported_urls = [
            "https://hackerrank.com/challenges/simple-array-sum",
            "https://geeksforgeeks.org/problems/two-sum",
            "https://google.com",
        ]
        for url in unsupported_urls:
            with self.assertRaises(UnsupportedPlatform):
                detect_platform(url)

    def test_detect_invalid_url(self):
        with self.assertRaises(InvalidProblemURL):
            detect_platform("")


if __name__ == "__main__":
    unittest.main()
