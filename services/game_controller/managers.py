"""
Database queries for the game controller.
"""
import uuid
from datetime import timedelta, datetime
from enum import Enum

from shared.architecture.rest import AuthError
from shared.data_model.context import get_last_row_id, execute, Query


class UserStatus(Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    DISABLED = "disabled"


class GamePhase(Enum):
    CONFIGURING = "configuring"
    IDENTIFICATION = "identification"
    DISCUSSION = "discussion"
    VOTING = "voting"
    DEBRIEFING = "debriefing"


class PrototypeConfiguration(Enum):
    FRIDAY_TRIAL_10_USERS = "friday_trial_10_users"
    FRIDAY_TRIAL = "friday_trial"
    FRIDAY_TRIAL_2_USERS = "friday_trial_2_users"


class UserManager:

    def has_user(self, username: str) -> bool:
        query = f"SELECT COUNT(*) FROM User WHERE username = %s;"
        n = execute(Query(query, (username,)))[0][0]
        return n > 0

    def has_password(self, username: str) -> bool:
        if not self.has_user(username):
            raise NameError(f"There is no user with username: {username}.")
        query = f"SELECT COUNT(*) FROM User WHERE username = %s AND password_hash IS NOT NULL"
        n = execute(Query(query, (username,)))[0][0]
        return n > 0

    def is_user_admin(self, username: str) -> bool:
        query = (f"SELECT COUNT(*) FROM User INNER JOIN Session "
                 f"ON User.member_of = Session.session_id AND User.username = Session.administrator "
                 f"WHERE User.username = %s;")
        n = execute(Query(query, (username,)))[0][0]
        return n > 0

    def is_user_configured(self, username: str) -> bool:
        if self.is_user_admin(username):
            return False
        query = f"SELECT COUNT(*) FROM User WHERE username = %s AND plays_as IS NOT NULL;"
        n = execute(Query(query, (username,)))[0][0]
        return n > 0

    def add_user(self, username: str, password_hash: str | None, member_of: str):
        if self.has_user(username):
            raise NameError(f"A user with given username: {username} already exists.")
        query = (f"INSERT INTO User(username, password_hash, member_of) "
                 f"VALUES (%s, %s, %s);")
        execute(Query(query,(username, password_hash, member_of)), commit=True)

    def verify_or_create_user_password(self, username: str, password_hash: str) -> bool:
        if not self.has_user(username):
            raise NameError(f"No user with username: {username}")
        if self.has_password(username):
            query = f"SELECT COUNT(*) FROM User WHERE username = %s AND password_hash = %s;"
            n = execute(Query(query, (username, password_hash)), commit=True)[0][0]
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
        query = f"UPDATE User SET plays_as = %s, buergerrat = %s WHERE username = %s;"
        execute(Query(query, (plays_as, buergerrat, username)), commit=True)

    def update_user_password(self, username: str, password_hash: str):
        if not self.has_user(username):
            raise NameError(f"Unknown username: {username}.")
        query = f"UPDATE User SET password_hash = %s WHERE username = %s;"
        execute(Query(query, (password_hash, username)), commit=True)

    def view_user(self, username: str, status: UserStatus) -> dict:
        if not self.has_user(username):
            raise NameError(f"No user with username: {username}")
        query = f"SELECT plays_as, buergerrat FROM User WHERE username = %s;"
        assigned_role_id, assigned_buergerrat = execute(Query(query, (username,)))[0]
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
        query = f"SELECT member_of FROM User WHERE username = %s;"
        return execute(Query(query, (username,)))[0][0]

    def get_session(self, username: str) -> str:
        if not self.has_user(username):
            raise NameError(f"No user with username: {username}")
        query = f"SELECT member_of FROM User WHERE username = %s;"
        return execute(Query(query, (username,)))[0][0]


USER_MANAGER: UserManager = UserManager()


class GameStateManager:

    def has_game_state(self, game_state_id: int) -> bool:
        query = f"SELECT COUNT(*) FROM GameState WHERE id = %s;"
        n = execute(Query(query, (game_state_id,)))[0][0]
        return n > 0

    def add_game_state(self) -> int:
        query = f"INSERT INTO GameState(phase) VALUES (%s);"
        execute(Query(query, (GamePhase.CONFIGURING.value,)), commit=True)

        game_state_id = get_last_row_id()
        query = "SELECT simple_name FROM Metric"
        metrics = [row[0] for row in execute(Query(query, ()))]
        for metric in metrics:
            query = f"INSERT INTO Projection(game_state, metric) VALUES (%s, %s);"
            execute(Query(query, (game_state_id, metric)), commit=True)
        return game_state_id

    def get_controlled_parameters(self, game_state_id: int, buergerrat: int) -> list:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = (f"SELECT parameter FROM controls "
                 f"WHERE game_state = %s AND buergerrat = %s;")
        return [row[0] for row in execute(Query(query, (game_state_id, buergerrat)))]

    def get_configuration(self, game_state_id: int, buergerrat: int) -> dict[str, float] | None:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT parameter, choice FROM controls WHERE game_state = %s AND buergerrat = %s;"
        configuration = {row[0]: row[1] for row in execute(Query(query, (game_state_id, buergerrat)))}
        if None in configuration.values():
            configuration = None
        return configuration

    def get_buergerraete(self, game_state_id: int) -> tuple[dict, dict]:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        config_buergerrat1 = self.get_configuration(game_state_id, 1)
        config_buergerrat2 = self.get_configuration(game_state_id, 2)

        return ({
            "index": 1,
            "parameters": self.get_controlled_parameters(game_state_id, 1),
            "configuration": config_buergerrat1
        }, {
            "index": 2,
            "parameters": self.get_controlled_parameters(game_state_id, 2),
            "configuration": config_buergerrat2
        })

    def get_projections(self, game_state_id: int) -> dict[str, float] | None:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT metric, projected_value FROM Projection WHERE game_state = %s;"
        result = execute(Query(query, (game_state_id,)))
        projections = {row[0]: row[1] for row in result}
        if None in projections.values():
            projections = None
        return projections

    def get_game_state(self, game_state_id: int):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT phase, voting_end FROM GameState WHERE id = %s;"
        phase, voting_end = execute(Query(query, (game_state_id,)))[0]
        buergerrat1, buergerrat2 = self.get_buergerraete(game_state_id)
        projection = self.get_projections(game_state_id)
        return {
            "id": game_state_id,
            "buergerrat1": buergerrat1,
            "buergerrat2": buergerrat2,
            "phase": phase,
            "projection": projection,
            "votingEnd": voting_end
        }

    def are_users_configured(self, game_state_id: int) -> bool:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT session_id FROM Session WHERE game_state = %s;"
        session_id = execute(Query(query, (game_state_id,)))[0][0]
        query = (f"SELECT COUNT(*) "
                 f"FROM User INNER JOIN Session ON User.member_of = Session.session_id "
                 f"WHERE Session.session_id = %s AND User.plays_as IS NULL AND User.username != Session.administrator;")
        n = execute(Query(query, (session_id,)))[0][0]
        return n == 0

    def add_parameter_to_buergerrat(self, game_state_id: int, buergerrat: int, parameter: str):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        if buergerrat != 1 and buergerrat != 2:
            raise ValueError("Buergerrat must be 1 or 2.")
        query = f"INSERT INTO controls(game_state, buergerrat, parameter) VALUES (%s, %s, %s);"
        execute(Query(query, (game_state_id, buergerrat, parameter)), commit=True)

    def are_buergerraete_configured(self, game_state_id: int) -> bool:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        params1 = self.get_controlled_parameters(game_state_id, 1)
        params2 = self.get_controlled_parameters(game_state_id, 2)
        return len(params1) > 0 and len(params2) > 0

    def set_choice(self, game_state_id: int, buergerrat: int, parameter: str, value: float):

        query = f"UPDATE controls SET choice = %s WHERE game_state = %s AND buergerrat = %s AND parameter = %s;"
        execute(Query(query, (value, game_state_id, buergerrat, parameter)))

    def setup_voting(self, game_state_id: int):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = (f"SELECT Parameter.simple_name, Parameter.min_value "
                 f"FROM controls INNER JOIN Parameter ON controls.parameter = Parameter.simple_name "
                 f"WHERE controls.game_state = %s AND controls.buergerrat = 1;")
        all_parameters_br1 = execute(Query(query, (game_state_id,)))
        query = (f"SELECT Parameter.simple_name, Parameter.min_value "
                 f"FROM controls INNER JOIN Parameter ON controls.parameter = Parameter.simple_name "
                 f"WHERE controls.game_state = %s AND controls.buergerrat = 2;")
        all_parameters_br2 = execute(Query(query, (game_state_id,)))
        query = f"SELECT session_id FROM Session WHERE game_state = %s;"
        session_id = execute(Query(query, (game_state_id,)))[0][0]
        query = f"SELECT username FROM User WHERE member_of = %s AND buergerrat = 1;"
        users_br1 = [row[0] for row in execute(Query(query, (session_id,)))]
        query = f"SELECT username FROM User WHERE member_of = %s AND buergerrat = 2;"
        users_br2 = [row[0] for row in execute(Query(query, (session_id,)))]
        for users, all_parameters in [(users_br1, all_parameters_br1), (users_br2, all_parameters_br2)]:
            for username in users:
                for parameter, min_value in all_parameters:
                    query = (f"INSERT INTO Voting(user, parameter, voted_value, has_committed) "
                             f"VALUES (%s, %s, %s, FALSE);")
                    execute(Query(query, (username, parameter, min_value)), commit=True)

    def make_projections(self, game_state_id: int):
        # TODO: Make projections CORRECT & DYNAMIC
        fixed_projections = [("energy_prod_coal", 50), ("energy_prod_wind", 50), ("sea_level", 10)]
        for metric, projected_value in fixed_projections:
            query = f"UPDATE Projection SET projected_value = %s WHERE game_state = %s AND metric = %s;"
            execute(Query(query, (projected_value, game_state_id, metric)), commit=True)

    def ready_to_transition(self, game_state_id: int, target_phase: str):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT phase FROM GameState WHERE id = %s;"
        phase = execute(Query(query, (game_state_id,)))[0][0]
        if phase == GamePhase.CONFIGURING.value and target_phase == GamePhase.IDENTIFICATION.value:
            return self.are_users_configured(game_state_id) and self.are_buergerraete_configured(game_state_id)
        elif phase == GamePhase.IDENTIFICATION.value and target_phase == GamePhase.DISCUSSION.value:
            return True
        elif phase == GamePhase.DISCUSSION.value and target_phase == GamePhase.VOTING.value:
            return True
        elif phase == GamePhase.VOTING.value and target_phase == GamePhase.DEBRIEFING.value:
            return self.voting_have_all_committed(game_state_id)
        else:
            return False

    def transition(self, game_state_id: int, target_phase: str):
        if not self.ready_to_transition(game_state_id, target_phase):
            raise RuntimeError("Not yet ready to transition (Are all users & buergerraete configured?).")
        if target_phase == GamePhase.IDENTIFICATION.value:
            pass
        elif target_phase == GamePhase.DISCUSSION.value:
            self.setup_voting(game_state_id)
        elif target_phase == GamePhase.VOTING.value:
            self.voting_set_timer(game_state_id)
        elif target_phase == GamePhase.DEBRIEFING.value:
            self.make_projections(game_state_id)
        query = f"UPDATE GameState SET phase = %s WHERE id = %s;"
        execute(Query(query, (target_phase, game_state_id)), commit=True)

    def is_fact_applicable(self, game_state_id: int, name: str) -> bool:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = (f"SELECT ScenarioCondition.metric, ScenarioCondition.min_value, ScenarioCondition.max_value "
                 f"FROM ScenarioCondition INNER JOIN Fact_depends_on ON ScenarioCondition.name = Fact_depends_on.scenario_condition "
                 f"WHERE Fact_depends_on.fact = %s;")
        all_conditions = {row[0]: (row[1], row[2]) for row in execute(Query(query, (name,)))}
        query = f"SELECT metric, projected_value FROM Projection WHERE game_state = %s;"
        projected_metrics = {row[0]: row[1] for row in execute(Query(query, (game_state_id,)))}

        for metric in all_conditions:
            if metric not in projected_metrics or projected_metrics[metric] is None:
                raise RuntimeError(f"Metric {metric} has not been projected in this session.")
            min_value, max_value = all_conditions[metric]
            if not (min_value <= projected_metrics[metric] <= max_value):
                return False
        return True

    def is_post_applicable(self, game_state_id: int, name: str) -> bool:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = (f"SELECT ScenarioCondition.metric, ScenarioCondition.min_value, ScenarioCondition.max_value "
                 f"FROM ScenarioCondition INNER JOIN Post_depends_on ON ScenarioCondition.name = Post_depends_on.scenario_condition "
                 f"WHERE Post_depends_on.post = %s;")
        all_conditions = {row[0]: (row[1], row[2]) for row in execute(Query(query, (name,)))}
        query = f"SELECT metric, projected_value FROM Projection WHERE game_state = %s;"
        projected_metrics = {row[0]: row[1] for row in execute(Query(query, (game_state_id,)))}

        for metric in all_conditions:
            if metric not in projected_metrics or projected_metrics[metric] is None:
                raise RuntimeError(f"Metric {metric} has not been projected in this session.")
            min_value, max_value = all_conditions[metric]
            if not (min_value <= projected_metrics[metric] <= max_value):
                return False
        return True

    def voting_have_all_committed(self, game_state_id: int) -> bool:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = (f"SELECT COUNT(*) "
                 f"FROM Session INNER JOIN (User INNER JOIN Voting ON User.username = Voting.user) ON User.member_of = Session.session_id "
                 f"WHERE Session.game_state = %s AND NOT Voting.has_committed;")
        n = execute(Query(query, (game_state_id,)))[0][0]
        return n == 0

    def voting_has_committed(self, username: str, parameter: str) -> bool:
        query = f"SELECT has_committed FROM Voting WHERE user = %s AND parameter = %s;"
        return execute(Query(query, (username, parameter)))[0][0]

    def voting_update(self, username: str, parameter: str, voted_value: float):
        if not USER_MANAGER.has_user(username):
            raise NameError(f"No user with username {username}.")
        query = (f"SELECT GameState.id "
                 f"FROM GameState INNER JOIN (Session INNER JOIN User ON Session.session_id = User.member_of) ON GameState.id = Session.game_state "
                 f"WHERE User.username = %s;")
        game_state_id = execute(Query(query, (username,)))[0][0]
        query = f"SELECT phase FROM GameState WHERE id = %s;"
        phase = execute(Query(query, (game_state_id,)))[0][0]
        if phase != GamePhase.VOTING.value and phase != GamePhase.DISCUSSION.value:
            raise RuntimeError("Game is not in voting nor discussion phase.")
        if self.voting_has_committed(username, parameter):
            raise RuntimeError(f"User {username} has already committed a vote for {parameter}.")
        query = f"UPDATE Voting SET voted_value = %s WHERE user = %s AND parameter = %s;"
        execute(Query(query, (voted_value, username, parameter)), commit=True)

    def voting_commit(self, username: str, parameter: str):
        if not USER_MANAGER.has_user(username):
            raise NameError(f"No user with username {username}.")
        query = (f"SELECT GameState.id "
                 f"FROM GameState INNER JOIN (Session INNER JOIN User ON Session.session_id = User.member_of) ON GameState.id = Session.game_state "
                 f"WHERE User.username = %s;")
        game_state_id = execute(Query(query, (username,)))[0][0]
        query = f"SELECT phase FROM GameState WHERE id = %s;"
        phase = execute(Query(query, (game_state_id,)))[0][0]
        if phase != GamePhase.VOTING.value:
            raise RuntimeError("Game is not in voting phase.")
        if self.voting_has_committed(username, parameter):
            raise RuntimeError(f"User {username} has already committed a vote for {parameter}.")
        query = f"UPDATE Voting SET has_committed = TRUE WHERE user = %s AND parameter = %s;"
        execute(Query(query, (username, parameter)), commit=True)

    def voting_get_status(self, game_state_id: int, buergerrat: int) -> dict:
        query = f"SELECT phase, voting_end FROM GameState WHERE id = %s;"
        phase, voting_end = execute(Query(query, (game_state_id,)))[0]
        if phase != GamePhase.VOTING.value and phase != GamePhase.DISCUSSION.value:
            raise RuntimeError("Game is not in voting nor in discussion phase.")
        query = (f"SELECT User.username, User.plays_as "
                 f"FROM User INNER JOIN Session ON User.member_of = Session.session_id "
                 f"WHERE User.buergerrat = %s AND Session.game_state = %s;")
        usernames = execute(Query(query, (buergerrat, game_state_id)))
        user_statuses = []
        for username, role_name in usernames:
            query = f"SELECT parameter, voted_value FROM Voting WHERE user = %s;"
            parameters = execute(Query(query, (username,)))
            parameter_statuses = []
            for parameter, voted_value in parameters:
                parameter_statuses.append({
                    "parameter": parameter,
                    "votedValue": voted_value
                })
            user_statuses.append({
                "roleName": role_name,
                "parameterStatuses": parameter_statuses
            })
        return {
            "buergerrat": buergerrat,
            "userStatuses": user_statuses,
            "votingEnd": voting_end
        }

    def voting_set_timer(self, game_state_id: int):
        voting_end = datetime.now() + timedelta(minutes=5)
        query = f"UPDATE GameState SET voting_end = %s WHERE id = %s;"
        execute(Query(query, (voting_end, game_state_id)))

    def voting_determine_result(self, game_state_id: int):
        # TODO: Average for now
        query = (f"SELECT Voting.parameter, Voting.voted_value, User.buergerrat "
                 f"FROM Voting INNER JOIN (User INNER JOIN Session ON User.member_of = Session.session_id) ON Voting.user = User.username "
                 f"WHERE Session.game_state = %s;")
        votes_br1 = {}
        votes_br2 = {}
        for parameter, value, buergerrat in execute(Query(query, (game_state_id,))):
            target = votes_br1 if buergerrat == 1 else votes_br2
            if parameter not in target:
                target[parameter] = []
            target[parameter].append(value)
        for votes, buergerrat in [(votes_br1, 1), (votes_br2, 2)]:
            for parameter in votes:
                values = votes[parameter]
                avrg = sum(values)
                if len(values) > 0:
                    avrg /= len(values)
                query = f"UPDATE controls SET choice = %s WHERE game_state = %s AND parameter = %s AND buergerrat = %s;"
                execute(Query(query, (avrg, game_state_id, parameter, buergerrat)), commit=True)


GAME_STATE_MANAGER: GameStateManager = GameStateManager()


class SessionManager:
    def has_product_key(self, key_value: str) -> bool:
        query = f"SELECT COUNT(*) FROM ProductKey WHERE key_value = %s;"
        n = execute(Query(query, (key_value,)))[0][0]
        return n > 0

    def get_number_of_sessions_with_product_key(self, key_value: str) -> int:
        query = f"SELECT COUNT(*) FROM Session WHERE product_key = %s;"
        return execute(Query(query, (key_value,)))[0][0]

    def is_product_key_valid_for_new_session(self, key_value: str) -> bool:
        if not self.has_product_key(key_value):
            raise ValueError(f"Unknown product key: {key_value}.")
        query = f"SELECT num_sessions, expires FROM ProductKey WHERE key_value = %s;"
        num_sessions, expires = execute(Query(query, (key_value,)))[0]
        used_sessions = self.get_number_of_sessions_with_product_key(key_value)
        # TODO: Expiration check
        return used_sessions < num_sessions

    def add_product_key(self, key_value: str, num_sessions: int):
        if self.has_product_key(key_value):
            raise ValueError(f"The product key {key_value} has already been registered.")
        query = f"INSERT INTO ProductKey(key_value, num_sessions, expires) VALUES (%s, %s, NULL);"
        execute(Query(query, (key_value, num_sessions)), commit=True)

    def has_session(self, session_id: str) -> bool:
        query = f"SELECT COUNT(*) FROM Session WHERE session_id = %s;"
        n = execute(Query(query, (session_id,)))[0][0]
        return n > 0

    def add_session(self, session_id: str, product_key: str, administrator_username: str, administrator_password_hash: str):
        if not self.is_product_key_valid_for_new_session(product_key):
            raise ValueError(f"The maximum number of sessions for the product key: {product_key} has been reached.")

        if self.has_session(session_id):
            raise NameError(f"There already exists a session with id: {session_id}.")

        # First create Session then Administrator (b/c of reference checks)
        game_state = GAME_STATE_MANAGER.add_game_state()
        query = (f"INSERT INTO Session(session_id, product_key, administrator, game_state, session_status) "
                 f"VALUES (%s, %s, %s, %s, %s);")
        execute(Query(query, (session_id, product_key, administrator_username, game_state, "active")), commit=True)
        USER_MANAGER.add_user(administrator_username, administrator_password_hash, session_id)

    def add_session_member(self, session_id: str, username: str):
        if not self.has_session(session_id):
            raise NameError(f"There is no session with id: {session_id}.")
        USER_MANAGER.add_user(username, None, session_id)

    def list_session_members(self, session_id: str) -> list[str]:
        if not self.has_session(session_id):
            raise NameError(f"There is no session with id: {session_id}.")
        query = f"SELECT username FROM User WHERE member_of = %s;"
        return [row[0] for row in execute(Query(query, (session_id,)))]

    def get_responsible_administrator(self, username: str) -> str:
        if not USER_MANAGER.has_user(username):
            raise NameError(f"There is no user with username: {username}.")
        query = (f"SELECT Session.administrator FROM User INNER JOIN Session "
                 f"ON User.member_of = Session.session_id "
                 f"WHERE User.username = %s;")
        return execute(Query(query, (username,)))[0][0]

    def get_session_administrator(self, session_id: str) -> str:
        if not self.has_session(session_id):
            raise NameError(f"There is no session with id: {session_id}.")
        query = f"SELECT administrator FROM Session WHERE session_id = %s;"
        return execute(Query(query, (session_id,)))[0][0]

    def set_session_status(self, session_id: str, session_status: str):
        # TODO: Session status
        pass

    def view_session(self, session_id: str):
        query = f"SELECT session_status FROM Session WHERE session_id = %s;"
        return {
            "id": session_id,
            "status": execute(Query(query, (session_id,)))[0][0]
        }

    def get_session(self, session_id: str):
        query = f"SELECT administrator, session_status, game_state FROM Session WHERE session_id = %s;"
        administrator_username, status, game_state = execute(Query(query, (session_id,)))[0]
        member_usernames = self.list_session_members(session_id)
        return {
            "id": session_id,
            "administratorUsername": administrator_username,
            "status": status,
            "memberUsernames": member_usernames,
            "gameState": game_state
        }

    def get_game_state_id(self, session_id: str) -> int:
        if not self.has_session(session_id):
            raise NameError(f"There is no session with session id: {session_id}.")
        query = f"SELECT game_state FROM Session WHERE session_id = %s;"
        return execute(Query(query, (session_id,)))[0][0]

    def configure_prototype_friday_trial(self, session_id: str):
        # Configure Users
        session = self.get_session(session_id)
        if len(session["memberUsernames"]) != 11:
            raise ValueError("For the prototype configuration a session needs exactly 10 users and one administrator.")

        query = f"SELECT name FROM RoleTable"  # TODO: Hard code assigned roles
        role_names = [row[0] for row in execute(Query(query, ()))]
        off = 0
        for username in session["memberUsernames"]:
            if username == session["administratorUsername"]:
                continue
            role_name = role_names[off]
            buergerrat = int(off / 5) + 1
            USER_MANAGER.configure_user(username, role_name, buergerrat)
            off += 1

        # Configure Bürgerräte
        game_state_id = session["gameState"]
        GAME_STATE_MANAGER.add_parameter_to_buergerrat(game_state_id, 1, "fossil_fuel_taxes")
        GAME_STATE_MANAGER.add_parameter_to_buergerrat(game_state_id, 1, "reduction_infra")
        GAME_STATE_MANAGER.add_parameter_to_buergerrat(game_state_id, 2, "gases_agriculture")
        GAME_STATE_MANAGER.add_parameter_to_buergerrat(game_state_id, 2, "reduction_meat")
        GAME_STATE_MANAGER.add_parameter_to_buergerrat(game_state_id, 2, "reduction_waste")

    def configure_prototype_friday_trial_2_users(self, session_id: str):
        # Configure Users
        session = self.get_session(session_id)
        if len(session["memberUsernames"]) != 3:
            raise ValueError("For the prototype configuration a session needs exactly 2 users and one administrator.")

        query = f"SELECT name FROM RoleTable"  # TODO: Hard code assigned roles
        role_names = [row[0] for row in execute(Query(query, ()))]
        off = 0
        for username in session["memberUsernames"]:
            if username == session["administratorUsername"]:
                continue
            print(role_names)
            role_name = role_names[off]
            buergerrat = off + 1
            USER_MANAGER.configure_user(username, role_name, buergerrat)
            off += 1

        # Configure Bürgerräte
        game_state_id = session["gameState"]
        GAME_STATE_MANAGER.add_parameter_to_buergerrat(game_state_id, 1, "fossil_fuel_taxes")
        GAME_STATE_MANAGER.add_parameter_to_buergerrat(game_state_id, 1, "reduction_infra")
        GAME_STATE_MANAGER.add_parameter_to_buergerrat(game_state_id, 2, "gases_agriculture")
        GAME_STATE_MANAGER.add_parameter_to_buergerrat(game_state_id, 2, "reduction_meat")
        GAME_STATE_MANAGER.add_parameter_to_buergerrat(game_state_id, 2, "reduction_waste")

    def configure_prototype_friday_trial_10_users(self, session_id: str):
        # Configure Users
        session = self.get_session(session_id)
        if len(session["memberUsernames"]) != 11:
            raise ValueError("For the prototype configuration a session needs exactly 10 users and one administrator.")

        user_map = [
            ("1_ethan_miller", 1),
            ("3_richard_davis", 1),
            ("4_li_wen", 1),
            ("5_leon_schulz", 1),
            ("6_mikkel_pedersen", 1),

            ("7_yasemin_aidin", 2),
            ("9_aigerim_amanova", 2),
            ("10_joao_silva", 2),
            ("11_anais_fournier", 2),
            ("12_kofi_owusu", 2)
        ]
        off = 0
        for username in session["memberUsernames"]:
            if username == session["administratorUsername"]:
                continue
            role_name, buergerrat = user_map[off]
            print("____________________ Configuring user " + str(username) + " " + str(role_name) + " " + str(buergerrat))
            USER_MANAGER.configure_user(username, role_name, buergerrat)
            off += 1

        # Configure Bürgerräte
        game_state_id = session["gameState"]
        GAME_STATE_MANAGER.add_parameter_to_buergerrat(game_state_id, 1, "fossil_fuel_taxes")
        GAME_STATE_MANAGER.add_parameter_to_buergerrat(game_state_id, 1, "reduction_infra")
        GAME_STATE_MANAGER.add_parameter_to_buergerrat(game_state_id, 2, "gases_agriculture")
        GAME_STATE_MANAGER.add_parameter_to_buergerrat(game_state_id, 2, "reduction_meat")
        GAME_STATE_MANAGER.add_parameter_to_buergerrat(game_state_id, 2, "reduction_waste")

    def configure_prototype(self, session_id: str, configuration: str):
        if configuration == PrototypeConfiguration.FRIDAY_TRIAL.value:
            self.configure_prototype_friday_trial(session_id)
        elif configuration == PrototypeConfiguration.FRIDAY_TRIAL_2_USERS.value:
            self.configure_prototype_friday_trial_2_users(session_id)
        elif configuration == PrototypeConfiguration.FRIDAY_TRIAL_10_USERS.value:
            self.configure_prototype_friday_trial_10_users(session_id)


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
