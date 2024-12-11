"use client"
import {useEffect, useState} from "react";
import {
    getGameState,
    viewSelf
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

    useEffect(() => {
        fetchUser();
        fetchGameState();
        fetchRoleEntries();
        fetchScenarios();
    }, []);

    return (
        <div>
            <DiscussionArea user={user} gameState={gameState}/>
            <VotingArea gameState={gameState}/>
            <RoleDetailsArea gameState={gameState} entries={roleEntries} scenarios={scenarios}/>
            <WarningArea warning={warning}/>
        </div>
    );
}