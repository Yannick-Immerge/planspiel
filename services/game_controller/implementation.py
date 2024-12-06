import sys
import uuid
from enum import Enum
from pathlib import Path
from typing import Any

from shared.architecture.rest import AuthError
from shared.utility.names import generate_name

# Fix Path
_ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.append(str(_ROOT_DIR))


class UserStatus(Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    DISABLED = "disabled"


class User:
    username: str
    status: UserStatus
    administrator: bool
    assigned_role_id: int | None
    password_hash: str

    def __init__(self, username: str, password_hash: str, administrator: bool = False):
        self.username = username
        self.status = UserStatus.OFFLINE
        self.administrator = administrator
        self.assigned_role_id = None
        self.password_hash = password_hash

    def view(self) -> Any:
        return {
            "username": self.username,
            "status": self.status.value,
            "assigned_role_id": self.assigned_role_id,
        }


class SessionStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

    @staticmethod
    def from_string(string: str):
        if string == "active":
            return SessionStatus.ACTIVE
        elif string == "active":
            return SessionStatus.ACTIVE
        else:
            raise ValueError(f"Unexpected session status: {string}.")


class Session:
    id: str
    administrator_username: str
    status: SessionStatus
    members_usernames: set[str]

    def __init__(self, id: str, administrator_username: str):
        self.id = id
        self.administrator_username = administrator_username
        self.status = SessionStatus.ACTIVE
        self.member_usernames = set()

    def complete(self) -> Any:
        return {
            "id": self.id,
            "administratorUsername": self.administrator_username,
            "status": self.status.value,
            "memberUsernames": list(self.members_usernames)
        }

    def view(self) -> Any:
        return {
            "id": self.id,
            "status": self.status.value
        }


_PRODUCT_KEYS = { "Sesam" }


class SessionManager:
    _sessions: dict[str, Session]
    _users: dict[str, User]

    def __init__(self):
        self._sessions = {}
        self._users = {}

    def create_session(self, product_key: str, administrator_password_hash) -> Session:
        if product_key not in _PRODUCT_KEYS:
            raise ValueError(f"The product key {product_key} is invalid.")

        administrator_username = generate_name(self._users)
        administrator = User(administrator_username, administrator_password_hash, True)
        self._users[administrator_username] = administrator

        session_id = generate_name(self._sessions)
        session = Session(session_id, administrator_username)
        self._sessions[session_id] = session
        return session

    def has_session(self, session_id: str) -> bool:
        return session_id in self._sessions

    def get_session(self, session_id: str) -> Session:
        if session_id not in self._sessions:
            raise ValueError(f"The session ID {session_id} is invalid.")
        return self._sessions[session_id]

    def create_user(self, session_id: str, password_hash: str) -> str:
        if session_id not in self._sessions:
            raise ValueError(f"The session ID {session_id} is invalid.")

        username = generate_name(self._users)
        user = User(username, password_hash)
        self._users[username] = user
        self._sessions[session_id].member_usernames.add(username)
        return username

    def has_user(self, username: str) -> bool:
        return username in self._users

    def get_user(self, username: str) -> User:
        if username not in self._users:
            raise ValueError(f"Unknown username: {username}.")
        return self._users[username]

    def update_user_password(self, username: str, old_password_hash: str, new_password_hash: str):
        if username not in self._users:
            raise ValueError(f"Unknown username: {username}.")
        user = self._users[username]
        if old_password_hash != user.password_hash:
            raise ValueError("Invalid old password.")
        user.password_hash = new_password_hash

    def matches_password(self, username: str, password_hash: str) -> bool:
        if username not in self._users:
            raise ValueError(f"Unknown username: {username}.")
        return self._users[username].password_hash == password_hash


_SESSION_MANAGER = SessionManager()


class TokenManager:
    _user_tokens: dict[str, str]

    def __init__(self):
        self._user_tokens = {}


    def login(self, username: str, password_hash: str) -> str:
        if username in self._user_tokens:
            self._user_tokens.pop(username)

        if not _SESSION_MANAGER.matches_password(username, password_hash):
            raise ValueError("Invalid Password.")

        token = str(uuid.uuid4())
        self._user_tokens[username] = token
        return token

    def logout(self, username: str):
        if username in self._user_tokens:
            self._user_tokens.pop(username)

    def authenticate(self, username: str, token: str):
        if username not in self._user_tokens or self._user_tokens[username] != token:
            raise AuthError()


_TOKEN_MANAGER = TokenManager()


def impl_users_create(session_id: str, password_hash: str):
    return {
        "username": _SESSION_MANAGER.create_user(session_id, password_hash)
    }


def impl_users_exists(username: str):
    return {
        "userExists": _SESSION_MANAGER.has_user(username)
    }


def impl_users_view(username: str):
    return {
        "userView": _SESSION_MANAGER.get_user(username).view()
    }


def impl_users_login(username: str, password_hash: str):
    token = _TOKEN_MANAGER.login(username, password_hash)
    return {
        "token": token,
        "administrator": _SESSION_MANAGER.get_user(username).administrator
    }


def impl_users_logout(username: str, token: str):
    _TOKEN_MANAGER.authenticate(username, token)
    _TOKEN_MANAGER.logout(username)
    return {}


def impl_users_update_password(username: str, token: str, old_password_hash: str, new_password_hash: str):
    _TOKEN_MANAGER.authenticate(username, token)
    _SESSION_MANAGER.update_user_password(username, old_password_hash, new_password_hash)
    return {}


def impl_sessions_create(product_key: str, administrator_password_hash: str):
    session = _SESSION_MANAGER.create_session(product_key, administrator_password_hash)
    return {
        "sessionId": session.id,
        "administratorUsername": session.administrator_username
    }


def impl_sessions_exists(session_id: str):
    return {
        "sessionExists": _SESSION_MANAGER.has_session(session_id)
    }


def impl_sessions_view(session_id: str):
    return {
        "sessionView": _SESSION_MANAGER.get_session(session_id).view()
    }


def impl_sessions_get(session_id: str, administrator_username: str, administrator_token: str):
    _TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    administrator = _SESSION_MANAGER.get_user(administrator_username)
    session = _SESSION_MANAGER.get_session(session_id)
    if not administrator or session.administrator_username != administrator_username:
        raise AuthError()
    return {
        "session": session.complete()
    }


def impl_sessions_status(session_id: str, administrator_username: str, administrator_token: str, status):
    _TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    administrator = _SESSION_MANAGER.get_user(administrator_username)
    session = _SESSION_MANAGER.get_session(session_id)
    if not administrator or session.administrator_username != administrator_username:
        raise AuthError()
    session.status = status
    return {}