import json
import re
from pathlib import Path
from typing import Iterable

import pydantic

from shared.data_model.context import Query, execute

_BASE_PATH: Path = Path(__file__).parent
_METRICS_PATH = _BASE_PATH / "metrics.json"
_PARAMETERS_PATH = _BASE_PATH / "parameters.json"
_CONDITIONS_PATH = _BASE_PATH / "conditions.json"
_ROLE_NAMES_PATH = _BASE_PATH / "role_names.txt"
_SCENARIOS_PATH = _BASE_PATH / "scenarios"

_SERIAL_PATH = _BASE_PATH / "serial.json"


_POST_IMAGE_NAME_REGEX = r"picture_[0-9]+\.png"


def load_role_names() -> list[str]:
    with open(_ROLE_NAMES_PATH, "rt", encoding="utf-8") as file:
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

    def collect_queries(self) -> list[Query]:
        query = (f"INSERT INTO Parameter(simple_name, description, min_value, max_value) "
                 f"VALUES (%s, %s, %s, %s);")
        return [Query(query, (self.simpleName, self.description, self.minValue, self.maxValue))]


def load_all_parameters() -> list[ParameterDefinition]:
    with open(_PARAMETERS_PATH, "rt", encoding="utf-8") as file:
        data = json.load(file)
    all_parameters = [ParameterDefinition(**item) for item in data]
    return [parameter for parameter in all_parameters]


class MetricDefinition(pydantic.BaseModel):
    simpleName: str
    description: str
    minValue: float
    maxValue: float

    def collect_queries(self) -> list[Query]:
        query = (f"INSERT INTO Metric(simple_name, description, min_value, max_value) "
                 f"VALUES (%s, %s, %s, %s);")
        return [Query(query, (self.simpleName, self.description, self.minValue, self.maxValue))]


def load_all_metrics() -> list[MetricDefinition]:
    with open(_METRICS_PATH, "rt", encoding="utf-8") as file:
        data = json.load(file)
    return [MetricDefinition(**item) for item in data]


class ScenarioConditionDefinition(pydantic.BaseModel):
    name: str
    metric: str
    minValue: float | None
    maxValue: float | None

    def collect_queries(self) -> list[Query]:
        query = (f"INSERT INTO ScenarioCondition(name, metric, min_value, max_value) "
                 f"VALUES (%s, %s, %s, %s);")
        return [Query(query, (self.name, self.metric, self.minValue, self.maxValue))]


def load_all_scenario_conditions() -> list[ScenarioConditionDefinition]:
    with open(_CONDITIONS_PATH, "rt", encoding="utf-8") as file:
        data = json.load(file)
        return [ScenarioConditionDefinition(**item) for item in data]


class PostDefinitionMetadata(pydantic.BaseModel):
    type: str
    author: str
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
        self.name = f"{belongs_to}_{definition_path.name}"
        prefix = f"{prefix}/{definition_path.name}"
        self.belongs_to = belongs_to
        with open(definition_path / "post.json", "rt", encoding="utf-8") as file:
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
            if child.is_file() and (child.name.endswith(".png") or child.name.endswith(".jpg")):
                self.image_identifiers.append("/".join([prefix, child.name]))

    def collect_queries(self) -> list[Query]:
        # Post <- PostImage <- Post_depends_on
        queries = []
        query = (f"INSERT INTO Post(name, belongs_to, text_de_identifier, text_orig_identifier, type, author, is_scenario) "
                 f"VALUES (%s, %s, %s, %s, %s, %s, %s);")
        queries.append(Query(query, (self.name, self.belongs_to, self.text_de_identifier,
                                     self.text_orig_identifier, self.metadata.type, self.metadata.author,
                                     self.metadata.isScenario)))
        for image_identifier in self.image_identifiers:
            query = (f"INSERT INTO PostImage(image_identifier, post) "
                     f"VALUES (%s, %s);")
            queries.append(Query(query, (image_identifier, self.name)))
        for scenario_condition in self.metadata.conditions:
            query = (f"INSERT INTO Post_depends_on(post, scenario_condition) "
                     f"VALUES (%s, %s);")
            queries.append(Query(query, (self.name, scenario_condition)))
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
        self.name = f"{belongs_to}_{definition_path.name}"
        prefix = f"{prefix}/{definition_path.name}"
        self.belongs_to = belongs_to
        with open(definition_path / "fact.json", "rt", encoding="utf-8") as file:
            data = json.load(file)
        if data is None:
            raise RuntimeError(f"Could not load metadata for fact at {definition_path}.")
        self.metadata = FactDefinitionMetadata(**data)
        if not (definition_path / "text.md").exists():
            raise RuntimeError(f"The fact definition at {definition_path} doesnt contain a text.md file.")
        self.text_identifier = f"{prefix}/text.md"

    def collect_queries(self) -> list[Query]:
        # Fact <- Fact_depends_on
        queries = []
        query = (f"INSERT INTO Fact(name, belongs_to, text_identifier, hyperlink, is_scenario) "
                 f"VALUES (%s, %s, %s, %s, %s);")
        queries.append(Query(query, (self.name, self.belongs_to, self.text_identifier, self.metadata.hyperlink,
                                     self.metadata.isScenario)))
        for scenario_condition in self.metadata.conditions:
            query = (f"INSERT INTO Fact_depends_on(fact, scenario_condition) "
                     f"VALUES (%s, %s);")
            queries.append(Query(query, (self.name, scenario_condition)))
        return queries


class RoleMetadata(pydantic.BaseModel):
    name: str
    gender: str
    birthday: str
    living: str
    status: str
    language: str
    flag: str
    job: str

    @pydantic.field_validator("gender", mode="after")
    @classmethod
    def validate_gender(cls, value: str) -> str:
        if value not in ["m", "w", "d"]:
            raise ValueError(f"{value} is not allowed to specify the gender.")
        return value


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
        with open(definition_path / "metadata.json", "rt", encoding="utf-8") as file:
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
            self.facts.append(FactDefinition(child, prefix + "/facts", self.name))

        post_folder = definition_path / "posts"
        if not post_folder.exists() or not post_folder.is_dir():
            raise RuntimeError(f"Expected {post_folder} to be a directory and exist.")
        self.posts = []
        for child in post_folder.iterdir():
            if not child.is_dir():
                raise RuntimeError(f"Expected only folders in {post_folder} but {child} is not a folder.")
            self.posts.append(PostDefinition(child, prefix + "/posts", self.name))

    def collect_queries(self) -> list[Query]:
        # RoleTable <- [Fact... ] <- [Post... ]
        queries = []
        query = (f"INSERT INTO RoleTable(name, meta_name, meta_gender, meta_birthday, meta_living, meta_status, "
                 f"meta_language, meta_flag, meta_job, "
                 f"profile_picture_identifier, profile_picture_old_identifier, titlecard_identifier, info_identifier) "
                 f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);")
        queries.append(Query(query, (self.name, self.metadata.name, self.metadata.gender, self.metadata.birthday,
                                     self.metadata.living, self.metadata.status, self.metadata.language,
                                     self.metadata.flag, self.metadata.job, self.profile_picture_identifier,
                                     self.profile_picture_old_identifier, self.titlecard_identifier,
                                     self.info_identifier)))
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


def collect_queries() -> list[Query]:
    queries = []
    for metric in load_all_metrics():
        queries += metric.collect_queries()
    for parameter in load_all_parameters():
        queries += parameter.collect_queries()
    for scenario_condition in load_all_scenario_conditions():
        queries += scenario_condition.collect_queries()
    role_names = load_role_names()
    roles = load_roles(role_names)
    for role in roles:
        queries += role.collect_queries()
    return queries

def serialize_all():
    if _SERIAL_PATH.exists():
        raise RuntimeError("There already is a serialized version.")
    with open(_SERIAL_PATH, "wt", encoding="utf-8") as file:
        data = [query.serialize() for query in collect_queries()]
        json.dump(data, file, ensure_ascii=False)

def deserialize_all() -> list[Query]:
    if not _SERIAL_PATH.exists():
        raise RuntimeError("There is no serialized version.")
    with open(_SERIAL_PATH, "rt", encoding="utf-8") as file:
        data = json.load(file)
        return [Query.deserialize(item) for item in data]

def post_all(use_serial: bool = True):
    for query in (deserialize_all() if use_serial else collect_queries()):
        execute(query, commit=True)



if __name__ == "__main__":
    # collect_queries()
    tmp = serialize_all()
    # queries = deserialize_all()
    pass
