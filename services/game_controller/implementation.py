import sys
from pathlib import Path

from services.game_controller.managers import SESSION_MANAGER, USER_MANAGER, TOKEN_MANAGER
from shared.architecture.rest import AuthError
from shared.utility.names import generate_name

# Fix Path
_ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.append(str(_ROOT_DIR))


def impl_users_create(session_id: str, password_hash: str):
    username = generate_name(USER_MANAGER.has_user)
    SESSION_MANAGER.add_session_member(session_id, username, password_hash)
    return {
        "username": username
    }

def impl_users_configure(username: str, assigned_role_id: str, assigned_buergerrat: int):
    USER_MANAGER.configure_user(username, assigned_role_id, assigned_buergerrat)
    return {}


def impl_users_exists(username: str):
    return {
        "userExists": USER_MANAGER.has_user(username)
    }


def impl_users_view(username: str):
    return {
        "userView": USER_MANAGER.view_user(username, TOKEN_MANAGER.get_user_status(username))
    }


def impl_users_login(username: str, password_hash: str):
    token = TOKEN_MANAGER.login(username, password_hash)
    return {
        "token": token,
        "administrator": USER_MANAGER.is_user_admin(username)
    }


def impl_users_logout(username: str, token: str):
    TOKEN_MANAGER.authenticate(username, token)
    TOKEN_MANAGER.logout(username)
    return {}


def impl_users_update_password(username: str, token: str, old_password_hash: str, new_password_hash: str):
    TOKEN_MANAGER.authenticate(username, token)
    if not USER_MANAGER.verify_user_password(username, old_password_hash):
        raise ValueError("The password is wrong.")
    USER_MANAGER.update_user_password(username, new_password_hash)
    return {}


def impl_sessions_create(product_key: str, administrator_password_hash: str):
    session_id = generate_name(SESSION_MANAGER.has_session)
    administrator_username = generate_name(USER_MANAGER.has_user)
    SESSION_MANAGER.add_session(session_id, product_key, administrator_username, administrator_password_hash)
    return {
        "sessionId": session_id,
        "administratorUsername": administrator_username
    }


def impl_sessions_exists(session_id: str):
    return {
        "sessionExists": SESSION_MANAGER.has_session(session_id)
    }


def impl_sessions_view(session_id: str):
    return {
        "sessionView": SESSION_MANAGER.view_session(session_id)
    }


def impl_sessions_get(session_id: str, administrator_username: str, administrator_token: str):
    TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    session = SESSION_MANAGER.get_session(session_id)
    if session["administratorUsername"] != administrator_username:
        raise AuthError()
    return {
        "session": session
    }


def impl_sessions_status(session_id: str, administrator_username: str, administrator_token: str, status: str):
    TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    session = SESSION_MANAGER.get_session(session_id)
    if session["administratorUsername"] != administrator_username:
        raise AuthError()
    SESSION_MANAGER.set_session_status(session_id, status)
    return {}