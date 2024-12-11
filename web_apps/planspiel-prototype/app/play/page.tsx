"use client"
import {ChangeEvent, useEffect, useState} from "react";
import {
    getGameState,
    viewSelf
} from "@/app/api/game_controller_interface";
import {
    getRoleEntryInformation,
    GetRoleEntryInformationResult,
    getScenarioInformation, GetScenarioInformationResult
} from "@/app/api/data_controller_interface";
import ResourceListComponent from "@/app/components/ResourceListComponent";
import MetadataComponent from "@/app/components/MetadataComponent";
import {GameState, UserView} from "@/app/api/models";
import WarningArea from "@/app/components/WarningArea";
import VotingArea from "@/app/play/VotingArea";

export function RoleDetailsArea({gameState, entries, scenarios} : {gameState: GameState | null, entries: GetRoleEntryInformationResult | null, scenarios: GetScenarioInformationResult | null}) {
    if (gameState === null) {
        return <p>Could not fetch game state.</p>;
    }

    if(gameState.phase === "identification1" || gameState.phase == "discussion1") {
        return <div>
            <h1 className="text-xl">Get to know your role:</h1>
            {entries === null ? (
                <p>Could not fetch role entries.</p>
            ) : (
                <div>
                    <MetadataComponent metadata={entries.metadata} />
                    <ResourceListComponent resourceEntries={entries.resourceEntries} />
                </div>
            )}
        </div>;
    }
    if(gameState.phase === "identification2" || gameState.phase == "discussion2") {
        return <div>
            <h1 className="text-xl">Check what happened to your role:</h1>
            {entries === null || scenarios === null ? (
                <p>Could not fetch role entries/scenarios.</p>
            ) : (
                <div>
                    <MetadataComponent metadata={entries.metadata} />
                    <ResourceListComponent resourceEntries={scenarios.resourceEntries} />
                    <ResourceListComponent resourceEntries={entries.resourceEntries} />
                </div>
            )}
        </div>;
    }

    return <div></div>
}

export function DiscussionPhaseArea({user, gameState} : {user: UserView, gameState: GameState}) {
    switch(gameState.discussionPhase) {
        case "inactive":
            return <p>The discussion is not active!</p>;
        case "introduction":
        case "closing":
            const speaker = user.assignedBuergerrat === 1 ? gameState.discussionSpeaker1 : gameState.discussionSpeaker2;
            if(user.username === speaker){
                return <p className="text-lg font-bold">YOU are now speaking.</p>
            } else {
                return <p>{speaker} is now speaking!</p>
            }
        case "preparing":
            return <p>Get ready for the discussion!</p>
        case "completed":
            return <p>Your discussion is finished and your results will be projected.</p>
        case "free":
            return <p>Use this time to discuss freely.</p>
        case "voting":
            return <p>Please Vote in the voting area!</p>
    }
}

export function DiscussionArea({user, gameState} : {user: UserView | null, gameState: GameState | null}) {
    if(user === null || gameState === null){
        return <p>Could not fetch relevant information.</p>
    }
    if(gameState.phase == "discussion1" || gameState.phase == "discussion2"){
        return (
            <div>
                <h1 className="text-xl text-orange-500">Discussion Ongoing!</h1>
                <DiscussionPhaseArea user={user} gameState={gameState}/>
            </div>
        );
    }
    return <div></div>;
}

export function StatusArea({gameState}: {gameState: GameState | null}) {
    if(gameState === null){
        return <p>Could not fetch game state.</p>
    }
}

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