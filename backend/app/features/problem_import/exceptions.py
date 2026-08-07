class InvalidLeetCodeURL(Exception):
    """Raised when the provided URL is not a valid LeetCode problem URL."""
    pass


class LeetCodeUnavailable(Exception):
    """Raised when LeetCode API cannot be reached or returns an unexpected response."""
    pass


class LeetCodeProblemNotFound(Exception):
    """Raised when LeetCode returns no problem data for the given slug."""
    pass
