import json
import re
from pathlib import Path
from typing import Iterable

import pydantic

from shared.data_model.context import PostQuery, execute_post_query

_BASE_PATH: Path = Path(__file__).parent
_METRICS_PATH = _BASE_PATH / "metrics.json"
_PARAMETERS_PATH = _BASE_PATH / "parameters.json"
_ROLE_NAMES_PATH = _BASE_PATH / "role_names.txt"
_CONDITIONS_PATH = _BASE_PATH / "conditions"
_SCENARIOS_PATH = _BASE_PATH / "scenarios"


_POST_IMAGE_NAME_REGEX = r"picture_[0-9]+\.png"


def _dbs(value: str | None) -> str:
    return "NULL" if value is None else f"\"{value}\""

def _dbf(value: float | None) -> str:
    return "NULL" if value is None else f"{value}"

def _dbb(value: bool | None) -> str:
    return "NULL" if value is None else ("TRUE" if value else "FALSE")


def load_role_names() -> list[str]:
    with open(_ROLE_NAMES_PATH, "rt") as file:
        names = []
        for line in file.readlines():
            line = line.strip()
            if line == "":
                continue
            names.append(line)
    return names


class ParameterDefinition(pydantic.BaseModel):
    simpleName: str
    description: str
    minValue: float
    maxValue: float

    def collect_queries(self) -> list[PostQuery]:
        query = (f"INSERT INTO Parameter(simple_name, description, min_value, max_value) "
                 f"VALUES ({_dbs(self.simpleName)}, {_dbs(self.description)}, {_dbf(self.minValue)}, {_dbf(self.maxValue)});")
        return [PostQuery(query, ())]


def load_all_parameters() -> list[ParameterDefinition]:
    with open(_PARAMETERS_PATH, "rt") as file:
        data = json.load(file)
    all_parameters = [ParameterDefinition(**item) for item in data]
    return [parameter for parameter in all_parameters]


class MetricDefinition(pydantic.BaseModel):
    simpleName: str
    description: str
    minValue: float
    maxValue: float

    def collect_queries(self) -> list[PostQuery]:
        query = (f"INSERT INTO Metric(simple_name, description, min_value, max_value) "
                 f"VALUES ({_dbs(self.simpleName)}, {_dbs(self.description)}, {_dbf(self.minValue)}, {_dbf(self.maxValue)});")
        return [PostQuery(query, ())]


def load_all_metrics() -> list[MetricDefinition]:
    with open(_METRICS_PATH, "rt") as file:
        data = json.load(file)
    return [MetricDefinition(**item) for item in data]


class ScenarioConditionDefinition(pydantic.BaseModel):
    name: str
    metric: str
    minValue: float | None
    maxValue: float | None

    def collect_queries(self) -> list[PostQuery]:
        query = (f"INSERT INTO ScenarioCondition(name, metric, min_value, max_value) "
                 f"VALUES ({_dbs(self.name)}, {_dbs(self.metric)}, {_dbf(self.minValue)}, {_dbf(self.maxValue)});")
        return [PostQuery(query, ())]


def load_scenario_conditions(scenario_condition_names: Iterable[str]) -> list[ScenarioConditionDefinition]:
    scenario_conditions = []
    for scenario_condition_name in scenario_condition_names:
        path = _CONDITIONS_PATH / f"{scenario_condition_name}.json"
        if not path.exists():
            raise NameError(f"No scenario condition for name {scenario_condition_name}.")
        with open(path, "rt") as file:
            data = json.load(file)
            scenario_condition = ScenarioConditionDefinition(**data)
            if scenario_condition.name != scenario_condition_name:
                raise ValueError(f"The name provided in the scenario condition: {scenario_condition.name} does not match the expected: {scenario_condition_name}.")
        scenario_conditions.append(scenario_condition)
    return scenario_conditions


class PostDefinitionMetadata(pydantic.BaseModel):
    type: str
    isScenario: bool
    conditions: list[str]

    @pydantic.field_validator("type", mode="after")
    @classmethod
    def ensure_type(cls, v: str) -> str:
        if v not in ["by_me", "i_liked", "got_tagged"]:
            raise ValueError(f"Unsupported post type: {v}.")
        return v


class PostDefinition:
    name: str
    metadata: PostDefinitionMetadata
    text_de_identifier: str
    text_orig_identifier: str
    image_identifiers: list[str]
    belongs_to: str

    def __init__(self, definition_path: Path, prefix: str, belongs_to: str):
        self.name = definition_path.name
        prefix = f"{prefix}/{self.name}"
        self.belongs_to = belongs_to
        with open(definition_path / "post.json", "rt") as file:
            data = json.load(file)
        if data is None:
            raise RuntimeError(f"Could not load metadata for post at {definition_path}.")
        self.metadata = PostDefinitionMetadata(**data)
        if not (definition_path / "text_de.md").exists():
            raise RuntimeError(f"The post definition at {definition_path} doesnt contain a text_de.md file.")
        self.text_de_identifier = f"{prefix}/text_de.md"
        if not (definition_path / "text_orig.md").exists():
            raise RuntimeError(f"The post definition at {definition_path} doesnt contain a text_orig.md file.")
        self.text_orig_identifier = f"{prefix}/text_orig.md"
        self.image_identifiers = []
        for child in definition_path.iterdir():
            if child.is_file() and re.fullmatch(_POST_IMAGE_NAME_REGEX, child.name) is not None:
                self.image_identifiers.append("/".join([prefix, child.name]))

    def collect_required_conditions(self) -> list[str]:
        return self.metadata.conditions

    def collect_queries(self) -> list[PostQuery]:
        # Post <- PostImage <- Post_depends_on
        queries = []
        query = (f"INSERT INTO Post(name, belongs_to, text_de_identifier, text_orig_identifier, type, is_scenario) "
                 f"VALUES ({_dbs(self.name)}, {_dbs(self.belongs_to)}, {_dbs(self.text_de_identifier)}, "
                 f"{_dbs(self.text_orig_identifier)}, {_dbs(self.metadata.type)}, {_dbb(self.metadata.isScenario)})")
        queries.append(PostQuery(query, ()))
        for image_identifier in self.image_identifiers:
            query = (f"INSERT INTO PostImage(image_identifier, post) "
                     f"VALUES ({_dbs(image_identifier)}, {_dbs(self.name)});")
            queries.append(PostQuery(query, ()))
        for scenario_condition in self.metadata.conditions:
            query = (f"INSERT INTO Post_depends_on(post, scenario_condition) "
                     f"VALUES ({_dbs(self.name)}, {_dbs(scenario_condition)});")
            queries.append(PostQuery(query, ()))
        return queries


class FactDefinitionMetadata(pydantic.BaseModel):
    hyperlink: str
    isScenario: bool
    conditions: list[str]


class FactDefinition:
    name: str
    metadata: FactDefinitionMetadata
    text_identifier: str
    belongs_to: str

    def __init__(self, definition_path: Path, prefix: str, belongs_to: str):
        self.name = definition_path.name
        prefix = f"{prefix}/{self.name}"
        self.belongs_to = belongs_to
        with open(definition_path / "fact.json", "rt") as file:
            data = json.load(file)
        if data is None:
            raise RuntimeError(f"Could not load metadata for fact at {definition_path}.")
        self.metadata = FactDefinitionMetadata(**data)
        if not (definition_path / "text.md").exists():
            raise RuntimeError(f"The fact definition at {definition_path} doesnt contain a text.md file.")
        self.text_identifier = f"{prefix}/text.md"

    def collect_required_conditions(self) -> list[str]:
        return self.metadata.conditions

    def collect_queries(self) -> list[PostQuery]:
        # Fact <- Fact_depends_on
        queries = []
        query = (f"INSERT INTO Fact(name, belongs_to, text_identifier, hyperlink, is_scenario) "
                 f"VALUES ({_dbs(self.name)}, {_dbs(self.belongs_to)}, {_dbs(self.text_identifier)}, "
                 f"{_dbs(self.metadata.hyperlink)}, {_dbb(self.metadata.isScenario)})")
        queries.append(PostQuery(query, ()))
        for scenario_condition in self.metadata.conditions:
            query = (f"INSERT INTO Fact_depends_on(fact, scenario_condition) "
                     f"VALUES ({_dbs(self.name)}, {_dbs(scenario_condition)});")
            queries.append(PostQuery(query, ()))
        return queries


class RoleMetadata(pydantic.BaseModel):
    name: str
    birthday: str
    living: str
    status: str


class RoleDefinition:
    name: str
    metadata: RoleMetadata
    profile_picture_identifier: str
    profile_picture_old_identifier: str
    titlecard_identifier: str
    info_identifier: str
    facts: list[FactDefinition]
    posts: list[PostDefinition]

    def __init__(self, definition_path: Path, prefix: str):
        self.name = definition_path.name
        prefix = f"{prefix}/{self.name}"
        with open(definition_path / "metadata.json", "rt") as file:
            data = json.load(file)
        if data is None:
            raise RuntimeError(f"Could not load metadata for role at {definition_path}.")
        self.metadata = RoleMetadata(**data)
        if not (definition_path / "profile_picture.png").exists():
            raise RuntimeError(f"The role definition at {definition_path} doesnt contain a profile_picture.png file.")
        self.profile_picture_identifier = f"{prefix}/profile_picture.png"
        if not (definition_path / "profile_picture_old.png").exists():
            raise RuntimeError(f"The role definition at {definition_path} doesnt contain a profile_picture_old.png file.")
        self.profile_picture_old_identifier = f"{prefix}/profile_picture_old.png"
        if not (definition_path / "titlecard.png").exists():
            raise RuntimeError(f"The role definition at {definition_path} doesnt contain a titlecard.png file.")
        self.titlecard_identifier = f"{prefix}/titlecard.png"
        if not (definition_path / "info.md").exists():
            raise RuntimeError(f"The role definition at {definition_path} doesnt contain a info.md file.")
        self.info_identifier = f"{prefix}/info.md"

        fact_folder = definition_path / "facts"
        if not fact_folder.exists() or not fact_folder.is_dir():
            raise RuntimeError(f"Expected {fact_folder} to be a directory and exist.")
        self.facts = []
        for child in fact_folder.iterdir():
            if not child.is_dir():
                raise RuntimeError(f"Expected only folders in {fact_folder} but {child} is not a folder.")
            self.facts.append(FactDefinition(child, prefix, self.name))

        post_folder = definition_path / "posts"
        if not post_folder.exists() or not post_folder.is_dir():
            raise RuntimeError(f"Expected {post_folder} to be a directory and exist.")
        self.posts = []
        for child in post_folder.iterdir():
            if not child.is_dir():
                raise RuntimeError(f"Expected only folders in {post_folder} but {child} is not a folder.")
            self.posts.append(PostDefinition(child, prefix, self.name))

    def collect_required_conditions(self) -> list[str]:
        total = []
        for fact in self.facts:
            total += fact.collect_required_conditions()
        for post in self.posts:
            total += post.collect_required_conditions()
        return total

    def collect_queries(self) -> list[PostQuery]:
        # RoleTable <- [Fact... ] <- [Post... ]
        queries = []
        query = (f"INSERT INTO RoleTable(name, meta_name, meta_birthday, meta_living, meta_status, "
                 f"profile_picture_identifier, profile_picture_old_identifier, titlecard_identifier, info_identifier) "
                 f"VALUES ({_dbs(self.name)}, {_dbs(self.metadata.name)}, {_dbs(self.metadata.birthday)}, "
                 f"{_dbs(self.metadata.living)}, {_dbs(self.metadata.status)}, "
                 f"{_dbs(self.profile_picture_identifier)}, {_dbs(self.profile_picture_old_identifier)}, "
                 f"{_dbs(self.titlecard_identifier)}, {_dbs(self.info_identifier)});")
        queries.append(PostQuery(query, ()))
        for fact in self.facts:
            queries += fact.collect_queries()
        for post in self.posts:
            queries += post.collect_queries()
        return queries


def load_roles(role_names: Iterable[str]) -> list[RoleDefinition]:
    roles = []
    for role_name in role_names:
        path = _BASE_PATH / role_name
        if not path.exists() or not path.is_dir():
            raise RuntimeError(f"Expected role definition folder at {path}.")
        roles.append(RoleDefinition(path, "roles"))
    return roles


def collect_queries() -> list[PostQuery]:
    queries = []
    for metric in load_all_metrics():
        queries += metric.collect_queries()
    for parameter in load_all_parameters():
        queries += parameter.collect_queries()
    role_names = load_role_names()
    roles = load_roles(role_names)
    scenario_condition_names = []
    for role in roles:
        scenario_condition_names += role.collect_required_conditions()
    for scenario_condition in load_scenario_conditions(scenario_condition_names):
        queries += scenario_condition.collect_queries()
    for role in roles:
        queries += role.collect_queries()
    return queries


def post_all():
    for query in collect_queries():
        execute_post_query(query)


if __name__ == "__main__":
    tmp = collect_queries()
    pass