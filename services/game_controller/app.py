from flask import Flask

app = Flask(__name__)

@app.route("/game/test")
def data_test():
    return "<p>Hello, from the Planspiel Data-Controller API!</p>"