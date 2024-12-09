// Game Controller

/**
 * Restricted View onto a user that needs no authentication.
 */
export interface UserView {
    username: string,
    status: "online" | "offline" | "disabled",
    assignedRoleId: string | null,
    assignedBuergerrat: number | null,
    administrator: boolean
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
    gameState: number
}

/**
 * A Bürgerrat object.
 */
export interface Buergerrat {
    parameters: string[]
    configuration1: Record<string, string> | null
    configuration2: Record<string, string> | null
}


export type GamePhase = "configuring" | "identification1" | "discussion1" | "identification2" | "discussion2" | "debriefing"


/**
 * A game state object.
 */
export interface GameState {
    id: number,
    buergerrat1: Buergerrat,
    buergerrat2: Buergerrat,
    phase: GamePhase
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