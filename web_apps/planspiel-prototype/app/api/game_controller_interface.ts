import {
    ApiResult,
    fetch_typesafe,
    mapApiResult,
    fetch_with_auth,
    fail,
    getServerAddrHttp
} from "@/app/api/utility";
import {DiscussionPhase, GamePhase, GameState, Session, SessionView, UserView, VotingStatus} from "@/app/api/models";

export const GAME_CONTROLLER_SERVER_PORT = "5002";


export interface CreateUserResult {
    username: string
}

export interface HasUserPasswordResult {
    hasPassword: boolean
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

export interface ConfigureSessionPrototypeResult {
}

export interface GetGameStateResult {
    gameState: GameState
}

export interface TransitionGameStateResult {
}

export interface ReadyToTransitionGameStateResult {
    readyToTransition: boolean
}

export interface IsScenarioApplicableResult {
    isScenarioApplicable: boolean
}

export interface HaveAllSpokenResult {
    haveAllSpoken: boolean
}

export interface NextSpeakerResult {
}

export interface ReadyToTransitionDiscussionResult {
    readyToTransition: boolean
}

export interface TransitionDiscussionResult {
}

export interface HasVotedResult {
    hasVoted: boolean
}

export interface VoteResult {
}

export interface GetVotingStatusResult {
    votingStatus: VotingStatus
}


function game_fetch<T>(endpoint: string, params?: Record<string, any>) : Promise<ApiResult<T>> {
    const addr = `${getServerAddrHttp()}:${GAME_CONTROLLER_SERVER_PORT}/game${endpoint}`
    return fetch_typesafe<T>(addr, params);
}


// User Management


export async function createUserForSession(overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<CreateUserResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<CreateUserResult>("/users/create", {
            administratorUsername: localUsername,
            administratorToken: localToken
        });
    }, overrideAdministratorUsername, overrideAdministratorToken);
}

export async function hasUserPassword(username: string) : Promise<ApiResult<HasUserPasswordResult>>{
    return game_fetch<HasUserPasswordResult>("/users/has_password", {
        username: username
    })
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

export async function viewSelf() : Promise<ApiResult<ViewUserResult>> {
    return fetch_with_auth((localUsername, _) => {
        return viewUser(localUsername);
    });
}

export async function logIn(username: string, passwordHash: string) : Promise<ApiResult<LogInResult>> {
    const result = await game_fetch<LogInResult>("/users/login", {
        username: username,
        passwordHash: passwordHash
    });
    if(result.data !== null) {
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("token", result.data.token);
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

export async function existsSession(overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<ExistsSessionResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<ExistsSessionResult>("/sessions/exists", {
            administratorUsername: localUsername,
            administratorToken: localToken
        });
    }, overrideAdministratorUsername, overrideAdministratorToken);
}

export async function viewSession(overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<ViewSessionResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<ViewSessionResult>("/sessions/view", {
            administratorUsername: localUsername,
            administratorToken: localToken
        });
    }, overrideAdministratorUsername, overrideAdministratorToken);
}

export async function isSessionActive(overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<IsSessionActiveResult>> {
    return mapApiResult(viewSession(overrideAdministratorUsername, overrideAdministratorToken), (data: ViewSessionResult | null) => ({
        sessionActive: data?.sessionView.status === "active"
    }));
}

export async function getSession(overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<GetSessionResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<GetSessionResult>("/sessions/get", {
            administratorUsername: localUsername,
            administratorToken: localToken
        });
    }, overrideAdministratorUsername, overrideAdministratorToken);
}

export async function getSessionMemberViews(overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<GetSessionMemberViewsResult>> {
    const getSessionResult = await getSession(overrideAdministratorUsername, overrideAdministratorToken);
    const memberUsernames = getSessionResult.data?.session.memberUsernames;
    if(memberUsernames === undefined) {
        return {
            data: null,
            ok: false,
            authenticationOk: getSessionResult.authenticationOk,
            statusText: `Failed querying usernames: ${getSessionResult.statusText}.`
        };
    }

    let memberViews = [];
    for (const username of memberUsernames) {
        const viewMemberResult = await viewUser(username);
        if(viewMemberResult.data === null) {
            return {
                data: null,
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

export async function setSessionStatus(status: "active" | "disabled", overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<SetSessionStatusResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<SetSessionStatusResult>("/sessions/status", {
            administratorUsername: localUsername,
            administratorToken: localToken,
            status: status
        })
    }, overrideAdministratorUsername, overrideAdministratorToken);
}

export async function configureSessionPrototype(configuration: "friday_trial" | "friday_trial_2_users" | "friday_trial_10_users", overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<ConfigureSessionPrototypeResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<ConfigureSessionPrototypeResult>("/sessions/configure_prototype", {
            configuration: configuration,
            administratorUsername: localUsername,
            administratorToken: localToken
        })
    }, overrideAdministratorUsername, overrideAdministratorToken);
}


// Game State Management

export async function getGameState(overrideUsername?: string, overrideToken?: string) : Promise<ApiResult<GetGameStateResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<GetGameStateResult>("/game_state/get", {
            username: localUsername,
            token: localToken
        })
    }, overrideUsername, overrideToken);
}

export async function readyToTransitionGameState(targetPhase: GamePhase, overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<ReadyToTransitionGameStateResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<ReadyToTransitionGameStateResult>("/game_state/ready_to_transition", {
            targetPhase: targetPhase,
            administratorUsername: localUsername,
            administratorToken: localToken
        });
    }, overrideAdministratorUsername, overrideAdministratorToken);
}

export async function transitionGameState(targetPhase: GamePhase, overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<TransitionGameStateResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<TransitionGameStateResult>("/game_state/transition", {
            targetPhase: targetPhase,
            administratorUsername: localUsername,
            administratorToken: localToken
        });
    }, overrideAdministratorUsername, overrideAdministratorToken);
}

export async function isScenarioApplicable(name: string, overrideUsername?: string, overrideToken?: string) : Promise<ApiResult<IsScenarioApplicableResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<IsScenarioApplicableResult>("/game_state/is_scenario_applicable", {
            name: name,
            username: localUsername,
            token: localToken
        })
    }, overrideUsername, overrideToken);
}

export async function haveAllSpoken(overrideUsername?: string, overrideToken?: string) : Promise<ApiResult<HaveAllSpokenResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<HaveAllSpokenResult>("/game_state/discussion/have_all_spoken", {
            username: localUsername,
            token: localToken
        });
    }, overrideUsername, overrideToken)
}

export async function nextSpeaker(overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<NextSpeakerResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<NextSpeakerResult>("/game_state/discussion/next_speaker", {
            administratorUsername: localUsername,
            administratorToken: localToken
        });
    }, overrideAdministratorUsername, overrideAdministratorToken)
}

export async function readyToTransitionDiscussion(targetPhase: DiscussionPhase, overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<ReadyToTransitionDiscussionResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<ReadyToTransitionDiscussionResult>("/game_state/discussion/ready_to_transition", {
            targetPhase: targetPhase,
            administratorUsername: localUsername,
            administratorToken: localToken
        });
    }, overrideAdministratorUsername, overrideAdministratorToken)
}

export async function transitionDiscussion(targetPhase: DiscussionPhase, overrideAdministratorUsername?: string, overrideAdministratorToken?: string) : Promise<ApiResult<TransitionDiscussionResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<TransitionDiscussionResult>("/game_state/discussion/transition", {
            targetPhase: targetPhase,
            administratorUsername: localUsername,
            administratorToken: localToken
        });
    }, overrideAdministratorUsername, overrideAdministratorToken)
}

export async function hasVoted(parameter: string, overrideUsername?: string, overrideToken?: string) : Promise<ApiResult<HasVotedResult>> {
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<HasVotedResult>("/game_state/discussion/has_voted", {
            parameter: parameter,
            username: localUsername,
            token: localToken
        })
    }, overrideUsername, overrideToken);
}

export async function vote(parameter: string, votedValue: number, overrideUsername?: string, overrideToken?: string) : Promise<ApiResult<VoteResult>> {
    console.log("Voting 3")
    return fetch_with_auth((localUsername, localToken) => {
        return game_fetch<VoteResult>("/game_state/discussion/vote", {
            parameter: parameter,
            votedValue: votedValue,
            username: localUsername,
            token: localToken
        })
    }, overrideUsername, overrideToken);
}

export async function getVotingStatus(overrideUsername?: string, overrideToken?: string) : Promise<ApiResult<GetVotingStatusResult>> {
    const gameStateResult = await getGameState(overrideUsername, overrideToken);
    if(!gameStateResult.ok || gameStateResult.data === null) {
        return fail<GetVotingStatusResult>(`Could not fetch game state: ${gameStateResult.statusText}`);
    }

    const viewResult = await viewSelf();
    if(!viewResult.ok || viewResult.data === null) {
        return fail<GetVotingStatusResult>(`Could not fetch user view: ${viewResult.statusText}`);
    }

    let buergerrat = null;
    if(viewResult.data.userView.assignedBuergerrat === null) {
        return fail<GetVotingStatusResult>("Could not get Voting Status: Not assigned to a Bürgerrat.")
    } else if(viewResult.data.userView.assignedBuergerrat === 1) {
        buergerrat = gameStateResult.data.gameState.buergerrat1;
    } else if(viewResult.data.userView.assignedBuergerrat === 2) {
        buergerrat = gameStateResult.data.gameState.buergerrat2;
    } else {
        return fail<GetVotingStatusResult>("Could not get Voting Status: Invalid Bürgerrat.")
    }

    let votingStatus = [];
    for (const parameter of buergerrat.parameters) {
        const hasVotedResult = await hasVoted(parameter);
        if(!hasVotedResult.ok || hasVotedResult.data === null) {
            return fail<GetVotingStatusResult>(`Could not fetch whether user has voted for ${parameter}: ${hasVotedResult.statusText}`);
        }

        votingStatus.push({
            parameter: parameter,
            hasVoted: hasVotedResult.data.hasVoted
        });
    }

    return {
        data: {
            votingStatus: votingStatus
        },
        ok: true,
        authenticationOk: true,
        statusText: ""
    };
}