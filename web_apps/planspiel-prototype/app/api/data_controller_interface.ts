import {ApiResult, SERVER_ADDR_HTTP, fetch_typesafe, fail} from "@/app/api/utility";
import {Metric, Parameter, Role, RoleEntry, RoleMetadata, Scenario, Resource} from "@/app/api/models";
import {loadMetadataResource} from "@/app/api/resources";

export const DATA_CONTROLLER_SERVER_PORT = "5001";
export const DATA_CONTROLLER_SERVER_ADDR_HTTP = SERVER_ADDR_HTTP + ":" + DATA_CONTROLLER_SERVER_PORT + "/data";


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

export interface GetRoleEntryInformationResult {
    metadata: RoleMetadata,
    resourceEntries: Resource[]
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

export async function getRoleEntryInformation(name: string) : Promise<ApiResult<GetRoleEntryInformationResult>> {
    const roleResult = await getRole(name);
    if(!roleResult.ok || roleResult.data === null) {
        return fail<GetRoleEntryInformationResult>(`Error fetching role ${name}: ${roleResult.statusText}`);
    }

    let resourceEntries : Resource[] = [];
    let metadataEntry : Resource | null = null;
    for (const entryName of roleResult.data.role.entries) {
        const entryResult = await getRoleEntry(entryName);
        if(!entryResult.ok || entryResult.data === null) {
            return fail<GetRoleEntryInformationResult>(`Error fetching entry ${entryName} of role ${name}: ${entryResult.statusText}`);
        }

        if(entryResult.data.role_entry.resource.contentType === "metadata") {
            if(metadataEntry !== null) {
                return fail<GetRoleEntryInformationResult>(`Error: Role ${name} provides multiple entries of type metadata.`);
            }
            metadataEntry = entryResult.data.role_entry.resource;
        } else {
            resourceEntries.push(entryResult.data.role_entry.resource);
        }
    }
    if(metadataEntry === null) {
        return fail<GetRoleEntryInformationResult>(`Error: Role ${name} provides no entry of type metadata.`);
    }
    const metadata = await loadMetadataResource(metadataEntry);
    if(metadata === null) {
        return fail<GetRoleEntryInformationResult>(`Error: Could not load metadata of role ${name}: Resource ${metadataEntry.identifier} could not be loaded.`);
    }
    return {
        data: {
            metadata: metadata,
            resourceEntries: resourceEntries
        },
        ok: true,
        authenticationOk: true,
        statusText: ""
    };
}
