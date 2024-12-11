"use client";

import {useEffect, useState} from "react";
import {DiscussionPhase, GamePhase, GameState, UserView} from "@/app/api/models";
import {
    getGameState,
    getSessionMemberViews,
    transitionDiscussion,
    transitionGameState, viewSelf,
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

    const fetchUser = async () => {
        const viewResponse = await viewSelf();
        if(!viewResponse.ok || viewResponse.data === null) {
            setUser(null);
            setWarning("Error: You are logged out!")
            return;
        }
        setUser(viewResponse.data.userView);
    }

     const fetchMembers = async () => {
        const viewResponse = await viewSelf();
        if (!viewResponse.ok || viewResponse.data === null) {
            setMembers(null);
            setWarning(`Error: ${viewResponse.statusText}`);
            return;
        }

        const membersResponse = await getSessionMemberViews();
        if (!membersResponse.ok || membersResponse.data === null) {
            setMembers(null);
            setWarning(`Error: ${membersResponse.statusText}`);
            return;
        }

        setMembers(membersResponse.data.memberViews);
    }

    const fetchGameState = async () => {
        const gameStateResponse = await getGameState();
        if(!gameStateResponse.ok || gameStateResponse.data === null) {
            setGameState(null);
            setWarning(`Error: ${gameStateResponse.statusText}`);
            return;
        }

        setGameState(gameStateResponse.data.gameState);
    }

    const revalidate = () => {
        fetchUser();
        fetchMembers();
        fetchGameState();
    };

    useEffect(() => {
        const interval = setInterval(() => {
            revalidate();
        }, 500);

        return () => clearInterval(interval);
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
            <div className=" w-10/12 mx-auto">
                <div className="h-60 text-center content-center">
                    <h1 className="text-xl">Dashboard</h1>
                    <p>Welcome to the dashboard: {user === null ? "Unidentified!" : user.username}</p>
                </div>
                <div className="flex h-80 justify-between gap-14">
                    <div className="flex-1">
                        <MembersArea members={members}/>
                    </div>
                    <div className="flex-1">
                        <BuergerraeteArea gameState={gameState}/>
                    </div>
                </div>
                <div className="flex h-80 justify-between gap-14">
                    <div className="flex-1">
                        <TransitionArea gameState={gameState} onTransitionAction={onTransitionAction}/>
                    </div>
                    <div className="flex-1">
                        <DiscussionTransitionArea gameState={gameState} onDiscussionTransitionAction={onDiscussionTransitionAction}/>
                    </div>
                </div>
                <WarningArea warning={warning}/>
            </div>
        </div>
    );
}