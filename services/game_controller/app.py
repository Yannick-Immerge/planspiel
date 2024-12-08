import sys
from pathlib import Path

from flask import Flask, request, jsonify

# Fix Path
_ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.append(str(_ROOT_DIR))

from services.game_controller.implementation import impl_users_create, impl_users_exists, impl_users_view, \
    impl_users_login, impl_users_logout, impl_users_update_password, impl_sessions_create, \
    impl_sessions_exists, impl_sessions_view, impl_sessions_get, impl_sessions_status, impl_users_configure
from shared.architecture.rest import safe_call

app = Flask(__name__)

@app.before_request
def handle_options():
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
def data_test():
    return "<p>Hello, from the Planspiel Data-Controller API!</p>"


@app.route("/game/users/create", methods=["POST"])
def users_create():
    params = request.get_json()
    return safe_call(impl_users_create, params["sessionId"], params["passwordHash"])

@app.route("/game/users/configure", methods=["POST"])
def users_configure():
    params = request.get_json()
    return safe_call(impl_users_configure, params["username"], params["assignedRoleId"], params["assignedBuergerrat"])

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
    return safe_call(impl_users_update_password, params["username"], params["token"], params["oldPasswordHash"], params["newPasswordHash"])


@app.route("/game/sessions/create", methods=["POST"])
def sessions_create():
    params = request.get_json()
    return safe_call(impl_sessions_create, params["productKey"], params["administratorPasswordHash"])


@app.route("/game/sessions/exists", methods=["POST"])
def sessions_exists():
    params = request.get_json()
    return safe_call(impl_sessions_exists, params["sessionId"])


@app.route("/game/sessions/view", methods=["POST"])
def sessions_view():
    params = request.get_json()
    return safe_call(impl_sessions_view, params["sessionId"])


@app.route("/game/sessions/get", methods=["POST"])
def sessions_get():
    params = request.get_json()
    return safe_call(impl_sessions_get, params["sessionId"], params["administratorUsername"], params["administratorToken"])


@app.route("/game/sessions/status", methods=["POST"])
def sessions_status():
    params = request.get_json()
    return safe_call(impl_sessions_status, params["sessionId"], params["administratorUsername"],
                         params["administratorToken"], params["status"])


if __name__ == "__main__":
    app.run(port=5002, debug=True)
