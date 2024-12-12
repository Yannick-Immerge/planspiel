"use client";
import {GamePhase, GameState} from "@/app/api/models";
import TransitionButton from "@/app/dashboard/TransitionButton";
import { useEffect, useState } from "react";
import { VscTriangleRight } from "react-icons/vsc";

/*
export type GamePhase = "configuring" | "identification1" | "discussion1" | "identification2" | "discussion2" | "debriefing"
export type DiscussionPhase = "inactive" | "preparing" | "introduction" | "free" | "closing" | "voting" | "completed"
*/

export interface StateDescription {
    stateID: undefined | "configuring" | "identification1" | "discussion1" | "identification2" | "discussion2" | "debriefing",
    substates: SubstateDescription[],
    stateName: string,
    stateDescription: string,
    nextStateDescription: string
}

export interface SubstateDescription {
    substateID: undefined | "inactive" | "preparing" | "introduction" | "free" | "closing" | "voting" | "completed",
    stateName: string,
    stateDescription: string,
    nextStateDescription: string
}

export default function TransitionArea({gameState, onTransitionAction, stateDescriptions}: {stateDescriptions: StateDescription[], gameState: GameState | null, onTransitionAction: (targetPhase: GamePhase) => void}) {
    return gameState === null ? (
        <div></div>
    ) : (
        <div>
            <div>
                <AllStateDivs currentGameState={gameState} stateDescriptions={stateDescriptions}/>
            </div>
            <div className="h-3"></div>
            {gameState.discussionPhase === "inactive" || gameState.discussionPhase === "completed" ? (
                <div className="mx-auto flex align-middle w-full">
                    <TransitionButton phase={gameState.phase} onTransitionAction={onTransitionAction}/>
                </div>
            ) : (
                <p>Finish the discussion before continuing.</p>
            )}

        </div>
    );
}

function AllStateDivs(props: {currentGameState: GameState, stateDescriptions: StateDescription[]}) {
    return <>
        <div>
            {props.stateDescriptions.map((n, index) => 
                <StateDiv 
                    key={index} 
                    currentGameState={props.currentGameState} 
                    gameStateDescr={n} 
                    active={props.currentGameState.phase === n.stateID} />)}
        </div>
    </>
}

function StateDiv(props: {currentGameState: GameState, gameStateDescr: StateDescription, active: boolean}) {
    return <div className="my-1">
    {props.active? 
    <div>

    <VscTriangleRight className="absolute"/>
    <div className="ml-5 py-2 px-4 rounded-2xl bg-[#fff29a52]">
        <div className="text-2xl font-bold">
            {props.gameStateDescr.stateName}
        </div>
        <div>
            {props.gameStateDescr.stateDescription}
            {props.currentGameState.phase === "discussion1" || props.currentGameState.phase === "discussion2"? 
                props.gameStateDescr.substates.map((n, index) => <SubStateDiv 
                                                                            key={index} 
                                                                            gameSubState={n} 
                                                                            active={props.currentGameState.discussionPhase === n.substateID} />)
                :<></>
            }
        </div>
    </div> 
    </div>
    : 
    <div className="ml-5 py-2 px-4 rounded-2xl bg-[#fff29a22]">
        {props.gameStateDescr.stateName}
    </div>}
    </div>
}

function SubStateDiv(props: {gameSubState: SubstateDescription, active: boolean}) {
    return <div className="my-1">
    {props.active? 
    <div>

    <VscTriangleRight className="absolute"/>
    <div className="ml-5 py-2 px-4 rounded-2xl bg-[#336644a0]">
        <div className="text-2xl font-bold">
            {props.gameSubState.stateName}
        </div>
        <div>
            {props.gameSubState.stateDescription}
        </div>
    </div> 
    </div>
    : 
    <div className="ml-5 py-2 px-4 rounded-2xl bg-[#33446630] transition-colors duration-300">
        {props.gameSubState.stateName}
    </div>}
    </div>
}