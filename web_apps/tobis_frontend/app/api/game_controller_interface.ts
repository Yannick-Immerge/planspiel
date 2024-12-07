import {ApiResult, AWS_SERVER_ADDR_HTTP, fetch_typesafe, mapApiResult} from "@/app/api/utility";
import {Session, SessionView, UserView} from "@/app/api/models";

export const GAME_CONTROLLER_SERVER_PORT = "5002";
export const GAME_CONTROLLER_SERVER_ADDR_HTTP = AWS_SERVER_ADDR_HTTP + ":" + GAME_CONTROLLER_SERVER_PORT + "/game";


interface CreateUserResult {
    username: string
}

interface ExistsUserResult {
    userExists: boolean
}

interface ViewUserResult {
    userView: UserView
}

interface LogInResult {
    token: string
    administrator: boolean
}

interface LogOutResult {
}

interface UpdateUserPasswordResult {
}

interface CreateSessionResult {
    sessionId: string
    administratorUsername: string
}

interface ExistsSessionResult {
    sessionExists: boolean
}

interface ViewSessionResult {
    sessionView: SessionView
}

interface IsSessionActiveResult {
    sessionActive: boolean
}

interface GetSessionResult {
    session: Session
}

interface GetSessionMemberViewsResult {
    memberViews: UserView[]
}

interface SetSessionStatusResult {
}


function game_fetch<T>(endpoint: string, params?: Record<string, any>) : Promise<ApiResult<T>> {
    return fetch_typesafe<T>(GAME_CONTROLLER_SERVER_ADDR_HTTP + endpoint, params);
}


// User Management


export async function createUserForSession(sessionId: string, passwordHash: string) : Promise<ApiResult<CreateUserResult>> {
    return game_fetch<CreateUserResult>("/users/create", {
        sessionId: sessionId,
        passwordHash: passwordHash
    });
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
    return game_fetch<LogInResult>("/users/login", {
        username: username,
        passwordHash: passwordHash
    });
}

export async function logOut(username: string, token: string) : Promise<ApiResult<LogOutResult>> {
    return game_fetch<LogInResult>("/users/logout", {
        username: username,
        token: token
    });
}

export async function updateUserPassword(username: string, token: string, oldPasswordHash: string, newPasswordHash: string) : Promise<ApiResult<UpdateUserPasswordResult>> {
    return game_fetch<UpdateUserPasswordResult>("/users/update_password", {
        username: username,
        token: token,
        oldPasswordHash: oldPasswordHash,
        newPasswordHash: newPasswordHash
    });
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

export async function getSession(sessionId: string, administratorUsername: string, administratorToken: string) : Promise<ApiResult<GetSessionResult>> {
    return game_fetch<GetSessionResult>("/sessions/get", {
        sessionId: sessionId,
        administratorUsername: administratorUsername,
        administratorToken: administratorToken
    });
}

export async function getSessionMemberViews(sessionId: string, administratorUsername: string, administratorToken: string) : Promise<ApiResult<GetSessionMemberViewsResult>> {
    const getSessionResult = await getSession(sessionId, administratorUsername, administratorToken);
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

export async function setSessionStatus(sessionId: string, administratorUsername: string, administratorToken: string, status: "active" | "disabled") : Promise<ApiResult<SetSessionStatusResult>> {
    return game_fetch<SetSessionStatusResult>("/sessions/status", {
        sessionId: sessionId,
        administratorUsername: administratorUsername,
        administratorToken: administratorToken,
        status: status
    })
}
