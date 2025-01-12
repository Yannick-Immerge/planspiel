import {ApiResult, fetch_typesafe, fail, getServerAddrHttp} from "@/app/api/utility";
import {Metric, Parameter, RoleData} from "@/app/api/models";
import {getGameState, isFactApplicable, isPostApplicable} from "@/app/api/game_controller_interface";

export const DATA_CONTROLLER_SERVER_PORT = "5001";


export interface ListRolesResult {
    names: string[],

}

export interface GetRoleResult {
    roleData: RoleData
}

export interface GetParameterResult {
    parameter: Parameter
}

export interface GetMetricResult {
    metric: Metric
}

function data_fetch<T>(endpoint: string, params?: Record<string, any>) : Promise<ApiResult<T>> {
    const addr = `${getServerAddrHttp()}:${DATA_CONTROLLER_SERVER_PORT}/data${endpoint}`
    return fetch_typesafe<T>(addr, params);
}

export async function listRoles() : Promise<ApiResult<ListRolesResult>> {
    return data_fetch<ListRolesResult>("/roles/list", {})
}

export async function getRole(name: string) : Promise<ApiResult<GetRoleResult>> {
    return data_fetch<GetRoleResult>("/roles/get", {
        name: name
    })
}

/**
 * This call returns a RoleData object, that only contains posts and facts applicable to the current game state of the user.
 * If the game state is e.g. identification, all facts and posts with isScenario === true will be filtered out.
 * If the game state is debriefing, only the conditional facts and posts will be filtered, whose conditions are not met.
 * @param name The role name.
 * @param overrideUsername Optional username to use instead of the one stored in sessionStorage.
 * @param overrideToken Optional access token to use instead of the one stored in sessionStorage.
 */
export async function getRoleFiltered(name: string, overrideUsername?: string, overrideToken?: string) : Promise<ApiResult<GetRoleResult>> {
    const getRoleResponse = await getRole(name);
    if(!getRoleResponse.ok || getRoleResponse.data === null) {
        return fail(`Could not fetch role data: ${getRoleResponse.statusText}.`);
    }

    const getGameStateResponse = await getGameState(overrideUsername, overrideToken);
    if(!getGameStateResponse.ok || getGameStateResponse.data === null) {
        return fail(`Could not fetch game state: ${getGameStateResponse.statusText}.`);
    }

    const consider_scenarios = getGameStateResponse.data.gameState.phase == "debriefing";
    let applicableFacts = [];
    let applicablePosts = [];
    for(const fact of getRoleResponse.data.roleData.facts) {
        if(!fact.isScenario) {
            applicableFacts.push(fact);
            continue;
        }
        if(consider_scenarios) {
            const isApplicableResult = await isFactApplicable(fact.name, overrideUsername, overrideToken);
            if(!isApplicableResult.ok || isApplicableResult.data === null) {
                return fail(`Could not check if fact ${fact.name} is applicable: ${isApplicableResult.statusText}.`);
            }
            if(isApplicableResult.data.isFactApplicable) {
                applicableFacts.push(fact);
            }
        }
    }
    for(const post of getRoleResponse.data.roleData.posts) {
        if(!post.isScenario) {
            applicablePosts.push(post);
            continue;
        }
        if(consider_scenarios) {
            const isApplicableResult = await isPostApplicable(post.name, overrideUsername, overrideToken);
            if(!isApplicableResult.ok || isApplicableResult.data === null) {
                return fail(`Could not check if post ${post.name} is applicable: ${isApplicableResult.statusText}.`);
            }
            if(isApplicableResult.data.isPostApplicable) {
                applicablePosts.push(post);
            }
        }
    }

    return {
        data: {
            roleData: {
                metadata: getRoleResponse.data.roleData.metadata,
                profilePictureIdentifier: getRoleResponse.data.roleData.profilePictureIdentifier,
                profilePictureOldIdentifier: getRoleResponse.data.roleData.profilePictureOldIdentifier,
                titlecardIdentifier: getRoleResponse.data.roleData.titlecardIdentifier,
                infoIdentifier: getRoleResponse.data.roleData.infoIdentifier,
                facts: applicableFacts,
                posts: applicablePosts
            }
        },
        ok: true,
        authenticationOk: true,
        statusText: ""
    }
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
