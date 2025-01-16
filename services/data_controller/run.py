import os

from app import app

if __name__ == "__main__":
    print("Starting Data Controller.")
    app.run("0.0.0.0", int(os.getenv("PLANSPIEL_DATA_CONTROLLER_PORT")), threaded=True)
