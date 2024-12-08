import sys
from pathlib import Path

from flask import Flask, request, jsonify

# Fix Path
_ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.append(str(_ROOT_DIR))

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