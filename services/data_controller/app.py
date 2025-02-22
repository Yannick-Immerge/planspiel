import sys
from pathlib import Path

from flask import Flask, request, jsonify

# Fix Path
_ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.append(str(_ROOT_DIR))

from services.data_controller.implementation import impl_roles_list, impl_roles_get, impl_metrics_get, \
    impl_parameters_get
from shared.architecture.rest import safe_call
from shared.data_model.context import initialize_db_context_default

initialize_db_context_default()

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

@app.route("/data/test")
def data_test():
    return "<p>Hello, from the Planspiel Data-Controller API!</p>"


@app.route("/data/roles/list", methods=["POST"])
def roles_list():
    return safe_call(impl_roles_list)

@app.route("/data/roles/get", methods=["POST"])
def roles_get_data():
    params = request.get_json()
    return safe_call(impl_roles_get, params["name"])

@app.route("/data/metrics/get", methods=["POST"])
def metrics_get():
    params = request.get_json()
    return safe_call(impl_metrics_get, params["simpleName"])

@app.route("/data/parameters/get", methods=["POST"])
def parameters_get():
    params = request.get_json()
    return safe_call(impl_parameters_get, params["simpleName"])
