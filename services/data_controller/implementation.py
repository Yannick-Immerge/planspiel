from services.data_controller.managers import DATA_MANAGER


def impl_roles_list():
    return DATA_MANAGER.list_roles()


def impl_roles_get(name: str):
    return DATA_MANAGER.get_role(name)


def impl_parameters_get(simple_name: str):
    return DATA_MANAGER.get_parameter(simple_name)


def impl_metrics_get(simple_name: str):
    return DATA_MANAGER.get_metric(simple_name)
