if [ -z $PLANSPIEL_DATA_CONTROLLER_PORT ]; then
  echo "WARN: The environment variable \"PLANSPIEL_DATA_CONTROLLER_PORT\" has to be configured."
else
  echo "Run Data controller on 0.0.0.0 and port: ${PLANSPIEL_DATA_CONTROLLER_PORT}"
  nohup flask run --host=0.0.0.0 --port=${PLANSPIEL_DATA_CONTROLLER_PORT} > flask.log 2>&1 &
fi
