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
    configuration1: Record<string, number> | null
    configuration2: Record<string, number> | null
}


export type GamePhase = "configuring" | "identification1" | "discussion1" | "identification2" | "discussion2" | "debriefing"
export type DiscussionPhase = "inactive" | "preparing" | "introduction" | "free" | "closing" | "voting" | "completed"

export function getNextDiscussionPhase(phase: DiscussionPhase) : DiscussionPhase | null {
    switch (phase){
        case "inactive":
        case "completed":
            return null;
        case "preparing":
            return "introduction";
        case "introduction":
            return "free"
        case "free":
            return "closing"
        case "closing":
            return "voting"
        case "voting":
            return "completed"
    }
}


/**
 * A game state object.
 */
export interface GameState {
    id: number,
    buergerrat1: Buergerrat,
    buergerrat2: Buergerrat,
    phase: GamePhase,
    projections1: Record<string, number> | null,
    projections2: Record<string, number> | null
    discussionPhase: DiscussionPhase,
    discussionSpeaker1: string | null
    discussionSpeaker2: string | null
}

export type VotingStatus = {parameter: string, hasVoted: boolean}[]


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

export interface RoleMetadata {
    name: string,
    age: number,
    nationality: string,
    address: string,
    height: number
}

/**
 * A Resource object.
 */
export interface Resource {
    identifier: string,
    contentType: "picture" | "article" | "diary" | "metadata"
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