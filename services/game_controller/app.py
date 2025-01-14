import sys
from pathlib import Path

from flask import Flask, request, jsonify

# Fix Path
_ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.append(str(_ROOT_DIR))

from services.game_controller.implementation import impl_users_create, impl_users_exists, impl_users_view, \
    impl_users_login, impl_users_logout, impl_users_update_password, impl_sessions_create, \
    impl_sessions_exists, impl_sessions_view, impl_sessions_get, impl_sessions_status, impl_users_configure, \
    impl_users_has_password, impl_sessions_configure_prototype, impl_game_state_get, \
    impl_game_state_ready_to_transition, impl_game_state_transition, impl_game_state_is_fact_applicable, \
    impl_game_state_is_post_applicable, impl_game_state_voting_commit, impl_game_state_voting_get_status, \
    impl_game_state_voting_update, impl_game_state_voting_overview
from shared.architecture.rest import safe_call
from shared.data_model.context import initialize_db_context_default

initialize_db_context_default()

app = Flask(__name__)

@app.before_request
def handle_options():
    print(f"Running: {request.path}")
    if request.method == "OPTIONS":
        response = jsonify()  # Empty response body
        response.headers.add("Allow", "GET, POST, OPTIONS")  # Adjust methods as needed
        response.headers.add("Access-Control-Allow-Origin", "*")  # CORS headers
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Max-Age", "3600")  # Cache for 1 hour
        response.status_code = 204  # No Content
        return response

@app.route("/game/test")
def game_test():
    return "<p>Hello, from the Planspiel Game-Controller API!</p>"


@app.route("/game/users/create", methods=["POST"])
def users_create():
    params = request.get_json()
    return safe_call(impl_users_create, params["administratorUsername"], params["administratorToken"])

@app.route("/game/users/has_password", methods=["POST"])
def users_has_password():
    params = request.get_json()
    return safe_call(impl_users_has_password, params["username"])

@app.route("/game/users/configure", methods=["POST"])
def users_configure():
    params = request.get_json()
    return safe_call(impl_users_configure, params["administratorUsername"], params["administratorToken"], params["targetUsername"], params["assignedRoleId"], params["assignedBuergerrat"])

@app.route("/game/users/exists", methods=["POST"])
def users_exists():
    params = request.get_json()
    return safe_call(impl_users_exists, params["username"])


@app.route("/game/users/view", methods=["POST"])
def users_view():
    params = request.get_json()
    return safe_call(impl_users_view, params["username"])


@app.route("/game/users/login", methods=["POST"])
def users_login():
    params = request.get_json()
    return safe_call(impl_users_login, params["username"], params["passwordHash"])


@app.route("/game/users/logout", methods=["POST"])
def users_logout():
    params = request.get_json()
    return safe_call(impl_users_logout, params["username"], params["token"])


@app.route("/game/users/update_password", methods=["POST"])
def users_update_password():
    params = request.get_json()
    return safe_call(impl_users_update_password, params["administratorUsername"], params["administratorToken"], params["targetUsername"], params["newPasswordHash"])


@app.route("/game/sessions/create", methods=["POST"])
def sessions_create():
    params = request.get_json()
    return safe_call(impl_sessions_create, params["productKey"], params["administratorPasswordHash"])


@app.route("/game/sessions/exists", methods=["POST"])
def sessions_exists():
    params = request.get_json()
    return safe_call(impl_sessions_exists, params["administratorUsername"], params["administratorToken"])


@app.route("/game/sessions/view", methods=["POST"])
def sessions_view():
    params = request.get_json()
    return safe_call(impl_sessions_view, params["administratorUsername"], params["administratorToken"])


@app.route("/game/sessions/get", methods=["POST"])
def sessions_get():
    params = request.get_json()
    return safe_call(impl_sessions_get, params["administratorUsername"], params["administratorToken"])


@app.route("/game/sessions/status", methods=["POST"])
def sessions_status():
    params = request.get_json()
    return safe_call(impl_sessions_status, params["administratorUsername"], params["administratorToken"], params["status"])


@app.route("/game/sessions/configure_prototype", methods=["POST"])
def sessions_configure_prototype():
    params = request.get_json()
    return safe_call(impl_sessions_configure_prototype, params["configuration"], params["administratorUsername"], params["administratorToken"])


@app.route("/game/game_state/get", methods=["POST"])
def game_state_get():
    params = request.get_json()
    return safe_call(impl_game_state_get, params["username"], params["token"])


@app.route("/game/game_state/ready_to_transition", methods=["POST"])
def game_state_ready_to_transition():
    params = request.get_json()
    return safe_call(impl_game_state_ready_to_transition, params["targetPhase"], params["administratorUsername"], params["administratorToken"])


@app.route("/game/game_state/transition", methods=["POST"])
def game_state_transition():
    params = request.get_json()
    return safe_call(impl_game_state_transition, params["targetPhase"], params["administratorUsername"], params["administratorToken"])

@app.route("/game/game_state/is_fact_applicable", methods=["POST"])
def game_state_is_fact_applicable():
    params = request.get_json()
    return safe_call(impl_game_state_is_fact_applicable, params["name"], params["username"], params["token"])

@app.route("/game/game_state/is_post_applicable", methods=["POST"])
def game_state_is_post_applicable():
    params = request.get_json()
    return safe_call(impl_game_state_is_post_applicable, params["name"], params["username"], params["token"])

@app.route("/game/game_state/voting/get_status", methods=["POST"])
def game_state_voting_get_status():
    params = request.get_json()
    return safe_call(impl_game_state_voting_get_status, params["username"], params["token"])

@app.route("/game/game_state/voting/update", methods=["POST"])
def game_state_voting_update():
    params = request.get_json()
    return safe_call(impl_game_state_voting_update, params["parameter"], params["votedValue"], params["username"], params["token"])

@app.route("/game/game_state/voting/commit", methods=["POST"])
def game_state_voting_commit():
    params = request.get_json()
    return safe_call(impl_game_state_voting_commit, params["parameter"], params["username"], params["token"])

@app.route("/game/game_state/voting/overview", methods=["POST"])
def game_state_voting_overview():
    params = request.get_json()
    return safe_call(impl_game_state_voting_overview, params["administratorUsername"], params["administratorToken"])

