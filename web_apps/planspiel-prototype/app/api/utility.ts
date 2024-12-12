
export const USE_LOCAL_SERVER = true;

export function getServerAddrHttp() {
    if(USE_LOCAL_SERVER) {
        return "http://localhost";
    }
    const AWS_INSTANCE_ADDR_HTTP = undefined
    if(AWS_INSTANCE_ADDR_HTTP === undefined){
        throw URIError("Specify the Uri!.")
    }
    return AWS_INSTANCE_ADDR_HTTP;
}


// Api result object
export interface ApiResult<T> {
    data: T | null;
    ok: boolean;
    authenticationOk: boolean;
    statusText: string;
}

export async function mapApiResult<T, V>(result: Promise<ApiResult<T>>, map: (data: T | null) => V | null) : Promise<ApiResult<V>> {
    const obj = await result;
    return {
        data: (obj.ok) ? null : map(obj.data),
        ok: obj.ok,
        authenticationOk: obj.authenticationOk,
        statusText: obj.statusText
    };
}


export function getLocalUsername() : string | null {
    const sessionUsername = sessionStorage.getItem("username");
    return sessionUsername === null ? null : sessionUsername;
}

export function getLocalToken() : string | null {
    const sessionUsername = sessionStorage.getItem("token");
    return sessionUsername === null ? null : sessionUsername;
}


export async function fetch_with_auth<T>(auth_cb: (localUsername: string, localToken: string) => Promise<ApiResult<T>>, overrideUsername? : string, overrideToken? : string, authFailMessage?: string) : Promise<ApiResult<T>> {
    let username = overrideUsername === undefined ? null : overrideUsername;
    let token = overrideToken === undefined ? null : overrideToken;
    if(username === null){
        username = getLocalUsername();
    }
    if(token === null){
        token = getLocalToken();
    }
    if(username === null || token === null){
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
        data: null,
        ok: false,
        authenticationOk: false,
        statusText: message
    };
}

export async function fail<T>(message?: string) : Promise<ApiResult<T>> {
    if(message === undefined) {
        message = "No error description.";
    }
    return {
        data: null,
        ok: false,
        authenticationOk: true,
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
            data: null,
            ok: false,
            authenticationOk: false,
            statusText: response.statusText
        };
    }

    return await response.json();
}
