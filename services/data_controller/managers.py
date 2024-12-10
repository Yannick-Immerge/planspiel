from enum import Enum

from shared.data_model.context import execute_query, initialize_db_context_default


def _dbs(v: str | None) -> str:
    if v is None:
        return "NULL"
    else:
        return f"\"{v}\""


class DataType(Enum):
    ROLE = "role"
    ROLE_ENTRY = "role_entry"
    SCENARIO = "scenario"
    METRIC = "metric"
    PARAMETER = "parameter"


class DataManager:

    def has_role(self, name: str) -> bool:
        query = f"SELECT COUNT(*) FROM RoleTable WHERE name = {_dbs(name)};"
        n = execute_query(query)[0][0]
        return n > 0

    def list_entries_for_role(self, name: str) -> list[str]:
        if not self.has_role(name):
            raise NameError(f"There is no role with name: {name}.")
        query = f"SELECT name FROM RoleEntry WHERE belongs_to = {_dbs(name)};"
        return [row[0] for row in execute_query(query)]

    def list_scenarios_for_role(self, name: str) -> list[str]:
        if not self.has_role(name):
            raise NameError(f"There is no role with name: {name}.")
        query = f"SELECT name FROM Scenario WHERE belongs_to = {_dbs(name)};"
        return [row[0] for row in execute_query(query)]

    def has_role_entry(self, name: str) -> bool:
        query = f"SELECT COUNT(*) FROM RoleEntry WHERE name = {_dbs(name)};"
        n = execute_query(query)[0][0]
        return n > 0

    def has_scenario(self, name: str) -> bool:
        query = f"SELECT COUNT(*) FROM Scenario WHERE name = {_dbs(name)};"
        n = execute_query(query)[0][0]
        return n > 0

    def has_parameter(self, name: str) -> bool:
        query = f"SELECT COUNT(*) FROM Parameter WHERE simple_name = {_dbs(name)};"
        n = execute_query(query)[0][0]
        return n > 0

    def has_metric(self, name: str) -> bool:
        query = f"SELECT COUNT(*) FROM Metric WHERE simple_name = {_dbs(name)};"
        n = execute_query(query)[0][0]
        return n > 0

    def get_conditions_for_scenario(self, name: str) -> list[dict]:
        if not self.has_scenario(name):
            raise NameError(f"There is no scenario with name: {name}.")
        query = (f"SELECT ScenarioCondition.name, ScenarioCondition.metric, ScenarioCondition.min_value, ScenarioCondition.max_value "
                 f"FROM ScenarioCondition INNER JOIN depends_on ON ScenarioCondition.name = depends_on.scenario_condition "
                 f"WHERE depends_on.scenario = {_dbs(name)};")
        return [{
            "name": condition_name,
            "metric": metric,
            "minValue": min_value,
            "maxValue": max_value
        } for condition_name, metric, min_value, max_value in execute_query(query)]

    def list_roles(self):
        query = "SELECT name FROM RoleTable;"
        return {
            "names": [row[0] for row in execute_query(query)]
        }


    def get(self, data_type: DataType, identifier: str):
        if data_type == DataType.ROLE:
            if not self.has_role(identifier):
                raise NameError(f"There is no role with name: {identifier}")
            query = f"SELECT description FROM RoleTable WHERE name = {_dbs(identifier)};"
            description = execute_query(query)[0][0]
            return {
                "role": {
                    "name": identifier,
                    "description": description,
                    "entries": self.list_entries_for_role(identifier),
                    "scenarios": self.list_scenarios_for_role(identifier)
                }
            }
        elif data_type == DataType.ROLE_ENTRY:
            if not self.has_role_entry(identifier):
                raise NameError(f"There is no role entry with name: {identifier}")
            query = (f"SELECT RoleEntry.belongs_to, Resource.identifier, Resource.content_type "
                     f"FROM RoleEntry INNER JOIN Resource ON RoleEntry.resource = Resource.identifier "
                     f"WHERE RoleEntry.name = {_dbs(identifier)};")
            belongs_to, resource_identifier, resource_content_type = execute_query(query)[0]
            return {
                "role_entry": {
                    "name": identifier,
                    "belongsTo": belongs_to,
                    "resource": {
                        "identifier": resource_identifier,
                        "contentType": resource_content_type
                    }
                }
            }
        elif data_type == DataType.SCENARIO:
            if not self.has_scenario(identifier):
                raise NameError(f"There is no scenario with name: {identifier}")
            query = (f"SELECT Scenario.belongs_to, Resource.identifier, Resource.content_type "
                     f"FROM Scenario INNER JOIN Resource ON Scenario.resource = Resource.identifier "
                     f"WHERE Scenario.name = {_dbs(identifier)};")
            belongs_to, resource_identifier, resource_content_type = execute_query(query)[0]
            conditions = self.get_conditions_for_scenario(identifier)
            return {
                "scenario": {
                    "name": identifier,
                    "belongsTo": belongs_to,
                    "conditions": conditions,
                    "resource": {
                        "identifier": resource_identifier,
                        "contentType": resource_content_type
                    }
                }
            }
        elif data_type == DataType.PARAMETER:
            if not self.has_parameter(identifier):
                raise NameError(f"There is no parameter with name: {identifier}.")
            query = f"SELECT description, min_value, max_value FROM Parameter WHERE simple_name = {_dbs(identifier)};"
            description, min_value, max_value = execute_query(query)[0]
            return {
                "parameter": {
                    "simpleName": identifier,
                    "description": description,
                    "min_value": min_value,
                    "max_value": max_value
                }
            }
        elif data_type == DataType.METRIC:
            if not self.has_metric(identifier):
                raise NameError(f"There is no metric with name: {identifier}.")
            query = f"SELECT description, min_value, max_value FROM Metric WHERE simple_name = {_dbs(identifier)};"
            description, min_value, max_value = execute_query(query)[0]
            return {
                "metric": {
                    "simpleName": identifier,
                    "description": description,
                    "min_value": min_value,
                    "max_value": max_value
                }
            }
        else:
            raise ValueError(f"Unknown data type: {data_type}.")


DATA_MANAGER: DataManager = DataManager()
