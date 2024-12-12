import sys
from pathlib import Path

from services.game_controller.managers import SESSION_MANAGER, USER_MANAGER, TOKEN_MANAGER, GAME_STATE_MANAGER
from shared.architecture.rest import AuthError
from shared.utility.names import generate_name

# Fix Path
_ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.append(str(_ROOT_DIR))


def impl_users_create(administrator_username: str, administrator_token: str):
    TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    session_id = USER_MANAGER.get_session_if_admin(administrator_username)
    username = generate_name(USER_MANAGER.has_user)
    SESSION_MANAGER.add_session_member(session_id, username)
    return {
        "username": username
    }

def impl_users_has_password(username: str):
    return {
        "hasPassword": USER_MANAGER.has_password(username)
    }

def impl_users_configure(administrator_username: str, administrator_token: str, target_username: str, assigned_role_id: str, assigned_buergerrat: int):
    TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    responsible_administrator_username = SESSION_MANAGER.get_responsible_administrator(target_username)
    if responsible_administrator_username != administrator_username:
        raise RuntimeError(f"The authenticated administrator: {administrator_username} is not responsible for the "
                           f"session of the target user: {target_username}.")
    USER_MANAGER.configure_user(target_username, assigned_role_id, assigned_buergerrat)
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


def impl_users_update_password(administrator_username: str, administrator_token: str, target_username: str, new_password_hash: str):
    TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    responsible_administrator_username = SESSION_MANAGER.get_responsible_administrator(target_username)
    if responsible_administrator_username != administrator_username:
        raise RuntimeError(f"The authenticated administrator: {administrator_username} is not responsible for the "
                           f"session of the target user: {target_username}.")
    USER_MANAGER.update_user_password(target_username, new_password_hash)
    return {}


def impl_sessions_create(product_key: str, administrator_password_hash: str):
    session_id = generate_name(SESSION_MANAGER.has_session)
    administrator_username = generate_name(USER_MANAGER.has_user)
    SESSION_MANAGER.add_session(session_id, product_key, administrator_username, administrator_password_hash)
    return {
        "sessionId": session_id,
        "administratorUsername": administrator_username
    }


def impl_sessions_exists(administrator_username: str, administrator_token: str):
    TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    session_id = USER_MANAGER.get_session_if_admin(administrator_username)
    return {
        "sessionExists": SESSION_MANAGER.has_session(session_id)
    }


def impl_sessions_view(administrator_username: str, administrator_token: str):
    TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    session_id = USER_MANAGER.get_session_if_admin(administrator_username)
    return {
        "sessionView": SESSION_MANAGER.view_session(session_id)
    }


def impl_sessions_get(administrator_username: str, administrator_token: str):
    TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    session_id = USER_MANAGER.get_session_if_admin(administrator_username)
    session = SESSION_MANAGER.get_session(session_id)
    if session["administratorUsername"] != administrator_username:
        raise AuthError()
    return {
        "session": session
    }


def impl_sessions_status(administrator_username: str, administrator_token: str, status: str):
    TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    session_id = USER_MANAGER.get_session_if_admin(administrator_username)
    session = SESSION_MANAGER.get_session(session_id)
    if session["administratorUsername"] != administrator_username:
        raise AuthError()
    SESSION_MANAGER.set_session_status(session_id, status)
    return {}


def impl_sessions_configure_prototype(configuration: str, administrator_username: str, administrator_token: str):
    TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    session_id = USER_MANAGER.get_session_if_admin(administrator_username)
    SESSION_MANAGER.configure_prototype(session_id, configuration)
    return {}


def impl_game_state_get(username: str, token: str):
    TOKEN_MANAGER.authenticate(username, token)
    session_id = USER_MANAGER.get_session(username)
    game_state_id = SESSION_MANAGER.get_game_state_id(session_id)
    return {
        "gameState": GAME_STATE_MANAGER.get_game_state(game_state_id)
    }


def impl_game_state_ready_to_transition(target_phase: str, administrator_username: str, administrator_token: str):
    TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    session_id = USER_MANAGER.get_session_if_admin(administrator_username)
    game_state_id = SESSION_MANAGER.get_game_state_id(session_id)
    return {
        "readyToTransition": GAME_STATE_MANAGER.ready_to_transition(game_state_id, target_phase)
    }


def impl_game_state_transition(target_phase: str, administrator_username: str, administrator_token: str):
    TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    session_id = USER_MANAGER.get_session_if_admin(administrator_username)
    game_state_id = SESSION_MANAGER.get_game_state_id(session_id)
    GAME_STATE_MANAGER.transition(game_state_id, target_phase)
    return {}


def impl_game_state_is_scenario_applicable(name: str, username: str, token: str):
    TOKEN_MANAGER.authenticate(username, token)
    session_id = USER_MANAGER.get_session(username)
    game_state_id = SESSION_MANAGER.get_game_state_id(session_id)
    return {
        "isScenarioApplicable": GAME_STATE_MANAGER.is_scenario_applicable(game_state_id, name)
    }


def impl_game_state_discussion_have_all_spoken(username: str, token: str):
    TOKEN_MANAGER.authenticate(username, token)
    session_id = USER_MANAGER.get_session(username)
    game_state_id = SESSION_MANAGER.get_game_state_id(session_id)
    return {
        "haveAllSpoken": GAME_STATE_MANAGER.discussion_have_all_spoken(game_state_id)
    }


def impl_game_state_discussion_next_speaker(administrator_username: str, administrator_token: str):
    TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    session_id = USER_MANAGER.get_session_if_admin(administrator_username)
    game_state_id = SESSION_MANAGER.get_game_state_id(session_id)
    GAME_STATE_MANAGER.discussion_next_speaker(game_state_id)
    return {}


def impl_game_state_discussion_ready_to_transition(target_phase: str, administrator_username: str, administrator_token: str):
    TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    session_id = USER_MANAGER.get_session_if_admin(administrator_username)
    game_state_id = SESSION_MANAGER.get_game_state_id(session_id)
    return {
        "readyToTransition": GAME_STATE_MANAGER.discussion_ready_to_transition(game_state_id, target_phase)
    }


def impl_game_state_discussion_transition(target_phase: str, administrator_username: str, administrator_token: str):
    TOKEN_MANAGER.authenticate(administrator_username, administrator_token)
    session_id = USER_MANAGER.get_session_if_admin(administrator_username)
    game_state_id = SESSION_MANAGER.get_game_state_id(session_id)
    GAME_STATE_MANAGER.discussion_transition(game_state_id, target_phase)
    return {}


def impl_game_state_discussion_has_voted(parameter: str, username: str, token: str):
    TOKEN_MANAGER.authenticate(username, token)
    return {
        "hasVoted": GAME_STATE_MANAGER.discussion_has_voted(username, parameter)
    }


def impl_game_state_discussion_vote(parameter: str, voted_value: float, username:str, token: str):
    TOKEN_MANAGER.authenticate(username, token)
    GAME_STATE_MANAGER.discussion_vote(username, parameter, voted_value)
    return {}
