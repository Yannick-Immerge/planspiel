import json
from pathlib import Path

from shared.data_model.context import PostQuery, execute_post_query, get_last_row_id, initialize_db_context, close_db_context

_BASE_PATH: Path = Path(__file__).parent


def make_insert(table_name: str, columns: str, values: list[str], args: tuple) -> PostQuery:
    fmt_values = ", ".join(map(lambda s: f"({s})", values))
    return PostQuery(f"INSERT INTO {table_name} ({columns}) VALUES {fmt_values};", args)


def collect_role_candidates() -> list[str]:
    """
    Collects all role names.
    :return: [Role Name]
    """
    with open(_BASE_PATH / "role_names.txt", "rt") as file:
        names = list(map(lambda s: s[:-1], file.readlines()))
    return names


def collect_scenario_candidates(candidates: list[str]) -> dict[str, list[str]]:
    """
    Collects all scenarios for the given role candidates.
    :param candidates: [Role Name]
    :return: [Role Name -> Scenario Name]
    """
    result = {}
    for role_name in candidates:
        role_path = _BASE_PATH / f"{role_name}.json"
        if not role_path.exists():
            continue

        with open(role_path) as file:
            obj = json.load(file)

        result[role_name] = obj["scenarios"]
    return result


def collect_attribute_candidates(candidates: list[str]) -> list[str]:
    """
    Collects all attributes for the given scenario candidates
    :param candidates: [Scenario Name]
    :return: [Attribute Name]
    """
    result = []
    for scenario_name in candidates:
        scenario_path = _BASE_PATH / "scenarios" / f"{scenario_name}.json"
        if not scenario_path.exists():
            continue

        with open(scenario_path, "rt") as file:
            obj = json.load(file)

        for serial in obj["conditions"]:
            result.append(serial["attribute"])
    return result


def load_resource_b(resource_name: str) -> bytes:
    with open(_BASE_PATH / "resources" / resource_name, "rb") as file:
        obj = file.read()
    return obj


def load_resource_t(resource_name: str) -> str:
    with open(_BASE_PATH / "resources" / resource_name, "rt") as file:
        obj = file.read()
    return obj


def make_role_post_queries(candidates: list[str]) -> dict[str, PostQuery]:
    """

    :param candidates: [Role Name] List, containing all role names.
    :return:
    """
    roles = {}
    for role_name in candidates:
        role_path = _BASE_PATH / f"{role_name}.json"
        if not role_path.exists():
            continue

        with open(role_path) as file:
            obj = json.load(file)

        name = obj["name"]
        description = obj["description"]
        roles[role_name] = make_insert(
            "RoleTable",
            "name, description",
            [f"\"{name}\", \"{description}\""],
            ()
        )
    return roles


def make_role_entry_post_queries(candidates: list[str], role_map: dict[str, int]) -> dict[str, list[PostQuery]]:
    """

    :param candidates: [Role Name] List, containing all role names.
    :param role_map:
    :return:
    """
    role_entries = {}
    for role_name in candidates:
        role_path = _BASE_PATH / "roles" / f"{role_name}.json"
        if not role_path.exists():
            continue

        with open(role_path, "rt") as file:
            obj = json.load(file)

        role_group = []
        for serial in obj["entries"]:
            describes = role_map[role_name]
            type_ = serial["type"]
            text_content = load_resource_t(serial["text_content"])
            binary_content = load_resource_t(serial["binary_content"])
            role_group.append(make_insert(
                "RoleEntryTable",
                "describes, type, text_content, binary_content",
                [f"{describes}, \"{type_}\", \"%s\", %s"],
                (text_content, binary_content)
            ))
        role_entries[role_name] = role_group
    return role_entries


def make_scenario_post_queries(candidates: dict[str, list[str]], role_map: dict[str, int]) -> dict[str, PostQuery]:
    """

    :param candidates: [Role Name -> [Scenario Name]] List, containing all scenario names.
    :param role_map: [Role Name -> Role Row ID] Map
    :return:
    """
    scenarios = {}
    for role_name in candidates:
        for scenario_name in candidates[role_name]:
            scenario_path = _BASE_PATH / "scenarios" / f"{scenario_name}.json"
            if not scenario_path.exists():
                continue

            with open(scenario_path, "rt") as file:
                obj = json.load(file)

            belongs_to = role_map[role_name]
            type_ = obj["type"]
            text_content = None if obj["text_content"] is None else load_resource_t(obj["text_content"])
            binary_content = None if obj["binary_content"] is None else load_resource_b(obj["binary_content"])
            scenarios[scenario_name] = make_insert(
                "ScenarioTable",
                "belongs_to, type, text_content, binary_content",
                [f"{belongs_to}, \"{type_}\", \"%s\", %s"],
                (text_content, binary_content)
            )

    return scenarios


def make_attribute_post_queries(candidates: list[str]) -> dict[str, PostQuery]:
    """

    :param candidates: [Attribute Name]
    :return:
    """
    attributes = {}
    with open(_BASE_PATH / "attributes.json", "rt") as file:
        obj = json.load(file)

    for serial in obj:
        simple_name = serial["simple_name"]
        if simple_name not in candidates:
            continue
        en_roads_name = serial["en_roads_name"]
        description = serial["en_roads_name"]
        icon = None if serial["icon"] is None else load_resource_b(serial["icon"])
        attributes[simple_name] = make_insert(
            "AttributeTable",
            "simple_name, en_roads_name, description, icon",
            [f"\"{simple_name}\", \"{en_roads_name}\", \"{description}\", %s"],
            (icon,)
        )
    return attributes


def make_scenario_condition_post_queries(candidates: list[str], attribute_map: dict[str, int]) -> dict[str, list[PostQuery]]:
    """

    :param candidates: [Scenario Name] List, containing all scenario names.
    :param attribute_map:
    :return:
    """
    scenario_conditions = {}
    for scenario_name in candidates:
        scenario_path = _BASE_PATH / "scenarios" / f"{scenario_name}.json"
        if not scenario_path.exists():
            continue

        with open(scenario_path, "rt") as file:
            obj = json.load(file)

        scenario_group = []
        for serial in obj["conditions"]:
            attribute_id = attribute_map[serial["attribute"]]
            min_value = serial["min_value"]
            max_value = serial["max_value"]
            scenario_group.append(make_insert(
                "ScenarioConditionTable",
                "attribute, min_value, max_value",
                [f"{attribute_id}, {min_value}, {max_value}"],
                ()
            ))
        scenario_conditions[scenario_name] = scenario_group
    return scenario_conditions


def make_require_post_queries(candidates: list[str], scenario_map: dict[str, int],
                              scenario_condition_map: dict[str, list[int]]) -> list[PostQuery]:
    """

    :param candidates: [Scenario Name] List, containing all scenario names.
    :param scenario_map:
    :param scenario_condition_map:
    :return:
    """
    require = []
    for scenario_name in candidates:
        scenario_id = scenario_map[scenario_name]
        for cond_id in scenario_condition_map[scenario_name]:
            require.append(make_insert(
                "RequireTable",
                "cond_id, scenario_id",
                [f"{cond_id}, {scenario_id}"],
                ()
            ))
    return require


def post_list(posts: list[PostQuery]):
    for query in posts:
        execute_post_query(query)


def post_and_map(posts: dict[str, PostQuery]) -> dict[str, int]:
    ids = {}
    for name in posts:
        execute_post_query(posts[name])
        ids[name] = get_last_row_id()
    return ids


def post_and_map_list(posts: dict[str, list[PostQuery]]) -> dict[str, list[int]]:
    ids = {}
    for name in posts:
        id_group = []
        for query in posts[name]:
            execute_post_query(query)
            id_group.append(get_last_row_id())
        ids[name] = id_group
    return ids


def post_roles():
    # Collect
    role_candidates = collect_role_candidates()
    role_and_scenario_candidates = collect_scenario_candidates(role_candidates)
    scenario_candidates = []
    for scenarios in role_and_scenario_candidates.values():
        scenario_candidates.extend(scenarios)
    attribute_candidates = collect_attribute_candidates(scenario_candidates)

    # Make & Perform queries in order
    role_queries = make_role_post_queries(role_candidates)
    role_map = post_and_map(role_queries)
    role_entry_queries = make_role_entry_post_queries(role_candidates, role_map)
    _ = post_and_map_list(role_entry_queries)
    scenario_queries = make_scenario_post_queries(role_and_scenario_candidates, role_map)
    scenario_map = post_and_map(scenario_queries)
    attribute_queries = make_attribute_post_queries(attribute_candidates)
    attribute_map = post_and_map(attribute_queries)
    scenario_condition_queries = make_scenario_condition_post_queries(scenario_candidates, attribute_map)
    scenario_condition_map = post_and_map_list(scenario_condition_queries)
    require_queries = make_require_post_queries(scenario_candidates, scenario_map, scenario_condition_map)
    post_list(require_queries)


if __name__ == "__main__":
    initialize_db_context("localhost", 3306, "mydatabase", "admin", "admin")
    post_roles()
    close_db_context()