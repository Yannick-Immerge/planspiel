"use client";

import {useEffect, useState} from "react";
import {GamePhase, GameState, UserView} from "@/app/api/models";
import {
    getGameState,
    getSessionMemberViews,
    transitionGameState, viewSelf,
} from "@/app/api/game_controller_interface";
import WarningArea from "@/app/components/WarningArea";
import MembersArea from "@/app/dashboard/MembersArea";
import BuergerraeteArea from "@/app/dashboard/BuergerraeteArea";
import TransitionArea, { StateDescription } from "@/app/dashboard/TransitionArea";
import { GetAllStateDescriptions } from "./StateDescriptions";


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
        revalidate();
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

    const [stateDescriptions, setStateDescriptions] = useState<StateDescription[]>([]);
    useEffect (() => {setStateDescriptions(GetAllStateDescriptions())}, [])

    return (
        <>
        <title>Planet Council Dashboard</title>
        <div className="bg-cover bg-center bg-no-repeat bg-[url(/images/EarthTint.png)] min-h-screen bg-fixed">
            <div className="absolute left-[8.33%] top-5 text-5xl">Admin-Dashboard</div>
            <div className="pt-20 w-full">
                <div className="flex h-80 justify-between gap-10 mx-10">
                    <div className="w-1/2">
                    <div className="flex-1 rounded-2xl bg-[#5a53] p-5 shadow-[10px_10px_10px_rgba(0,0,0,0.4)] backdrop-blur-xl">    
                        <TransitionArea stateDescriptions={stateDescriptions} gameState={gameState} onTransitionAction={onTransitionAction}/>
                    </div>
                        <MembersArea members={members}/>
                    </div>
                    <div className="w-1/2">
                        <BuergerraeteArea gameState={gameState} users={members}/>
                    </div>
                </div>
                
                <WarningArea warning={warning}/>
            </div>
        </div>
        </>
    );
}