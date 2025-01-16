FROM python:3.11-bullseye
LABEL authors="immer"

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y default-mysql-client && apt-get clean

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY shared ./shared
COPY prototype_roles/interface.py ./prototype_roles/interface.py
COPY prototype_roles/serial.json ./prototype_roles/serial.json
COPY scripts ./scripts
RUN chmod +x ./scripts/initialize_db.sh

ENTRYPOINT [ "./scripts/initialize_db.sh" ]