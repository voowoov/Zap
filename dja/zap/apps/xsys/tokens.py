import logging
import os
from datetime import datetime

from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.crypto import constant_time_compare, salted_hmac
from django.utils.http import base36_to_int, int_to_base36

logger = logging.getLogger(__name__)


class TokenGenerator:
    secret = os.getenv("DJANGO_TOKEN_SECRET")
    key_salt = os.getenv("DJANGO_TOKEN_SALT")

    def __init__(self, timeout_seconds):
        self.timeout_seconds = timeout_seconds

    def make_token(self, email):
        return self._make_token_with_timestamp(email, self._current_timestamp())

    def check_token(self, email, token):
        if not (email and token):
            return False
        # Parse the token
        try:
            ts_b36, _ = token.split("-")
        except Exception as e:
            logger.error(f"error: TokenGenerator, check_token: {e}")
            return False

        try:
            ts = base36_to_int(ts_b36)
        except Exception as e:
            logger.error(f"error: TokenGenerator, check_token: {e}")
            return False

        # Check that the timestamp/uid has not been tampered with
        if not constant_time_compare(self._make_token_with_timestamp(email, ts), token):
            return False

        # Check the timestamp is within limit.
        if (self._current_timestamp() - ts) > self.timeout_seconds:
            return False

        return True

    def _make_token_with_timestamp(self, email, timestamp):
        # timestamp is number of seconds since 2001-1-1. Converted to base 36,
        # this gives us a 6 digit string until about 2069.
        ts_b36 = int_to_base36(timestamp)
        hash_string = salted_hmac(
            self.key_salt,
            self._make_hash_value(email, timestamp),
            secret=self.secret,
            algorithm="sha256",
        ).hexdigest()[
            ::2
        ]  # Limit to shorten the URL.
        return "%s-%s" % (ts_b36, hash_string)

    def _make_hash_value(self, email, timestamp):
        return f"{timestamp}{email}"

    def _current_timestamp(self):
        return int(datetime.now().timestamp())


user_token_generator = TokenGenerator(settings.PASSWORD_RESET_TIMEOUT)


class UserPasswordResetTokenGenerator(PasswordResetTokenGenerator):
    key_salt = "3bae9ba4208e83ec928ab37d56e795ed"
    _secret = "password reset 23fasdg5s"
    # the hash has the user password in it so when the password changes, the token becomes invalid.


password_reset_token = UserPasswordResetTokenGenerator()
