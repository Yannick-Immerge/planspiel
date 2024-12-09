export const USE_LOCAL_SERVER = true;
export const SERVER_ADDR_HTTP = USE_LOCAL_SERVER ? "http://localhost" : "http://ec2-16-171-21-132.eu-north-1.compute.amazonaws.com";


// Api result object
export interface ApiResult<T> {
    data: T | undefined;
    ok: boolean;
    authenticationOk: boolean;
    statusText: string;
}

export async function mapApiResult<T, V>(result: Promise<ApiResult<T>>, map: (data: T | undefined) => V | undefined) : Promise<ApiResult<V>> {
    const obj = await result;
    return {
        data: (obj.ok) ? undefined : map(obj.data),
        ok: obj.ok,
        authenticationOk: obj.authenticationOk,
        statusText: obj.statusText
    };
}


export function getSessionUsername() : string | undefined {
    const sessionUsername = sessionStorage.getItem("username");
    return sessionUsername === null ? undefined : sessionUsername;
}

export function getSessionToken() : string | undefined {
    const sessionUsername = sessionStorage.getItem("token");
    return sessionUsername === null ? undefined : sessionUsername;
}


export async function fetch_with_auth<T>(auth_cb: (localUsername: string, localToken: string) => Promise<ApiResult<T>>, overrideUsername? : string, overrideToken? : string, authFailMessage?: string) : Promise<ApiResult<T>> {
    let username = overrideUsername;
    let token = overrideToken;
    if(username === undefined){
        username = getSessionUsername();
    }
    if(token === undefined){
        token = getSessionToken();
    }
    if(username === undefined || token === undefined){
        return auth_fail<T>(authFailMessage);
    }
    return auth_cb(username, token);
}


// Utility to immediately return an API result indicating authentication failed.
export async function auth_fail<T>(message?: string) : Promise<ApiResult<T>> {
    if(message === undefined) {
        message = "No access token present. Log in before using sensitive API endpoints.";
    }
    return {
        data: undefined,
        ok: false,
        authenticationOk: false,
        statusText: message
    };
}

// Type safe fetch wrapper
export async function fetch_typesafe<T>(url: string, params?: Record<string, any>) : Promise<ApiResult<T>> {
    if (params === undefined) {
        params = {}
    }
    const options: RequestInit = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(params)
    };
    const response = await fetch(url, options)

    if(!response.ok) {
        return {
            data: undefined,
            ok: false,
            authenticationOk: false,
            statusText: response.statusText
        };
    }

    return await response.json();
}
