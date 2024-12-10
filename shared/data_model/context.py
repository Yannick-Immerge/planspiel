from __future__ import annotations

import os
from typing import Any

from mysql.connector import connect
from mysql.connector.abstracts import MySQLConnectionAbstract, MySQLCursorAbstract

_DB_CONTEXT: MySQLConnectionAbstract | None = None
_DB_CURSOR: MySQLCursorAbstract | None = None


def _current_context() -> MySQLConnectionAbstract:
    if _DB_CONTEXT is None:
        raise RuntimeError("The database context has not been initialized.")
    return _DB_CONTEXT


def _current_cursor() -> MySQLCursorAbstract:
    if _DB_CURSOR is None:
        raise RuntimeError("The database cursor has not been retrieved.")
    return _DB_CURSOR


class PostQuery:
    query: str
    args: tuple

    def __init__(self, query: str, args: tuple):
        self.query = query
        self.args = args

    @staticmethod
    def merge(q1: PostQuery, q2: PostQuery):
        return PostQuery(q1.query + q2.query, tuple([*q1.args, *q2.args]))


def initialize_db_context(hostname: str, port: int, db_name: str, username: str, password: str):
    """
    Initializes a connection to the mySQL backend hosted at the given server using the given credentials.
    :param hostname:
    :param port:
    :param db_name:
    :param username:
    :param password:
    :return:
    """
    global _DB_CONTEXT, _DB_CURSOR
    _DB_CONTEXT = connect(
        host=hostname,
        port=port,
        user=username,
        password=password,
        database=db_name
    )
    _DB_CURSOR = _DB_CONTEXT.cursor()


def initialize_db_context_default():
    env_host = os.getenv("DATABASE_HOST")
    env_port = os.getenv("DATABASE_PORT")
    env_user = os.getenv("DATABASE_USER")
    initialize_db_context(
       "localhost" if env_host is None else env_host,
        3306 if env_port is None else int(env_port),
        "mydatabase",
        "admin" if env_user is None else env_user,
        "admin",
    )


def close_db_context():
    _current_context().close()


def commit_db_context():
    _current_context().commit()


def assure_connection(retries : int = 3):
    n = 0
    while n <= retries:
        if _DB_CONTEXT.is_connected():
            return
        try:
            print("Try reconnect!")
            _DB_CONTEXT.reconnect()
        finally:
            n += 1
    raise RuntimeError("Database is currently not available!")


def execute_bool_query(bool_query: str) -> bool:
    assure_connection()
    _current_cursor().execute(bool_query, ())
    return _current_cursor().fetchone()[0] == 1


def execute_void_query(void_query: str) -> None:
    assure_connection()

    _current_cursor().execute(void_query, ())


def execute_query(query: str) -> Any:
    assure_connection()

    _current_cursor().execute(query, ())
    return _current_cursor().fetchall()


def execute_post_query(post_query: PostQuery):
    assure_connection()

    _current_cursor().execute(post_query.query, post_query.args)
    commit_db_context()


def get_last_row_id() -> int:
    v = _current_cursor().lastrowid
    if v is None:
        raise RuntimeError("It seems like there was no call to INSERT in this session.")
    return v


def get_record_by_id(table: str, id: int, names: tuple[str]):
    """
    Accesses a table and selects the names from the record with the given id.
    :param table:
    :param id:
    :param names:
    :return:
    """
    query = f"FROM {table} SELECT {names} WHERE id = {id};"
    _current_cursor().execute(query, ())
    return _current_cursor().fetchone()


