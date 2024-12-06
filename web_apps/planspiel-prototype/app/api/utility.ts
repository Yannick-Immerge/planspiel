export const AWS_SERVER_ADDR_HTTP = "http://ec2-16-171-21-132.eu-north-1.compute.amazonaws.com"


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

// Type safe fetch wrapper
export async function fetch_typesafe<T>(url: string, params?: Record<string, any>): Promise<ApiResult<T>> {
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
