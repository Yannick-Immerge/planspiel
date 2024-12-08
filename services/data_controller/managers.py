from enum import Enum, auto

from shared.data_model.context import initialize_db_context, execute_query


initialize_db_context(
    "localhost",
    3306,
    "mydatabase",
    "admin",
    "admin"
)


def _dbs(v: str | None) -> str:
    if v is None:
        return "NULL"
    else:
        return f"\"{v}\""


class DataType(Enum):
    ROLE = auto()
    ROLE_ENTRY = auto()
    SCENARIO = auto()
    SCENARIO_CONDITION = auto()
    METRIC = auto()
    PARAMETER = auto()


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

    def list_roles(self) -> list[str]:
        query = "SELECT name FROM RoleTable;"
        return [row[0] for row in execute_query(query)]

    def get(self, data_type: DataType, identifier: str):
        if data_type == DataType.ROLE:
            if not self.has_role(identifier):
                raise NameError(f"There is no role with name: {identifier}")
            query = f"SELECT description FROM RoleTable WHERE name = {_dbs(identifier)};"
            description = execute_query(query)[0][0]
            return {
                "name": identifier,
                "description": description,
                "entries": self.list_entries_for_role(identifier),
                "scenarios": self.list_scenarios_for_role(identifier)
            }
        elif data_type == DataType.ROLE_ENTRY:
            if not self.has_role_entry(identifier):
                raise NameError(f"There is no role entry with name: {identifier}")
            query = (f"SELECT RoleEntry.belongs_to, Resource.identifier, Resource.content_type "
                     f"FROM RoleEntry INNER JOIN Resource ON RoleEntry.resource = Resource.identifier "
                     f"WHERE RoleEntry.name = {_dbs(identifier)};")
            belongs_to, resource_identifier, resource_content_type = execute_query(query)[0]
            return {
                "name": identifier,
                "belongsTo": belongs_to,
                "resource": {
                    "identifier": resource_identifier,
                    "contentType": resource_content_type
                }
            }
        elif data_type == DataType.SCENARIO:
            if not self.has_scenario(identifier):
                raise NameError(f"There is no scenario with name: {identifier}")
            query = (f"SELECT Scenario.belongs_to, Resource.identifier, Resource.content_type "
                     f"FROM Scenario INNER JOIN Resource ON Scenario.resource = Resource.identifier "
                     f"WHERE Scenario.name = {_dbs(identifier)};")
            belongs_to, resource_identifier, resource_content_type = execute_query(query)[0]
            return {
                "name": identifier,
                "belongsTo": belongs_to,
                "resource": {
                    "identifier": resource_identifier,
                    "contentType": resource_content_type
                }
            }

        else:
            raise ValueError(f"Unknown data type: {data_type}.")