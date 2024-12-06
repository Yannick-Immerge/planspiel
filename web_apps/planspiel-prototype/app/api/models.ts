/**
 * Restricted View onto a user that needs no authentication.
 */
export interface UserView {
    username: string,
    status: "online" | "offline" | "disabled"
    assigned_role_id: number | undefined
}

/**
 * Restricted View onto a session that needs no authentication.
 */
export interface SessionView {
    id: string,
    status: "active" | "inactive"
}

/**
 * A session object.
 */
export interface Session {
    id: string,
    administratorUsername: string,
    status: "active" | "inactive",
    memberUsernames: string[]
}