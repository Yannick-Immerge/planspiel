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

def _dbf(v: float | None):
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


class DiscussionPhase(Enum):
    INACTIVE = "inactive"
    PREPARING = "preparing"
    INTRODUCTION = "introduction"
    FREE = "free"
    CLOSING = "closing"
    VOTING = "voting"
    COMPLETED = "completed"


class PrototypeConfiguration(Enum):
    FRIDAY_TRIAL = "friday_trial"
    FRIDAY_TRIAL_2_USERS = "friday_trial_2_users"


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

    def get_session(self, username: str) -> str:
        if not self.has_user(username):
            raise NameError(f"No user with username: {username}")
        query = f"SELECT member_of FROM User WHERE username = {_dbs(username)};"
        return execute_query(query)[0][0]


USER_MANAGER: UserManager = UserManager()


class GameStateManager:
    def has_game_state(self, game_state_id: int) -> bool:
        query = f"SELECT COUNT(*) FROM GameState WHERE id = {_dbi(game_state_id)};"
        n = execute_query(query)[0][0]
        return n > 0

    def add_game_state(self) -> int:
        query = f"INSERT INTO GameState(phase, discussion_phase) VALUES ({_dbs(GamePhase.CONFIGURING.value)}, {_dbs(DiscussionPhase.INACTIVE.value)});"
        execute_post_query(PostQuery(query, ()))
        game_state_id = get_last_row_id()
        query = "SELECT simple_name FROM Metric"
        metrics = [row[0] for row in execute_query(query)]
        for metric in metrics:
            query = f"INSERT INTO Projection(game_state, metric) VALUES ({_dbi(game_state_id)}, {_dbs(metric)});"
            execute_post_query(PostQuery(query, ()))
        return game_state_id

    def get_controlled_parameters(self, game_state_id: int, buergerrat: int) -> list:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = (f"SELECT parameter FROM controls "
                 f"WHERE game_state = {_dbi(game_state_id)} AND buergerrat = {_dbi(buergerrat)};")
        return [row[0] for row in execute_query(query)]

    def get_configurations(self, game_state_id: int, buergerrat: int) -> tuple[dict[str, float] | None, dict[str, float] | None]:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT parameter, choice1 FROM controls WHERE game_state = {_dbi(game_state_id)} AND buergerrat = {_dbi(buergerrat)};"
        configuration1 = {row[0]: row[1] for row in execute_query(query)}
        query = f"SELECT parameter, choice2 FROM controls WHERE game_state = {_dbi(game_state_id)} AND buergerrat = {_dbi(buergerrat)};"
        configuration2 = {row[0]: row[1] for row in execute_query(query)}
        if None in configuration1.values():
            configuration1 = None
        if None in configuration2.values():
            configuration2 = None
        return configuration1, configuration2

    def get_buergerraete(self, game_state_id: int) -> tuple[dict, dict]:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        configs_buergerrat1 = self.get_configurations(game_state_id, 1)
        configs_buergerrat2 = self.get_configurations(game_state_id, 2)

        return ({
            "index": 1,
            "parameters": self.get_controlled_parameters(game_state_id, 1),
            "configuration1": configs_buergerrat1[0],
            "configuration2": configs_buergerrat1[1]
        }, {
            "index": 2,
            "parameters": self.get_controlled_parameters(game_state_id, 2),
            "configuration1": configs_buergerrat2[0],
            "configuration2": configs_buergerrat2[1]
        })

    def get_projections(self, game_state_id: int) -> tuple[dict[str, float] | None, dict[str, float] | None]:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT metric, projected_value1, projected_value2 FROM Projection WHERE game_state = {_dbi(game_state_id)};"
        result = execute_query(query)
        projections1 = {row[0]: row[1] for row in result}
        projections2 = {row[0]: row[2] for row in result}
        if None in projections1.values():
            projections1 = None
        if None in projections2.values():
            projections2 = None
        return projections1, projections2

    def get_game_state(self, game_state_id: int):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT phase, discussion_phase, discussion_speaker1, discussion_speaker2 FROM GameState WHERE id = {_dbi(game_state_id)};"
        phase, discussion_phase, discussion_speaker1, discussion_speaker2 = execute_query(query)[0]
        buergerrat1, buergerrat2 = self.get_buergerraete(game_state_id)
        projections1, projections2 = self.get_projections(game_state_id)
        return {
            "id": game_state_id,
            "buergerrat1": buergerrat1,
            "buergerrat2": buergerrat2,
            "phase": phase,
            "projections1": projections1,
            "projections2": projections2,
            "discussionPhase": discussion_phase,
            "discussionSpeaker1": discussion_speaker1,
            "discussionSpeaker2": discussion_speaker2
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

    def add_parameter_to_buergerrat(self, game_state_id: int, buergerrat: int, parameter: str):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        if buergerrat != 1 and buergerrat != 2:
            raise ValueError("Buergerrat must be 1 or 2.")
        query = (f"INSERT INTO controls(game_state, buergerrat, parameter) VALUES "
                 f"({_dbi(game_state_id)}, {_dbi(buergerrat)}, {_dbs(parameter)});")
        execute_post_query(PostQuery(query, ()))

    def are_buergerraete_configured(self, game_state_id: int) -> bool:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        params1 = self.get_controlled_parameters(game_state_id, 1)
        params2 = self.get_controlled_parameters(game_state_id, 2)
        return len(params1) > 0 and len(params2) > 0

    def set_choice(self, game_state_id: int, buergerrat: int, index: int, parameter: str, value: float):
        if index == 1:
            choice_attr = "choice1"
        elif index == 2:
            choice_attr = "choice2"
        else:
            raise ValueError("Only 0 and 1 are allowed for the choice index.")
        query = (f"UPDATE controls SET {choice_attr} = {_dbf(value)} "
                 f"WHERE game_state = {_dbi(game_state_id)} AND buergerrat = {_dbi(buergerrat)} AND parameter = {_dbs(parameter)};")
        execute_post_query(PostQuery(query, ()))

    def setup_voting(self, game_state_id: int):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT parameter FROM controls WHERE game_state = {_dbi(game_state_id)} AND buergerrat = 1;"
        all_parameters_br1 = [row[0] for row in execute_query(query)]
        query = f"SELECT parameter FROM controls WHERE game_state = {_dbi(game_state_id)} AND buergerrat = 2;"
        all_parameters_br2 = [row[0] for row in execute_query(query)]
        query = f"SELECT session_id FROM Session WHERE game_state = {_dbi(game_state_id)};"
        session_id = execute_query(query)[0][0]
        query = f"SELECT username FROM User WHERE member_of = {_dbs(session_id)} AND buergerrat = 1;"
        users_br1 = [row[0] for row in execute_query(query)]
        query = f"SELECT username FROM User WHERE member_of = {_dbs(session_id)} AND buergerrat = 2;"
        users_br2 = [row[0] for row in execute_query(query)]
        for users, all_parameters in [(users_br1, all_parameters_br1), (users_br2, all_parameters_br2)]:
            for username in users:
                for parameter in all_parameters:
                    query = f"INSERT INTO Voting(user, parameter) VALUES ({_dbs(username)}, {_dbs(parameter)});"
                    execute_post_query(PostQuery(query, ()))

    def make_projections(self, game_state_id: int, index: int):
        # TODO: Make projections CORRECT & DYNAMIC
        fixed_projections = [("energy_prod_coal", 50), ("energy_prod_wind", 50), ("sea_level", 10)]
        projected_value_attr = "projected_value1" if index == 1 else "projected_value2"
        for metric, projected_value in fixed_projections:
            query = f"UPDATE Projection SET {projected_value_attr} = {_dbf(projected_value)} WHERE game_state = {_dbi(game_state_id)} AND metric = {_dbs(metric)};"
            execute_post_query(PostQuery(query, ()))

    def ready_to_transition(self, game_state_id: int, target_phase: str):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT phase FROM GameState WHERE id = {_dbi(game_state_id)};"
        phase = execute_query(query)[0][0]
        print(f"Can transition from {phase} -> {target_phase}?")
        if phase == GamePhase.CONFIGURING.value and target_phase == GamePhase.IDENTIFICATION_1.value:
            return self.are_users_configured(game_state_id) and self.are_buergerraete_configured(game_state_id)
        elif phase ==GamePhase.IDENTIFICATION_1.value and target_phase == GamePhase.DISCUSSION_1.value:
            return True
        elif phase ==GamePhase.DISCUSSION_1.value and target_phase == GamePhase.IDENTIFICATION_2.value:
            return self.discussion_is_completed(game_state_id)
        elif phase == GamePhase.IDENTIFICATION_2.value and target_phase == GamePhase.DISCUSSION_2.value:
            return True
        elif phase == GamePhase.DISCUSSION_2.value and target_phase == GamePhase.DEBRIEFING.value:
            return self.discussion_is_completed(game_state_id)
        else:
            return False

    def transition(self, game_state_id: int, target_phase: str):
        if not self.ready_to_transition(game_state_id, target_phase):
            raise RuntimeError("Not yet ready to transition (Are all users & buergerraete configured?).")
        if target_phase == GamePhase.IDENTIFICATION_1.value:
            self.setup_voting(game_state_id)
        elif target_phase == GamePhase.DISCUSSION_1.value:
            self.discussion_initialize(game_state_id)
        elif target_phase == GamePhase.IDENTIFICATION_2.value:
            self.discussion_deactivate(game_state_id)
            self.make_projections(game_state_id, 1)
        elif target_phase == GamePhase.DISCUSSION_2.value:
            self.discussion_initialize(game_state_id)
        elif target_phase == GamePhase.DEBRIEFING.value:
            self.discussion_deactivate(game_state_id)
            self.make_projections(game_state_id, 2)
        query = f"UPDATE GameState SET phase = {_dbs(target_phase)} WHERE id = {_dbi(game_state_id)};"
        execute_post_query(PostQuery(query, ()))

    def is_scenario_applicable(self, game_state_id: int, name: str) -> bool:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = (f"SELECT ScenarioCondition.metric, ScenarioCondition.min_value, ScenarioCondition.max_value "
                 f"FROM ScenarioCondition INNER JOIN depends_on ON ScenarioCondition.name = depends_on.scenario_condition "
                 f"WHERE depends_on.scenario = {_dbs(name)}")
        all_conditions = {row[0]: (row[1], row[2]) for row in execute_query(query)}
        query = f"SELECT metric, projected_value1 FROM Projection WHERE game_state = {_dbi(game_state_id)}"
        projected_metrics = {row[0]: row[1] for row in execute_query(query)}

        for metric in all_conditions:
            if metric not in projected_metrics or projected_metrics[metric] is None:
                raise RuntimeError(f"Metric {metric} has not been projected in this session.")
            min_value, max_value = all_conditions[metric]
            if not (min_value <= projected_metrics[metric] <= max_value):
                return False
        return True

    def discussion_initialize(self, game_state_id: int):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"UPDATE GameState SET discussion_phase = {_dbs(DiscussionPhase.PREPARING.value)} WHERE id = {_dbi(game_state_id)};"
        execute_post_query(PostQuery(query, ()))

    def discussion_deactivate(self, game_state_id: int):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"UPDATE GameState SET discussion_phase = {_dbs(DiscussionPhase.INACTIVE.value)} WHERE id = {_dbi(game_state_id)};"
        execute_post_query(PostQuery(query, ()))

    def discussion_is_completed(self, game_state_id: int):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT phase, discussion_phase, discussion_speaker1, discussion_speaker2 FROM GameState WHERE id = {_dbi(game_state_id)};"
        phase, discussion_phase, discussion_speaker1, discussion_speaker2 = execute_query(query)[0]
        if phase != GamePhase.DISCUSSION_1.value and phase != GamePhase.DISCUSSION_2.value:
            raise RuntimeError("Game is not in discussion phase.")
        return discussion_phase == DiscussionPhase.COMPLETED.value

    def discussion_have_all_spoken(self, game_state_id: int) -> bool:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT phase, discussion_phase, discussion_speaker1, discussion_speaker2 FROM GameState WHERE id = {_dbi(game_state_id)};"
        phase, discussion_phase, discussion_speaker1, discussion_speaker2 = execute_query(query)[0]
        if phase != GamePhase.DISCUSSION_1.value and phase != GamePhase.DISCUSSION_2.value:
            raise RuntimeError("Game is not in discussion phase.")
        if discussion_phase != DiscussionPhase.INTRODUCTION.value and discussion_phase != DiscussionPhase.CLOSING.value:
            raise RuntimeError(f"The speaker is not controlled in discussion phase: {discussion_phase}.")
        query = f"SELECT session_id FROM Session WHERE game_state = {_dbi(game_state_id)};"
        session_id = execute_query(query)[0][0]
        query = f"SELECT username FROM User WHERE member_of = {_dbs(session_id)} AND buergerrat = 1;"
        speakers1 = [row[0] for row in execute_query(query)]
        query = f"SELECT username FROM User WHERE member_of = {_dbs(session_id)} AND buergerrat = 2;"
        speakers2 = [row[0] for row in execute_query(query)]
        return discussion_speaker1 == speakers1[-1] and discussion_speaker2 == speakers2[-1]

    def discussion_next_speaker(self, game_state_id: int):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT phase, discussion_phase, discussion_speaker1, discussion_speaker2 FROM GameState WHERE id = {_dbi(game_state_id)};"
        phase, discussion_phase, discussion_speaker1, discussion_speaker2 = execute_query(query)[0]
        if phase != GamePhase.DISCUSSION_1.value and phase != GamePhase.DISCUSSION_2.value:
            raise RuntimeError("Game is not in discussion phase.")
        if discussion_phase != DiscussionPhase.INTRODUCTION.value and discussion_phase != DiscussionPhase.CLOSING.value:
            raise RuntimeError(f"The speaker is not controlled in discussion phase: {discussion_phase}.")
        query = f"SELECT session_id FROM Session WHERE game_state = {_dbi(game_state_id)};"
        session_id = execute_query(query)[0][0]
        query = f"SELECT username FROM User WHERE member_of = {_dbs(session_id)} AND buergerrat = 1;"
        speakers1 = [row[0] for row in execute_query(query)]
        query = f"SELECT username FROM User WHERE member_of = {_dbs(session_id)} AND buergerrat = 2;"
        speakers2 = [row[0] for row in execute_query(query)]
        next_speaker1 = 0 if discussion_speaker1 is None else (speakers1.index(discussion_speaker1) + 1)
        next_speaker2 = 0 if discussion_speaker2 is None else (speakers2.index(discussion_speaker2) + 1)
        if next_speaker1 >= len(speakers1) or next_speaker2 >= len(speakers2):
            raise RuntimeError(f"Already reached last speaker {discussion_speaker1} of {speakers1}.")
        query = f"UPDATE GameState SET discussion_speaker1 = {_dbs(speakers1[next_speaker1])}, discussion_speaker2 = {_dbs(speakers2[next_speaker2])} WHERE id = {_dbi(game_state_id)};"
        execute_post_query(PostQuery(query, ()))

    def discussion_ready_to_transition(self, game_state_id: int, target_phase: str) -> bool:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        query = f"SELECT phase, discussion_phase, discussion_speaker1, discussion_speaker2 FROM GameState WHERE id = {_dbi(game_state_id)};"
        phase, discussion_phase, discussion_speaker1, discussion_speaker2 = execute_query(query)[0]
        if phase != GamePhase.DISCUSSION_1.value and phase != GamePhase.DISCUSSION_2.value:
            raise RuntimeError("Game is not in discussion phase.")
        if discussion_phase == DiscussionPhase.INACTIVE.value:
            raise RuntimeError(f"Unexpected discussion phase: {discussion_phase}.")
        if discussion_phase == DiscussionPhase.PREPARING.value and target_phase == DiscussionPhase.INTRODUCTION.value:
            return True
        elif discussion_phase == DiscussionPhase.INTRODUCTION.value and target_phase == DiscussionPhase.FREE.value:
            return self.discussion_have_all_spoken(game_state_id)
        elif discussion_phase == DiscussionPhase.FREE.value and target_phase == DiscussionPhase.CLOSING.value:
            return True
        elif discussion_phase == DiscussionPhase.CLOSING.value and target_phase == DiscussionPhase.VOTING.value:
            return self.discussion_have_all_spoken(game_state_id)
        elif discussion_phase == DiscussionPhase.VOTING.value and target_phase == DiscussionPhase.COMPLETED.value:
            index = 1 if phase == GamePhase.DISCUSSION_1.value else 2
            return self.discussion_have_all_voted(game_state_id, index)
        else:
            return False

    def discussion_transition(self, game_state_id: int, target_phase: str):
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        if not self.discussion_ready_to_transition(game_state_id, target_phase):
            raise RuntimeError(f"Not ready to transition discussion -> {target_phase}. Did all users speak?")
        if target_phase == DiscussionPhase.INTRODUCTION.value:
            pass
        elif target_phase == DiscussionPhase.FREE.value:
            query = f"UPDATE GameState SET discussion_speaker1 = NULL, discussion_speaker2 = NULL WHERE id = {_dbi(game_state_id)};"
            execute_post_query(PostQuery(query, ()))
        elif target_phase == DiscussionPhase.CLOSING.value:
            pass
        elif target_phase == DiscussionPhase.VOTING.value:
            query = f"UPDATE GameState SET discussion_speaker1 = NULL, discussion_speaker2 = NULL WHERE id = {_dbi(game_state_id)};"
            execute_post_query(PostQuery(query, ()))
        elif target_phase == DiscussionPhase.COMPLETED.value:
            query = f"SELECT phase FROM GameState WHERE id = {game_state_id};"
            phase = execute_query(query)[0][0]
            index = 1 if phase == GamePhase.DISCUSSION_1.value else 2
            self.discussion_determine_result(game_state_id, index)
        query = f"UPDATE GameState SET discussion_phase = {_dbs(target_phase)} WHERE id = {_dbi(game_state_id)};"
        execute_post_query(PostQuery(query, ()))

    def discussion_have_all_voted(self, game_state_id: int, index: int) -> bool:
        if not self.has_game_state(game_state_id):
            raise ValueError(f"No game state with id {game_state_id}.")
        voted_value_attr = "voted_value1" if index == 1 else "voted_value2"
        query = (f"SELECT COUNT(*) "
                 f"FROM Session INNER JOIN (User INNER JOIN Voting ON User.username = Voting.user) ON User.member_of = Session.session_id "
                 f"WHERE Session.game_state = {_dbi(game_state_id)} AND Voting.{voted_value_attr} IS NULL;")
        n = execute_query(query)[0][0]
        return n == 0

    def discussion_has_voted(self, username: str, parameter: str) -> bool:
        if not USER_MANAGER.has_user(username):
            raise NameError(f"No user with username {username}.")
        query = (f"SELECT GameState.id "
                 f"FROM GameState INNER JOIN (Session INNER JOIN User ON Session.session_id = User.member_of) ON GameState.id = Session.game_state "
                 f"WHERE User.username = {_dbs(username)};")
        game_state_id = execute_query(query)[0][0]
        query = f"SELECT phase, discussion_phase FROM GameState WHERE id = {_dbi(game_state_id)};"
        phase, discussion_phase = execute_query(query)[0]
        if phase != GamePhase.DISCUSSION_1.value and phase != GamePhase.DISCUSSION_2.value:
            raise RuntimeError("Game is not in discussion phase.")
        if discussion_phase != DiscussionPhase.VOTING.value:
            raise RuntimeError("Discussion is not in voting phase.")
        voted_value_attr = "voted_value1" if phase == GamePhase.DISCUSSION_1.value else "voted_value2"
        query = f"SELECT COUNT(*) FROM Voting WHERE user = {_dbs(username)} AND parameter = {_dbs(parameter)} AND {voted_value_attr} IS NOT NULL;"
        n = execute_query(query)[0][0]
        return n > 0

    def discussion_vote(self, username: str, parameter: str, voted_value: float):
        if not USER_MANAGER.has_user(username):
            raise NameError(f"No user with username {username}.")
        query = (f"SELECT GameState.id "
                 f"FROM GameState INNER JOIN (Session INNER JOIN User ON Session.session_id = User.member_of) ON GameState.id = Session.game_state "
                 f"WHERE User.username = {_dbs(username)};")
        game_state_id = execute_query(query)[0][0]
        query = f"SELECT phase, discussion_phase FROM GameState WHERE id = {_dbi(game_state_id)};"
        phase, discussion_phase = execute_query(query)[0]
        if phase != GamePhase.DISCUSSION_1.value and phase != GamePhase.DISCUSSION_2.value:
            raise RuntimeError("Game is not in discussion phase.")
        if discussion_phase != DiscussionPhase.VOTING.value:
            raise RuntimeError("Discussion is not in voting phase.")
        voted_value_attr = "voted_value1" if phase == GamePhase.DISCUSSION_1.value else "voted_value2"
        query = f"UPDATE Voting SET {voted_value_attr} = {_dbf(voted_value)} WHERE user = {_dbs(username)} AND parameter = {_dbs(parameter)};"
        execute_post_query(PostQuery(query, ()))

    def discussion_determine_result(self, game_state_id: int, index: int):
        # TODO: Average for now
        voted_value_attr = "voted_value1" if index == 1 else "voted_value2"
        choice_attr = "choice1" if index == 1 else "choice2"
        query = (f"SELECT Voting.parameter, Voting.{voted_value_attr}, User.buergerrat "
                 f"FROM Voting INNER JOIN (User INNER JOIN Session ON User.member_of = Session.session_id) ON Voting.user = User.username "
                 f"WHERE Session.game_state = {_dbi(game_state_id)};")
        votes_br1 = {}
        votes_br2 = {}
        for parameter, value, buergerrat in execute_query(query):
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
                query = (f"UPDATE controls SET {choice_attr} = {_dbf(avrg)} "
                         f"WHERE game_state = {_dbi(game_state_id)} AND parameter = {_dbs(parameter)} AND buergerrat = {_dbi(buergerrat)};")
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

    def configure_prototype_friday_trial(self, session_id: str):
        # Configure Users
        session = self.get_session(session_id)
        if len(session["memberUsernames"]) != 11:
            raise ValueError("For the prototype configuration a session needs exactly 10 users and one administrator.")

        query = f"SELECT name FROM RoleTable"  # TODO: Hard code assigned roles
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
        role_names = [row[0] for row in execute_query(query)]
        off = 0
        for username in session["memberUsernames"]:
            if username == session["administratorUsername"]:
                continue
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

    def configure_prototype(self, session_id: str, configuration: str):
        if configuration == PrototypeConfiguration.FRIDAY_TRIAL.value:
            self.configure_prototype_friday_trial(session_id)
        elif configuration == PrototypeConfiguration.FRIDAY_TRIAL_2_USERS.value:
            self.configure_prototype_friday_trial_2_users(session_id)


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
