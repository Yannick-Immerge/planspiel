import {ApiResult, SERVER_ADDR_HTTP, fetch_typesafe} from "@/app/api/utility";
import {Metric, Parameter, Role, RoleEntry, Scenario} from "@/app/api/models";

export const DATA_CONTROLLER_SERVER_PORT = "5001";
export const DATA_CONTROLLER_SERVER_ADDR_HTTP = SERVER_ADDR_HTTP + ":" + DATA_CONTROLLER_SERVER_PORT + "/game";


export interface ListRolesResult {
    names: string[],

}

export interface GetRoleResult {
    role: Role
}

export interface GetRoleEntryResult {
    role_entry: RoleEntry
}

export interface GetScenarioResult {
    scenario: Scenario
}

export interface GetParameterResult {
    parameter: Parameter
}

export interface GetMetricResult {
    metric: Metric
}


function data_fetch<T>(endpoint: string, params?: Record<string, any>) : Promise<ApiResult<T>> {
    return fetch_typesafe<T>(DATA_CONTROLLER_SERVER_ADDR_HTTP + endpoint, params);
}

export async function listRoles() : Promise<ApiResult<ListRolesResult>> {
    return data_fetch<ListRolesResult>("/roles/list", {})
}

export async function getRole(name: string) : Promise<ApiResult<GetRoleResult>> {
    return data_fetch<GetRoleResult>("/roles/get", {
        name: name
    })
}

export async function getRoleEntry(name: string) : Promise<ApiResult<GetRoleEntryResult>> {
    return data_fetch<GetRoleEntryResult>("/role_entries/get", {
        name: name
    })
}

export async function getScenario(name: string) : Promise<ApiResult<GetScenarioResult>> {
    return data_fetch<GetScenarioResult>("/scenarios/get", {
        name: name
    })
}

export async function getParameter(simpleName: string) : Promise<ApiResult<GetParameterResult>> {
    return data_fetch<GetParameterResult>("/parameters/get", {
        simpleName: simpleName
    })
}

export async function getMetric(simpleName: string) : Promise<ApiResult<GetMetricResult>> {
    return data_fetch<GetMetricResult>("/metrics/get", {
        simpleName: simpleName
    })
}
