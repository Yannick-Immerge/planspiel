if [ -z $PLANSPIEL_GAME_CONTROLLER_PORT ]; then
  echo "WARN: The environment variable \"PLANSPIEL_GAME_CONTROLLER_PORT\" has to be configured."
else
  echo "Run Data controller on 0.0.0.0 and port: ${PLANSPIEL_GAME_CONTROLLER_PORT}"
  flask run --host 0.0.0.0 -p ${PLANSPIEL_GAME_CONTROLLER_PORT}
fi
