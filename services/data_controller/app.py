import sys
from pathlib import Path

from flask import Flask

# Fix Path
_ROOT_DIR = Path(__file__).parent.parent.parent
sys.path.append(str(_ROOT_DIR))

app = Flask(__name__)

@app.route("/data/test")
def data_test():
    return "<p>Hello, from the Planspiel Data-Controller API!</p>"