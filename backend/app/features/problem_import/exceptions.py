class InvalidProblemURL(Exception):
    """Raised when the provided problem URL is invalid or malformed."""
    pass


class UnsupportedPlatform(Exception):
    """Raised when the URL belongs to an unsupported coding platform."""
    pass


class InvalidLeetCodeURL(InvalidProblemURL):
    """Raised when the provided URL is not a valid LeetCode problem URL."""
    pass


class LeetCodeUnavailable(Exception):
    """Raised when LeetCode API cannot be reached or returns an unexpected response."""
    pass


class LeetCodeProblemNotFound(Exception):
    """Raised when LeetCode returns no problem data for the given slug."""
    pass


class InvalidCodeforcesURL(InvalidProblemURL):
    """Raised when the provided URL is not a valid Codeforces problem URL."""
    pass


class CodeforcesUnavailable(Exception):
    """Raised when Codeforces API cannot be reached or returns an unexpected response."""
    pass


class CodeforcesProblemNotFound(Exception):
    """Raised when Codeforces returns no problem data for the given contest and index."""
    pass
