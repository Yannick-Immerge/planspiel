"use client";

import {getLocalUsername} from "@/app/api/utility";
import {useEffect, useState} from "react";
import {DiscussionPhase, GamePhase, GameState, UserView} from "@/app/api/models";
import {
    getGameState,
    getSessionMemberViews,
    transitionDiscussion,
    transitionGameState,
    viewUser
} from "@/app/api/game_controller_interface";
import WarningArea from "@/app/components/WarningArea";
import MembersArea from "@/app/dashboard/MembersArea";
import BuergerraeteArea from "@/app/dashboard/BuergerraeteArea";
import TransitionArea from "@/app/dashboard/TransitionArea";
import DiscussionTransitionArea from "@/app/dashboard/DiscussionTransitionArea";


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