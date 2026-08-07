from enum import Enum


class Difficulty(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


class ProblemStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    ATTEMPTING = "ATTEMPTING"
    SOLVED = "SOLVED"
    NEEDS_REVISION = "NEEDS_REVISION"
    MASTERED = "MASTERED"
