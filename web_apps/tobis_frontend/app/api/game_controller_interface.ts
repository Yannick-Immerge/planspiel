import {ApiResult, SERVER_ADDR_HTTP, fetch_typesafe, mapApiResult, fetch_with_auth} from "@/app/api/utility";
import {Session, SessionView, UserView} from "@/app/api/models";

export const GAME_CONTROLLER_SERVER_PORT = "5002";
export const GAME_CONTROLLER_SERVER_ADDR_HTTP = SERVER_ADDR_HTTP + ":" + GAME_CONTROLLER_SERVER_PORT + "/game";


export interface CreateUserResult {
    username: string
}

export interface ConfigureUserResult {
}

export interface ExistsUserResult {
    userExists: boolean
}

export interface ViewUserResult {
    userView: UserView
}

export interface LogInResult {
    token: string
    administrator: boolean
}

export interface LogOutResult {
}

export interface UpdateUserPasswordResult {
}

export interface CreateSessionResult {
    sessionId: string
    administratorUsername: string
}

export interface ExistsSessionResult {
    sessionExists: boolean
}

export interface ViewSessionResult {
    sessionView: SessionView
}

export interface IsSessionActiveResult {
    sessionActive: boolean
}

export interface GetSessionResult {
    session: Session
}

export interface GetSessionMemberViewsResult {
    memberViews: UserView[]
}

export interface SetSessionStatusResult {
}


function game_fetch<T>(endpoint: string, params?: Record<string, any>) : Promise<ApiResult<T>> {
    return fetch_typesafe<T>(GAME_CONTROLLER_SERVER_ADDR_HTTP + endpoint, params);
}


// User Management


export async function createUserForSession(sessionId: string, passwordHash: string, overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<CreateUserResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<CreateUserResult>("/users/create", {
            administratorUsername: localUsername,
            administratorToken: localToken,
            sessionId: sessionId,
            passwordHash: passwordHash
        });
    }, overrideAdministratorUsername, overrideAdministratorToken);
}

export async function configureUser(targetUsername: string, assignedRoleId: string, assignedBuergerrat: number, overrideAdministratorUsername?: string, overrideAdministratorToken?: string) {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<ConfigureUserResult>("/users/configure", {
            administratorUsername: localUsername,
            administratorToken: localToken,
            targetUsername: targetUsername,
            assignedRoleId: assignedRoleId,
            assignedBuergerrat: assignedBuergerrat
        });
    }, overrideAdministratorUsername, overrideAdministratorToken);
}

export async function existsUser(username: string) : Promise<ApiResult<ExistsUserResult>> {
    return game_fetch<ExistsUserResult>("/users/exists", {
        username: username
    });
}

export async function viewUser(username: string) : Promise<ApiResult<ViewUserResult>> {
    return game_fetch<ViewUserResult>("/users/view", {
        username: username
    })
}

export async function logIn(username: string, passwordHash: string) : Promise<ApiResult<LogInResult>> {
    const result = await game_fetch<LogInResult>("/users/login", {
        username: username,
        passwordHash: passwordHash
    });
    if(result.data !== undefined) {
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("token", result.data?.token);
    }
    return result;
}

export async function logOut(overrideUsername?: string, overrideToken?: string) : Promise<ApiResult<LogOutResult>> {
    const result = await fetch_with_auth((localUsername, localToken) => {
        return game_fetch<LogOutResult>("/users/logout", {
            username: localUsername,
            token: localToken
        });
    }, overrideUsername, overrideToken);
    if(result.ok) {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("token");
    }
    return result;
}

export async function updateUserPassword(targetUsername: string, newPasswordHash: string, overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<UpdateUserPasswordResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<UpdateUserPasswordResult>("/users/update_password", {
            administratorUsername: localUsername,
            administratorToken: localToken,
            targetUsername: targetUsername,
            newPasswordHash: newPasswordHash
        });
    }, overrideAdministratorUsername, overrideAdministratorToken);
}


// Session Management

export async function createSession(productKey: string, administratorPasswordHash: string) : Promise<ApiResult<CreateSessionResult>> {
    return game_fetch<CreateSessionResult>("/sessions/create", {
        productKey: productKey,
        administratorPasswordHash: administratorPasswordHash
    });
}

export async function existsSession(sessionId: string) : Promise<ApiResult<ExistsSessionResult>> {
    return game_fetch<ExistsSessionResult>("/sessions/exists", {
        sessionId: sessionId
    });
}

export async function viewSession(sessionId: string) : Promise<ApiResult<ViewSessionResult>> {
    return game_fetch<ViewSessionResult>("/sessions/view", {
        sessionId: sessionId
    });
}

export async function isSessionActive(sessionId: string) : Promise<ApiResult<IsSessionActiveResult>> {
    return mapApiResult(viewSession(sessionId), (data: ViewSessionResult | undefined) => ({
        sessionActive: data?.sessionView.status === "active"
    }));
}

export async function getSession(sessionId: string, overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<GetSessionResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<GetSessionResult>("/sessions/get", {
            sessionId: sessionId,
            administratorUsername: localUsername,
            administratorToken: localToken
        });
    }, overrideAdministratorUsername, overrideAdministratorToken);
}

export async function getSessionMemberViews(sessionId: string, overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<GetSessionMemberViewsResult>> {
    const getSessionResult = await getSession(sessionId, overrideAdministratorUsername, overrideAdministratorToken);
    const memberUsernames = getSessionResult.data?.session.memberUsernames;
    if(memberUsernames === undefined) {
        return {
            data: undefined,
            ok: false,
            authenticationOk: getSessionResult.authenticationOk,
            statusText: `Failed querying usernames: ${getSessionResult.statusText}.`
        };
    }

    let memberViews = [];
    for (const username of memberUsernames) {
        const viewMemberResult = await viewUser(username);
        if(viewMemberResult.data === undefined) {
            return {
                data: undefined,
                ok: false,
                authenticationOk: viewMemberResult.authenticationOk,
                statusText: `Failed quering info about user ${username}: ${viewMemberResult.statusText}.`
            };
        }
        memberViews.push(viewMemberResult.data.userView);
    }

    return {
        data: {
            memberViews: memberViews
        },
        ok: true,
        authenticationOk: true,
        statusText: ""
    };
}

export async function setSessionStatus(sessionId: string, status: "active" | "disabled", overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<SetSessionStatusResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<SetSessionStatusResult>("/sessions/status", {
            sessionId: sessionId,
            administratorUsername: localUsername,
            administratorToken: localToken,
            status: status
        })
    }, overrideAdministratorUsername, overrideAdministratorToken);
}
