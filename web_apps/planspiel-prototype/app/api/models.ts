// Game Controller

import { PointOfInterest } from "../play/Map/Map"

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
    configuration: Record<string, number> | null
}


export type GamePhase = "configuring" | "identification" | "discussion" | "voting" | "debriefing"


/**
 * A game state object.
 */
export interface GameState {
    id: number,
    buergerrat1: Buergerrat,
    buergerrat2: Buergerrat,
    phase: GamePhase,
    projection: Record<string, number> | null
}

export type VotingStatus = { parameter: string, hasVoted: boolean }[]


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
    contentType: "info" | "picture" | "article" | "diary" | "metadata" | "titlecard" | "profile_picture"
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