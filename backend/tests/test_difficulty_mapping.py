import unittest

from app.features.problem_import.difficulty import map_codeforces_rating_to_difficulty
from app.shared.enums import Difficulty


class TestDifficultyMapping(unittest.TestCase):

    def test_difficulty_mapping(self):
        self.assertEqual(map_codeforces_rating_to_difficulty(800), Difficulty.EASY)
        self.assertEqual(map_codeforces_rating_to_difficulty(1000), Difficulty.EASY)
        self.assertEqual(map_codeforces_rating_to_difficulty(1200), Difficulty.EASY)

        self.assertEqual(map_codeforces_rating_to_difficulty(1300), Difficulty.MEDIUM)
        self.assertEqual(map_codeforces_rating_to_difficulty(1500), Difficulty.MEDIUM)
        self.assertEqual(map_codeforces_rating_to_difficulty(1800), Difficulty.MEDIUM)

        self.assertEqual(map_codeforces_rating_to_difficulty(1900), Difficulty.HARD)
        self.assertEqual(map_codeforces_rating_to_difficulty(2400), Difficulty.HARD)
        self.assertEqual(map_codeforces_rating_to_difficulty(3500), Difficulty.HARD)

        self.assertEqual(map_codeforces_rating_to_difficulty(None), Difficulty.MEDIUM)


if __name__ == "__main__":
    unittest.main()
