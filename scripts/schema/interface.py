"""
Fetch queries from this directory as python strings.
"""
from pathlib import Path

from shared.data_model.context import Query

_SCHEMA_DIR: Path = Path(__file__).parent


def load_query(query_name: str) -> Query:
    path = _SCHEMA_DIR / f"{query_name}.sql"
    if not path.exists():
        raise NameError(f"Unsupported query name: {query_name}.")
    with open(path, "rt") as file:
        query = file.read()
    return Query(query, ())


def fetch_table_names() -> list[str]:
    with open(_SCHEMA_DIR / "table_names.txt", "rt") as file:
        names = []
        for line in file.readlines():
            line = line.strip()
            if line == "":
                continue
            names.append(line)
    return names


def get_check_name_query(table_name) -> Query:
    return Query(
        f"SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_NAME = %s;",
        (table_name,)
    )


def get_drop_query(table_name) -> Query:
    return Query(
        f"DROP TABLE IF EXISTS {table_name};",
        ()
    )
