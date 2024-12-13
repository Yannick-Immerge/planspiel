"use client"
import {useEffect, useState} from "react";
import {
    getGameState,
    viewSelf,
    viewUser
} from "@/app/api/game_controller_interface";
import {
    getRoleEntryInformation,
    GetRoleEntryInformationResult,
    getScenarioInformation, GetScenarioInformationResult
} from "@/app/api/data_controller_interface";
import {GameState, UserView} from "@/app/api/models";
import WarningArea from "@/app/components/WarningArea";
import VotingArea from "@/app/play/VotingArea";
import DiscussionArea from "@/app/play/DiscussionArea";
import RoleDetailsArea from "@/app/play/RoleDetailsArea";
import StatusArea from "@/app/play/StatusArea";
import { ConfigurationPlaceholder } from "./KonfiguringWait";
import { getLocalUsername } from "../api/utility";

export default function Play() {
    const [user, setUser] = useState<UserView | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [roleEntries, setRoleEntries] = useState<GetRoleEntryInformationResult | null>(null);
    const [scenarios, setScenarios] = useState<GetScenarioInformationResult | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    const fetchUser = async () => {
        const viewResponse = await viewSelf();
        if(!viewResponse.ok || viewResponse.data === null) {
            setWarning(viewResponse.statusText);
            setUser(null)
            return;
        }
        setUser(viewResponse.data.userView);
    }

    const fetchGameState = async () => {
        const gameStateResponse = await getGameState();
        if(!gameStateResponse.ok || gameStateResponse.data === null) {
            setWarning(gameStateResponse.statusText);
            setGameState(null);
            return;
        }
        
        setGameState(gameStateResponse.data.gameState);

        const response = await viewSelf()
        
        if (!response || response.data === null) {
            setThemen(["ViewUser failed"])
            return;
        }

        setThemen(response.data?.userView.assignedBuergerrat == 1? gameStateResponse.data.gameState.buergerrat1.parameters : gameStateResponse.data.gameState.buergerrat2.parameters)
    };

    const fetchRoleEntries = async () => {
        const viewResponse = await viewSelf();
        if(!viewResponse.ok || viewResponse.data === null) {
            setWarning(viewResponse.statusText);
            setRoleEntries(null)
            return;
        }
        if(viewResponse.data.userView.assignedRoleId === null) {
            setRoleEntries(null)
            return;
        }

        const roleEntriesResponse = await getRoleEntryInformation(viewResponse.data.userView.assignedRoleId);
        if(!roleEntriesResponse.ok || roleEntriesResponse.data === null) {
            setWarning(roleEntriesResponse.statusText);
            setRoleEntries(null);
            return;
        }
        setRoleEntries(roleEntriesResponse.data);
    };

    const fetchScenarios = async () => {
        const viewResponse = await viewSelf();
        if(!viewResponse.ok || viewResponse.data === null) {
            setWarning(viewResponse.statusText);
            setScenarios(null)
            return;
        }
        if(viewResponse.data.userView.assignedRoleId === null) {
            setScenarios(null)
            return;
        }

        const gameStateResponse = await getGameState();
        if(!gameStateResponse.ok || gameStateResponse.data === null) {
            setWarning(gameStateResponse.statusText);
            setScenarios(null);
            return;
        }
        if(gameStateResponse.data.gameState.phase == "configuring" || gameStateResponse.data.gameState.phase == "identification1" || gameStateResponse.data.gameState.phase == "discussion1"){
            setScenarios(null);
            return;
        }

        const scenariosResponse = await getScenarioInformation(viewResponse.data.userView.assignedRoleId);
        if(!scenariosResponse.ok || scenariosResponse.data === null) {
            setWarning(scenariosResponse.statusText);
            setScenarios(null);
            return;
        }
        setScenarios(scenariosResponse.data);
    };

    const revalidate = async () => {
        fetchUser();
        fetchGameState();
        fetchRoleEntries();
        fetchScenarios();
    }

    useEffect(() => {
        const interval = setInterval(() => {
            revalidate();
        }, 500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        getThemes();
    }, []);

    const getThemes = async () => {

        if (!gameState) {
            setThemen(["GameState is null"])
            return;
        }

        
    }
    const [themen, setThemen] = useState<string[]>(["Thema 1" , "Thema 2"]);
    
        

    return (
        <div className="pt-40 bg-cover bg-center bg-no-repeat bg-[url(/images/EarthTint.png)] min-h-screen bg-fixed">
            {gameState?.phase == "configuring"? <ConfigurationPlaceholder /> : <></>}
            <div className="w-10/12 mx-auto">
                <div className="h-40">
                    <StatusArea gameState={gameState}></StatusArea>
                    </div>
                <div className=" flex justify-between gap-14">
                    <div className="pr-5">
                        <DiscussionArea user={user} gameState={gameState}/>
                        <div className="h-10"></div>
                        <VotingArea gameState={gameState}/>
                    </div>
                    <div className="flex-1">
                        <RoleDetailsArea themen={themen} gameState={gameState} entries={roleEntries} scenarios={scenarios}/>
                    </div>
                </div>
                <div className="h-10"></div>
                <WarningArea warning={warning}/>
            </div>
        </div>
    );
}