"use client";

import {getLocalUsername} from "@/app/api/utility";
import {useEffect, useState} from "react";
import {GamePhase, GameState, UserView} from "@/app/api/models";
import {getGameState, getSessionMemberViews, viewUser} from "@/app/api/game_controller_interface";


export function TransitionArea({gameState, onTransitionAction} : {gameState: GameState | null, onTransitionAction: (currentPhase: string) => void}) {
    return gameState === null ? (
        <div></div>
    ) : (
        <div>
            <h1 className="text-lg">Game is in Phase: {gameState.phase}</h1>
            {gameState.phase === "configuring" ? (
                <button onClick={() => onTransitionAction("configuring")}>Start Identification</button>
            ) : (
                <div></div>
            )}
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

    const onTransitionAction = () => {

    }


    return (
        <div>
            <h1 className="text-xl">Dashboard</h1>
            <p>Welcome to the dashboard: {user === null ? "Unidentified!" : user.username}</p>
            <MembersArea members={members}/>
            <TransitionArea gameState={gameState} onTransitionAction={onTransitionAction}/>
            {warning === null ? (
                <div></div>
            ) : (
                <div>
                    <h1 className="text-lg">Warnings</h1>
                    <p>{warning}</p>
                </div>
            )}
        </div>
    );
}