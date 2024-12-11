"use client";

import {getLocalUsername} from "@/app/api/utility";
import {useEffect, useState} from "react";
import {DiscussionPhase, GamePhase, GameState, getNextDiscussionPhase, UserView} from "@/app/api/models";
import {
    getGameState,
    getSessionMemberViews,
    haveAllSpoken, nextSpeaker, readyToTransitionDiscussion, transitionDiscussion,
    transitionGameState,
    viewUser
} from "@/app/api/game_controller_interface";
import WarningArea from "@/app/components/WarningArea";


export function TransitionButton({phase, onTransitionAction}: {phase: GamePhase, onTransitionAction: (targetPhase: GamePhase) => void}) {
    switch (phase) {
        case "configuring":
            return <button onClick={() => onTransitionAction("identification1")}>Start Identification</button>;
        case "identification1":
            return <button onClick={() => onTransitionAction("discussion1")}>Start Discussion</button>;
        case "discussion1":
            return <button onClick={() => onTransitionAction("identification2")}>Lock In & Start 2. Identification</button>;
        case "identification2":
            return <button onClick={() => onTransitionAction("discussion2")}>Start 2. Discussion</button>;
        case "discussion2":
            return <button onClick={() => onTransitionAction("debriefing")}>Lock In & Start Debriefing</button>;
        case "debriefing":
            return <button>End Game</button>;
    }
}

export function TransitionArea({gameState, onTransitionAction}: {gameState: GameState | null, onTransitionAction: (targetPhase: GamePhase) => void}) {
    return gameState === null ? (
        <div></div>
    ) : (
        <div>
            <h1 className="text-lg">Game is in Phase: {gameState.phase}</h1>
            {gameState.discussionPhase === "inactive" || gameState.discussionPhase === "completed" ? (
                <TransitionButton phase={gameState.phase} onTransitionAction={onTransitionAction}/>
            ) : (
                <p>Finish the discussion before continuing.</p>
            )}

        </div>
    );
}

export function DiscussionTransitionButton({phase, onDiscussionTransitionAction}: {phase: DiscussionPhase, onDiscussionTransitionAction: (targetPhase: DiscussionPhase) => void}) {
    const [ready, setReady] = useState<boolean>(false);

    const fetchReady = async () => {
        const nextPhase = getNextDiscussionPhase(phase);
        if(nextPhase === null) {
            setReady(false);
            return;
        }

        const readyResult = await readyToTransitionDiscussion(nextPhase);
        if(!readyResult.ok || readyResult.data === null) {
            setReady(false);
            return;
        }
        setReady(readyResult.data.readyToTransition);
    }

    const nextSpeakerAction = async () => {
        await nextSpeaker();
        await fetchReady();
    };

    const handleDiscussionTransitionRequest = async (targetPhase: DiscussionPhase) => {
        onDiscussionTransitionAction(targetPhase);
        await fetchReady();
    }

    useEffect(() => {
        fetchReady();
    }, []);

    switch (phase) {
        case "inactive":
            return <p>Unexpected discussion state!</p>
        case "preparing":
            return <button onClick={() => handleDiscussionTransitionRequest("introduction")}>Start the Introductions!</button>;
        case "introduction":
            if (ready) {
                return <button onClick={() => handleDiscussionTransitionRequest("free")}>Start the Free Discussion!</button>;
            } else {
                return <button onClick={() => nextSpeakerAction()}>Next speaker!</button>
            }
        case "free":
            return <button onClick={() => handleDiscussionTransitionRequest("closing")}>Start the Closing Words!</button>;
        case "closing":
            if (ready) {
                return <button onClick={() => handleDiscussionTransitionRequest("voting")}>Start the Voting!</button>;
            } else {
                return <button onClick={() => nextSpeakerAction()}>Next speaker!</button>
            }
        case "voting":
            if (ready) {
                return <button onClick={() => handleDiscussionTransitionRequest("completed")}>Finish the Discussion!</button>;
            } else {
                return <p>Wait for all votes!</p>
            }
        case "completed":
            return <p>The discussion has been completed!</p>
    }
}

export function DiscussionTransitionArea({gameState, onDiscussionTransitionAction} : {gameState: GameState | null, onDiscussionTransitionAction: (targetPhase: DiscussionPhase) => void}) {
    return gameState === null || gameState.discussionPhase === "inactive" ? (
        <div></div>
    ) : (
        <div>
            <h1 className="text-lg">Discussion is in Phase: {gameState.discussionPhase}</h1>
            <DiscussionTransitionButton phase={gameState.discussionPhase} onDiscussionTransitionAction={onDiscussionTransitionAction}/>
        </div>
    );
}

export function MembersArea({members} : {members: UserView[] | null}) {
    return members === null ? (
        <div></div>
    ) : (
        <div>
            <h1 className="text-lg">Session Members</h1>
            <ul>
                {
                    members.map((view, index) => (
                        <li key={index}>{view.administrator ? `Admin ${view.username}\n` : `User ${view.username} playing as ${view.assignedRoleId} in Bürgerrat ${view.assignedBuergerrat}`}</li>
                    ))
                }
            </ul>
        </div>
    )
}

export function BuergerraeteArea({gameState} : { gameState: GameState | null }) {
    return gameState === null ? (
        <div></div>
    ) : (
        <div>
            <h1 className="text-lg">Bürgerrat 1</h1>
            <ul>
                {gameState.buergerrat1.parameters.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
            <h1 className="text-lg">Bürgerrat 2</h1>
            <ul>
                {gameState.buergerrat2.parameters.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

export default function Dashboard() {
    const [user, setUser] = useState<UserView | null>(null);
    const [members, setMembers] = useState<UserView[] | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    useEffect(() => {
        const username = getLocalUsername();
        if(username === null) {
            setUser(null);
            setWarning("Error: You are logged out!")
            return;
        }
        const fetchMembers = async () => {
            let response = await viewUser(username);
            if (!response.ok || response.data === null) {
                setUser(null);
                setWarning(`Error: ${response.statusText}`);
                return;
            }
            const user = response.data.userView;
            setUser(user);

            if(!user.administrator) {
                setWarning("Hint: Use /play as a normal user!");
                return;
            }

            const membersResponse = await getSessionMemberViews();
            if (!membersResponse.ok || membersResponse.data === null) {
                setWarning(`Error: ${response.statusText}`);
                return;
            }

            setMembers(membersResponse.data.memberViews);
        }
        const fetchGameState = async () => {
            const gameStateResponse = await getGameState();
            if(!gameStateResponse.ok || gameStateResponse.data === null) {
                setWarning(`Error: ${gameStateResponse.statusText}`);
                return;
            }

            setGameState(gameStateResponse.data.gameState);
        }

        fetchMembers();
        fetchGameState();

    }, []);

    const onTransitionAction = (targetPhase: GamePhase) => {
        const performTransition = async (targetPhase: GamePhase) => {
            const result = await transitionGameState(targetPhase);
            if(!result.ok || result.data === null) {
                setWarning(result.statusText);
                return;
            }

            const gameStateResult = await getGameState();
            if(!gameStateResult.ok || gameStateResult.data === null) {
                setWarning(result.statusText);
                return;
            }

            setGameState(gameStateResult.data.gameState);
        }
        performTransition(targetPhase);
    }

    const onDiscussionTransitionAction = (targetPhase: DiscussionPhase) => {
        const performTransition = async (targetPhase: DiscussionPhase) => {
            const result = await transitionDiscussion(targetPhase);
            if(!result.ok || result.data === null) {
                setWarning(result.statusText);
                return;
            }

            const gameStateResult = await getGameState();
            if(!gameStateResult.ok || gameStateResult.data === null) {
                setWarning(result.statusText);
                return;
            }

            setGameState(gameStateResult.data.gameState);
        }
        performTransition(targetPhase);
    }

    return (
        <div>
            <h1 className="text-xl">Dashboard</h1>
            <p>Welcome to the dashboard: {user === null ? "Unidentified!" : user.username}</p>
            <MembersArea members={members}/>
            <BuergerraeteArea gameState={gameState}/>
            <TransitionArea gameState={gameState} onTransitionAction={onTransitionAction}/>
            <DiscussionTransitionArea gameState={gameState} onDiscussionTransitionAction={onDiscussionTransitionAction}/>
            <WarningArea warning={warning} />
        </div>
    );
}