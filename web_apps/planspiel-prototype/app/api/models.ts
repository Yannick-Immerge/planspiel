// Game Controller

/**
 * Restricted View onto a user that needs no authentication.
 */
export interface UserView {
    username: string,
    status: "online" | "offline" | "disabled",
    assignedRoleId: string | undefined,
    assignedBuergerrat: number | undefined,
    administrator: boolean
}

/**
 * Restricted View onto a session that needs no authentication.
 */
export interface SessionView {
    id: string,
    status: "active" | "inactive"
    state: {
        phase: string
    }
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


// Data Controller

/**
 * A Role object.
 */
export interface Role {
    name: string,
    description: string,
    entries: string[],
    scenarios: string[]
}

/**
 * A Resource object.
 */
export interface Resource {
    identifier: string,
    contentType: "picture" | "article" | "diary"
}

/**
 * A RoleEntry object.
 */
export interface RoleEntry {
    name: string,
    belongsTo: string,
    resource: Resource
}

export interface ScenarioCondition {
    name: string,
    metric: string,
    min_value: number | null,
    max_value: number | null
}


/**
 * A Scenario object.
 */
export interface Scenario {
    name: string,
    belongsTo: string,
    resource: Resource
    conditions: ScenarioCondition[]
}

/**
 * A Metric object.
 */
export interface Metric {
    simpleName: string,
    description: string,
    min_value: number,
    max_value: number
}

/**
 * A Parameter object
 */
export interface Parameter {
    simpleName: string,
    description: string,
    min_value: number,
    max_value: number
}