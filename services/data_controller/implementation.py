from services.data_controller.managers import DataType, DATA_MANAGER


def impl_roles_list():
    return DATA_MANAGER.list_roles()


def impl_get_route(data_type: DataType, identifier: str):
    return DATA_MANAGER.get(data_type, identifier)

