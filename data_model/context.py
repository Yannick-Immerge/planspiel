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
    global _DB_CONTEXT
    _DB_CONTEXT = connect(
        host=hostname,
        port=port,
        user=username,
        password=password,
        database=db_name
    )


def close_db_context():
    _current_context().close()


def commit_db_context():
    _current_context().commit()


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


