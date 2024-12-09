import os

from app import app

if __name__ == "__main__":
    print("Starting Game Controller.")
    app.run("0.0.0.0", int(os.getenv("PLANSPIEL_GAME_CONTROLLER_PORT")))
