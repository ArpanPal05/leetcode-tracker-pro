class AuthenticationException(Exception):
    """Base authentication exception."""


class InvalidCredentials(AuthenticationException):
    """Invalid email or password."""


class EmailAlreadyExists(AuthenticationException):
    """Email already exists."""