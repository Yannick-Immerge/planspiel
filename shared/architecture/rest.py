import traceback
from dataclasses import dataclass
from enum import Enum, auto
from traceback import print_exc
from typing import Any, Callable

import requests
from flask import Flask, request, jsonify, Response

LOCAL_SERVER_ADDR_HTTP = "http://localhost"
GAME_CONTROLLER_SERVER_PORT = "5002"
DATA_CONTROLLER_SERVER_PORT = "5001"


class Microservice(Enum):
    DATA_CONTROLLER = auto()
    GAME_CONTROLLER = auto()

    def build_url(self, endpoint: str) -> str:
        assert endpoint.startswith("/"), "Include leading slash in endpoints."
        if self == Microservice.DATA_CONTROLLER:
            return f"{LOCAL_SERVER_ADDR_HTTP}:{DATA_CONTROLLER_SERVER_PORT}{endpoint}"
        elif self == Microservice.GAME_CONTROLLER:
            return f"{LOCAL_SERVER_ADDR_HTTP}:{GAME_CONTROLLER_SERVER_PORT}{endpoint}"
        else:
            raise ValueError("Unknown Microservice targeted.")


class AuthError(Exception):
    pass


@dataclass
class ApiResponse:
    data: Any | None
    ok: bool
    authentication_ok: bool
    status_text: str


def call_api(target: Microservice, endpoint: str, params: Any) -> ApiResponse:
    response = requests.post(target.build_url(endpoint), json=params)
    ok = response.status_code == 200
    if not ok:
        return ApiResponse(None, False, response.status_code != 401, response.text)
    return ApiResponse(response.json(), True, True, "")


def safe_call(cb, *args) -> Response:
    try:
        data = cb(*args)
        ok = True
        authentication_ok = True
        status_text = ""
    except AuthError:
        data = None
        ok = False
        authentication_ok = False
        status_text = "Authentication error"
    except Exception as exc:
        data = None
        ok = False
        authentication_ok = True
        status_text = f"Error: {exc}"
        print_exc()
    response = jsonify({
        "data": data,
        "ok": ok,
        "authenticationOk": authentication_ok,
        "statusText": status_text
    })
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.status_code = 200
    return response
