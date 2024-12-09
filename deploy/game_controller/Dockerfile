FROM python:3.11-alpine
LABEL authors="immer"

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY shared ./shared
COPY services/game_controller ./services/game_controller
ENTRYPOINT [ "python", "./services/game_controller/run.py" ]