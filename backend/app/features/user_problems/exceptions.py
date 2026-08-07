class UserProblemNotFound(Exception):
    """Raised when a tracked problem record is not found."""
    pass


class UserProblemAlreadyExists(Exception):
    """Raised when a user attempts to track a problem they are already tracking."""
    pass
