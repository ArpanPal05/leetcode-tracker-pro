from enum import Enum


class Difficulty(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


class ProblemStatus(str, Enum):
    NOT_STARTED = "Not Started"
    ATTEMPTED = "Attempted"
    SOLVED = "Solved"