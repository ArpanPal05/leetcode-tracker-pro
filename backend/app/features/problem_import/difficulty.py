from app.shared.enums import Difficulty


def map_codeforces_rating_to_difficulty(rating: int | None) -> Difficulty:
    """
    Centralized mapping of Codeforces numeric ratings to internal standard Difficulty.
    - rating <= 1200: EASY (Div. 2 A/B problems)
    - 1201 <= rating <= 1800: MEDIUM (Div. 2 C/D problems)
    - rating > 1800: HARD (Div. 1 / Div. 2 E+ problems)
    - None (unrated): MEDIUM
    """
    if rating is None:
        return Difficulty.MEDIUM

    if rating <= 1200:
        return Difficulty.EASY
    elif rating <= 1800:
        return Difficulty.MEDIUM
    else:
        return Difficulty.HARD
