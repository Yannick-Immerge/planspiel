"""
Database queries for the game controller.
"""
import uuid
from enum import Enum

from shared.architecture.rest import AuthError
from shared.data_model.context import initialize_db_context_default, execute_query, PostQuery, \
    execute_post_query, get_last_row_id


def _dbs(v: str | None):
    if v is None:
        return "NULL"
    else:
        return f"\"{v}\""

def _dbi(v: int | None):
    if v is None:
        return "NULL"
    else:
        return f"{v}"


class UserStatus(Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    DISABLED = "disabled"


class GamePhase(Enum):
    CONFIGURING = "configuring"
    IDENTIFICATION_1 = "identification1"
    DISCUSSION_1 = "discussion1"
    IDENTIFICATION_2 = "identification2"
    DISCUSSION_2 = "discussion2"
    DEBRIEFING = "debriefing"


class UserManager:

    def has_user(self, username: str) -> bool:
        query = f"SELECT COUNT(*) FROM User WHERE username = {_dbs(username)};"
        n = execute_query(query)[0][0]
        return n > 0

    def has_password(self, username: str) -> bool:
        if not self.has_user(username):
            raise NameError(f"There is no user with username: {username}.")
        query = f"SELECT COUNT(*) FROM User WHERE username = {_dbs(username)} AND password_hash IS NOT NULL"
        n = execute_query(query)[0][0]
        return n > 0

    def is_user_admin(self, username: str) -> bool:
        query = (f"SELECT COUNT(*) FROM User INNER JOIN Session "
                 f"ON User.member_of = Session.session_id AND User.username = Session.administrator "
                 f"WHERE User.username = {_dbs(username)};")
        n = execute_query(query)[0][0]
        return n > 0

    def is_user_configured(self, username: str) -> bool:
        if self.is_user_admin(username):
            return False
        query = f"SELECT COUNT(*) FROM User WHERE username = {_dbs(username)} AND plays_as IS NOT NULL;"
        n = execute_query(query)[0][0]
        return n > 0

    def add_user(self, username: str, password_hash: str | None, member_of: str):
        if self.has_user(username):
            raise NameError(f"A user with given username: {username} already exists.")
        query = (f"INSERT INTO User(username, password_hash, member_of) "
                 f"VALUES ({_dbs(username)}, {_dbs(password_hash)}, {_dbs(member_of)});")
        execute_post_query(PostQuery(query, ()))

    def verify_or_create_user_password(self, username: str, password_hash: str) -> bool:
        if not self.has_user(username):
            raise NameError(f"No user with username: {username}")
        if self.has_password(username):
            query = f"SELECT COUNT(*) FROM User WHERE username = {_dbs(username)} AND password_hash = {_dbs(password_hash)};"
            n = execute_query(query)[0][0]
            return n > 0
        else:
            self.update_user_password(username, password_hash)
            return True

    def configure_user(self, username: str, plays_as: str, buergerrat: int):
        if not self.has_user(username):
            raise NameError(f"No user with username: {username}")
        if self.is_user_admin(username):
            raise RuntimeError(f"Cannot configure administrator: {username}: Only members can be assigned a role.")
        if self.is_user_configured(username):
            raise RuntimeError(f"Cannot configure user: {username}: Already assigned a role.")
        if buergerrat != 1 and buergerrat != 2:
            raise ValueError("Buergerrat must be 1 or 2.")
        query = f"UPDATE User SET plays_as = {_dbs(plays_as)}, buergerrat = {_dbi(buergerrat)} WHERE username = {_dbs(username)};"
        execute_post_query(PostQuery(query, ()))

    def update_user_password(self, username: str, password_hash: str):
        if not self.has_user(username):
            raise NameError(f"Unknown username: {username}.")
        query = f"UPDATE User SET password_hash = {_dbs(password_hash)} WHERE username = {_dbs(username)};"
        execute_post_query(PostQuery(query, ()))

    def view_user(self, username: str, status: UserStatus) -> dict:
        if not self.has_user(username):
            raise NameError(f"No user with username: {username}")
        query = f"SELECT plays_as, buergerrat FROM User WHERE username = {_dbs(username)};"
        assigned_role_id, assigned_buergerrat = execute_query(query)[0]
        return {
            "username": username,
            "status": status.value,
            "assignedRoleId": assigned_role_id,
            "assignedBuergerrat": assigned_buergerrat,
            "administrator": self.is_user_admin(username)
        }

    def get_session_if_admin(self, username: str) -> str:
        if not self.has_user(username):
            raise NameError(f"No user with username: {username}")
        if not self.is_user_admin(username):
            raise RuntimeError(f"User {username} is not the administrator of this session.")
        query = f"SELECT member_of FROM User WHERE username = {_dbs(username)};"
        return execute_query(query)[0][0]



USER_MANAGER: UserManager = UserManager()


class GameStateManager:
    def has_game_state(self, game_state_id: int) -> bool:
        query = f"SELECT COUNT(*) FROM GameState WHERE id = {_dbi(game_state_id)};"
        n = execute_query(query)[0][0]
        return n > 0

    def add_game_state(self) -> int:
        query = f"INSERT INTO GameState(phase) VALUES ({_dbs(GamePhase.CONFIGURING.value)});"
        execute_post_query(PostQuery(query, ()))
        return get_last_row_id()

    def get_controlled_parameters(self, game_state_id: int, buergerrat: int) -> list:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = (f"SELECT parameter FROM controls "
                 f"WHERE game_state = {_dbi(game_state_id)} AND buergerrat = {_dbi(buergerrat)};")
        return [row[0] for row in execute_query(query)]

    def get_buergerraete(self, game_state_id: int) -> tuple[dict, dict]:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")

        return ({
            "index": 1,
            "parameters": self.get_controlled_parameters(game_state_id, 1),
            "configuration1": None,
            "configuration2": None
        }, {
            "index": 2,
            "parameters": self.get_controlled_parameters(game_state_id, 2),
            "configuration1": None,
            "configuration2": None
        })


    def get_game_state(self, game_state_id: int):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT phase FROM GameState WHERE id = {_dbi(game_state_id)};"
        phase = execute_query(query)[0][0]
        buergerrat1, buergerrat2 = self.get_buergerraete(game_state_id)
        return {
            "id": game_state_id,
            "buergerrat1": buergerrat1,
            "buergerrat2": buergerrat2,
            "phase": phase
        }

    def are_users_configured(self, game_state_id: int) -> bool:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT session_id FROM Session WHERE game_state = {_dbi(game_state_id)};"
        session_id = execute_query(query)[0][0]
        query = (f"SELECT COUNT(*) "
                 f"FROM User INNER JOIN Session ON User.member_of = Session.session_id "
                 f"WHERE Session.session_id = {_dbs(session_id)} AND User.plays_as IS NULL AND User.username != Session.administrator;")
        n = execute_query(query)[0][0]
        return n == 0

    def are_buergerraete_configured(self, game_state_id: int) -> bool:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        params1 = self.get_controlled_parameters(game_state_id, 1)
        params2 = self.get_controlled_parameters(game_state_id, 2)
        return len(params1) > 0 and len(params2) > 0

    def ready_to_transition(self, game_state_id: int, target_phase: str):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT phase FROM GameState WHERE id = {_dbi(game_state_id)};"
        phase = execute_query(query)[0][0]
        if phase == GamePhase.CONFIGURING.value:
            if target_phase != GamePhase.IDENTIFICATION_1.value:
                return False
            return self.are_users_configured(game_state_id) and self.are_buergerraete_configured(game_state_id)
        else:
            raise NotImplementedError("Other phase transitions not yet implemented.")

    def transition(self, game_state_id: int, target_phase: str):
        if not self.ready_to_transition(game_state_id, target_phase):
            raise RuntimeError("Not yet ready to transition (Are all users configured?).")
        query = f"SELECT phase FROM GameState WHERE id = {_dbi(game_state_id)};"
        phase = execute_query(query)[0][0]
        if phase == GamePhase.CONFIGURING.value and target_phase == GamePhase.IDENTIFICATION_1.value:
            query = f"UPDATE GameState SET phase = {_dbs(target_phase)} WHERE id = {_dbi(game_state_id)};"
            execute_post_query(PostQuery(query, ()))
        else:
            raise NotImplementedError("Other phase transitions not yet implemented.")

    def add_parameter_to_buergerrat(self, game_state_id: int, buergerrat: int, parameter: str):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        if buergerrat != 1 and buergerrat != 2:
            raise ValueError("Buergerrat must be 1 or 2.")
        query = (f"INSERT INTO controls(game_state, parameter, buergerrat) VALUES "
                 f"({_dbi(game_state_id)}, {_dbi(buergerrat)}, {_dbs(parameter)});")
        execute_post_query(PostQuery(query, ()))


GAME_STATE_MANAGER: GameStateManager = GameStateManager()


class SessionManager:
    def has_product_key(self, key_value: str) -> bool:
        query = f"SELECT COUNT(*) FROM ProductKey WHERE key_value = {_dbs(key_value)};"
        n = execute_query(query)[0][0]
        return n > 0

    def get_number_of_sessions_with_product_key(self, key_value: str) -> int:
        query = f"SELECT COUNT(*) FROM Session WHERE product_key = {_dbs(key_value)};"
        return execute_query(query)[0][0]

    def is_product_key_valid_for_new_session(self, key_value: str) -> bool:
        if not self.has_product_key(key_value):
            raise ValueError(f"Unknown product key: {key_value}.")
        query = f"SELECT num_sessions, expires FROM ProductKey WHERE key_value = {_dbs(key_value)};"
        num_sessions, expires = execute_query(query)[0]
        used_sessions = self.get_number_of_sessions_with_product_key(key_value)
        # TODO: Expiration check
        return used_sessions < num_sessions

    def add_product_key(self, key_value: str, num_sessions: int):
        if self.has_product_key(key_value):
            raise ValueError(f"The product key {key_value} has already been registered.")
        query = (f"INSERT INTO ProductKey(key_value, num_sessions, expires) "
                 f"VALUES ({_dbs(key_value)}, {_dbi(num_sessions)}, NULL);")
        execute_post_query(PostQuery(query, ()))

    def has_session(self, session_id: str) -> bool:
        query = f"SELECT COUNT(*) FROM Session WHERE session_id = {_dbs(session_id)};"
        n = execute_query(query)[0][0]
        return n > 0

    def add_session(self, session_id: str, product_key: str, administrator_username: str, administrator_password_hash: str):
        if not self.is_product_key_valid_for_new_session(product_key):
            raise ValueError(f"The maximum number of sessions for the product key: {product_key} has been reached.")

        if self.has_session(session_id):
            raise NameError(f"There already exists a session with id: {session_id}.")

        # First create Session then Administrator (b/c of reference checks)
        game_state = GAME_STATE_MANAGER.add_game_state()
        query = (f"INSERT INTO Session(session_id, product_key, administrator, game_state, session_status) "
                         f"VALUES ({_dbs(session_id)}, {_dbs(product_key)}, {_dbs(administrator_username)}, {_dbi(game_state)}, \"active\");")
        execute_post_query(PostQuery(query, ()))
        USER_MANAGER.add_user(administrator_username, administrator_password_hash, session_id)

    def add_session_member(self, session_id: str, username: str):
        if not self.has_session(session_id):
            raise NameError(f"There is no session with id: {session_id}.")
        USER_MANAGER.add_user(username, None, session_id)

    def list_session_members(self, session_id: str) -> list[str]:
        if not self.has_session(session_id):
            raise NameError(f"There is no session with id: {session_id}.")
        query = f"SELECT username FROM User WHERE member_of = {_dbs(session_id)};"
        return [row[0] for row in execute_query(query)]

    def get_responsible_administrator(self, username: str) -> str:
        if not USER_MANAGER.has_user(username):
            raise NameError(f"There is no user with username: {username}.")
        query = (f"SELECT Session.administrator FROM User INNER JOIN Session "
                 f"ON User.member_of = Session.session_id "
                 f"WHERE User.username = {_dbs(username)}")
        return execute_query(query)[0][0]

    def get_session_administrator(self, session_id: str) -> str:
        if not self.has_session(session_id):
            raise NameError(f"There is no session with id: {session_id}.")
        query = f"SELECT administrator FROM Session WHERE session_id = {_dbs(session_id)};"
        return execute_query(query)[0][0]

    def set_session_status(self, session_id: str, session_status: str):
        # TODO: Session status
        pass

    def view_session(self, session_id: str):
        query = f"SELECT session_status FROM Session WHERE session_id = {_dbs(session_id)};"
        return {
            "id": session_id,
            "status": execute_query(query)[0][0]
        }

    def get_session(self, session_id: str):
        query = f"SELECT administrator, session_status, game_state FROM Session WHERE session_id = {_dbs(session_id)};"
        administrator_username, status, game_state = execute_query(query)[0]
        member_usernames = self.list_session_members(session_id)
        return {
            "id": session_id,
            "administratorUsername": administrator_username,
            "status": execute_query(query)[0][0],
            "memberUsernames": member_usernames,
            "gameState": game_state
        }

    def get_game_state_id(self, session_id: str) -> int:
        if not self.has_session(session_id):
            raise NameError(f"There is no session with session id: {session_id}.")
        query = f"SELECT game_state FROM Session WHERE session_id = {_dbs(session_id)};"
        return execute_query(query)[0][0]

    def configure_prototype(self, session_id: str):
        # Configure Users
        session = self.get_session(session_id)
        if len(session["memberUsernames"]) != 11:
            raise ValueError("For the prototype configuration a session needs exactly 10 users and one administrator.")
        query = f"SELECT name FROM RoleTable"
        role_names = [row[0] for row in execute_query(query)]
        off = 0
        for username in session["memberUsernames"]:
            if username == session["administratorUsername"]:
                continue
            role_name = role_names[off]
            buergerrat = int(off / 5) + 1
            USER_MANAGER.configure_user(username, role_name, buergerrat)
            off += 1

        # Configure Bürgerräte
        # GAME_STATE_MANAGER.add_parameter_to_buergerrat()         TODO: Populate & Implement Parameters


SESSION_MANAGER: SessionManager = SessionManager()


class TokenManager:
    _user_tokens: dict[str, str]

    def __init__(self):
        self._user_tokens = {}


    def login(self, username: str, password_hash: str) -> str:
        if username in self._user_tokens:
            self._user_tokens.pop(username)

        if not USER_MANAGER.verify_or_create_user_password(username, password_hash):
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

    def get_user_status(self, username: str) -> UserStatus:
        if username in self._user_tokens:
            return UserStatus.ONLINE
        else:
            return UserStatus.OFFLINE


TOKEN_MANAGER: TokenManager = TokenManager()
