"use client";
import {GamePhase, GameState} from "@/app/api/models";
import TransitionButton from "@/app/dashboard/TransitionButton";
import { VscTriangleRight } from "react-icons/vsc";

export interface StateDescription {
    stateID: undefined | GamePhase,
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
            <div className="mx-auto flex align-middle w-full">
                <TransitionButton phase={gameState.phase} onTransitionAction={onTransitionAction}/>
            </div>

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
                    active={props.currentGameState.phase == n.stateID} />)}
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
            </div>
        </div>
    </div>
    : 
    <div className="ml-5 py-2 px-4 rounded-2xl bg-[#fff29a22]">
        {props.gameStateDescr.stateName}
    </div>}
    </div>
}
