import itertools
import json
from pathlib import Path
from typing import Iterable, Self

import pydantic

from shared.data_model.context import PostQuery, execute_post_query

_BASE_PATH: Path = Path(__file__).parent
_METRICS_PATH = _BASE_PATH / "metrics.json"
_PARAMETERS_PATH = _BASE_PATH / "parameters.json"
_ROLE_NAMES_PATH = _BASE_PATH / "role_names.txt"
_RESOURCES_PATH = _BASE_PATH / "resources"
_CONDITIONS_PATH = _BASE_PATH / "conditions"
_SCENARIOS_PATH = _BASE_PATH / "scenarios"

_CONTENT_TYPES = {
    "diary": {"md", "txt"},
    "article": {"md", "txt"},
    "picture": {"png", "jpg"},
    "profile_picture": {"png", "jpg"},
    "profile_picture_old": {"png", "jpg"},
    "titlecard": {"png", "jpg"},
    "info": {"txt"},
    "metadata": {"json"},
    "fact": {"md", "txt"},
    "post": {"md", "txt"}
}


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
    simple_name: str
    description: str
    min_value: float
    max_value: float


def load_all_parameters() -> list[ParameterDefinition]:
    with open(_PARAMETERS_PATH, "rt") as file:
        data = json.load(file)
    all_parameters = [ParameterDefinition(**item) for item in data]
    return [parameter for parameter in all_parameters]


class MetricDefinition(pydantic.BaseModel):
    simple_name: str
    description: str
    min_value: float
    max_value: float


def load_all_metrics() -> dict[str, MetricDefinition]:
    with open(_METRICS_PATH, "rt") as file:
        data = json.load(file)
    all_metrics = [MetricDefinition(**item) for item in data]
    return {metric.simple_name: metric for metric in all_metrics}


class ScenarioConditionDefinition(pydantic.BaseModel):
    name: str
    metric: str
    min_value: float | None
    max_value: float | None


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


class ResourceDefinition(pydantic.BaseModel):
    identifier: str
    content_type: str

    @pydantic.field_validator("content_type", mode="after")
    @classmethod
    def ensure_content_type(cls, value) -> str:
        if value not in _CONTENT_TYPES:
            raise ValueError(f"Unsupported content type: {value}.")
        return value

    @pydantic.model_validator(mode="after")
    def ensure_suffixes(self) -> Self:
        parts = self.identifier.split(".")
        if len(parts) < 2:
            raise ValueError("Resource file has to have a file ending.")
        suffix = parts[-1]
        if suffix not in _CONTENT_TYPES[self.content_type]:
            raise ValueError(f"Unsupported suffix: {suffix} for resource of content type: {self.content_type}.")
        return self


class ScenarioDefinition(pydantic.BaseModel):
    name: str
    conditions: list[str]
    resource: ResourceDefinition


def load_scenarios(scenario_names: Iterable[str]) -> list[ScenarioDefinition]:
    scenarios = []
    for scenario_name in scenario_names:
        path = _SCENARIOS_PATH / f"{scenario_name}.json"
        if not path.exists():
            raise NameError(f"No scenario for name {scenario_name}.")
        with open(path, "rt") as file:
            data = json.load(file)
            scenario = ScenarioDefinition(**data)
            if scenario.name != scenario_name:
                raise ValueError(f"The name provided in the scenario: {scenario.name} does not match the expected: {scenario_name}.")
        scenarios.append(scenario)
    return scenarios


class RoleEntryDefinition(pydantic.BaseModel):
    name: str
    resource: ResourceDefinition


class RoleDefinition(pydantic.BaseModel):
    name: str
    description: str
    demographic: dict[str, str]
    entries: list[RoleEntryDefinition]
    scenarios: list[str]


def load_roles(role_names: Iterable[str]) -> list[RoleDefinition]:
    roles = []
    for role_name in role_names:
        path = _BASE_PATH / f"{role_name}.json"
        if not path.exists():
            raise NameError(f"No role for name {role_name}.")
        with open(path, "rt") as file:
            data = json.load(file)
            role = RoleDefinition(**data)
            if role.name != role_name:
                raise ValueError(
                    f"The name provided in the role: {role.name} does not match the expected: {role_name}.")
        roles.append(role)
    return roles


def make_insert(table_name: str, columns: str, values: list[str], args: tuple) -> PostQuery:
    fmt_values = ", ".join(map(lambda s: f"({s})", values))
    return PostQuery(f"INSERT INTO {table_name} ({columns}) VALUES {fmt_values};", args)


def group_iterate(defs):
    for key, coll in defs.items():
        for item in coll:
            yield key, item


def collect_queries() -> list[PostQuery]:
    role_names = load_role_names()
    role_defs = load_roles(role_names)
    role_entry_defs = {
        role_def.name: role_def.entries for role_def in role_defs
    }
    scenario_defs = {
        role_def.name: load_scenarios(role_def.scenarios) for role_def in role_defs
    }
    scenario_cond_defs = {
        scenario_def.name: load_scenario_conditions(scenario_def.conditions) for scenario_def in itertools.chain(
            *scenario_defs.values()
        )
    }
    metric_defs = load_all_metrics()
    parameter_defs = load_all_parameters()
    viable_metric_defs: list[MetricDefinition] = list(metric_defs[scenario_cond_def.metric]
                                                    for scenario_cond_def in itertools.chain(*scenario_cond_defs.values()))
    viable_resource_defs: list[ResourceDefinition] = list(entry.resource for entry in
                                                        list(itertools.chain(*scenario_defs.values())) +
                                                        list(itertools.chain(*role_entry_defs.values())))

    parameter_query = make_insert(
        "Parameter",
        "simple_name, description, min_value, max_value",
        [
            f"\"{parameter_def.simple_name}\", \"{parameter_def.description}\", {parameter_def.min_value}, {parameter_def.max_value}"
            for parameter_def in parameter_defs
        ],
        ()
    )
    metric_query = make_insert(
        "Metric",
        "simple_name, description, min_value, max_value",
        [
            f"\"{metric_def.simple_name}\", \"{metric_def.description}\", {metric_def.min_value}, {metric_def.max_value}"
            for metric_def in viable_metric_defs
        ],
        ()
    )
    resource_query = make_insert(
        "Resource",
        "identifier, content_type",
        [
            f"\"{resource_def.identifier}\", \"{resource_def.content_type}\""
            for resource_def in viable_resource_defs
        ],
        ()
    )
    scenario_cond_query = make_insert(
        "ScenarioCondition",
        "name, metric, min_value, max_value",
        [
            f"\"{scenario_cond_def.name}\", \"{scenario_cond_def.metric}\", {scenario_cond_def.min_value}, {scenario_cond_def.max_value}"
            for scenario_cond_def in itertools.chain(*scenario_cond_defs.values())
        ],
        ()
    )
    role_query = make_insert(
        "RoleTable",
        "name, description",
        [
            f"\"{role_def.name}\", \"{role_def.description}\""
            for role_def in role_defs
        ],
        ()
    )
    role_entry_query = make_insert(
        "RoleEntry",
        "name, belongs_to, resource",
        [
            f"\"{role_entry_def.name}\", \"{role_name}\", \"{role_entry_def.resource.identifier}\""
            for role_name, role_entry_def in group_iterate(role_entry_defs)
        ],
        ()
    )
    scenario_query = make_insert(
        "Scenario",
        "name, belongs_to, resource",
        [
            f"\"{scenario_def.name}\", \"{role_name}\", \"{scenario_def.resource.identifier}\""
            for role_name, scenario_def in group_iterate(scenario_defs)
        ],
        ()
    )
    depends_on_query = make_insert(
        "depends_on",
        "scenario, scenario_condition",
        [
            f"\"{scenario_name}\", \"{scenario_cond_def.name}\""
            for scenario_name, scenario_cond_def in group_iterate(scenario_cond_defs)
        ],
        ()
    )

    return [
        parameter_query,
        # metric_query,
        resource_query,
        # scenario_cond_query,
        role_query,
        role_entry_query,
        scenario_query,
        # depends_on_query
    ]


def post_all():
    for query in collect_queries():
        execute_post_query(query)


if __name__ == "__main__":
    tmp = collect_queries()
    pass