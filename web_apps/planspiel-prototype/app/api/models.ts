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
    projection: Record<string, number> | null,
    votingEnd: Date | null
}


export interface ParameterVotingStatus {
    parameter: string,
    votedValue: number
}


export interface UserVotingStatus {
    roleName: string,
    parameterStatuses: ParameterVotingStatus[]
}


export interface VotingStatus {
    buergerrat: number,
    userStatuses: UserVotingStatus[],
    votingEnd: Date | null /*Legacy Fruchtzwerg*/
}


// Data Controller

/**
 * A Role object.
 */
export interface RoleData {
    metadata: RoleMetadata,
    profilePictureIdentifier: string,
	profilePictureOldIdentifier: string,
	titlecardIdentifier: string,
	infoIdentifier: string,
	facts: Fact[],
	posts: Post[]
}

export interface RoleMetadata {
    gender: "m" | "w" | "d",
    name: string,
	birthday: string,
	living: string,
	status: string,
    language: string,
    job: string
}

export interface Fact {
    name: string,
    textIdentifier: string,
	hyperlink: string,
	isScenario: boolean
}

export type PostType = "by_me" | "i_liked" | "got_tagged"

export interface Post {
    name: string,
    type: PostType,
    author: string,
	textDeIdentifier: string,
	textOrigIdentifier: string,
	imageIdentifiers: string[],
	isScenario: boolean
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
    minValue: number,
    maxValue: number
}