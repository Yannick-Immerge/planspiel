"""
Entry point into the FLASK application.
"""

from flask import Flask

app = Flask(__name__)


@app.route("/")
def landing():
    return "Hello, World!"