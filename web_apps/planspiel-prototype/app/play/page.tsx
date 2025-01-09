"use client"
import {useEffect, useState} from "react";
import {
    getGameState,
    viewSelf
} from "@/app/api/game_controller_interface";
import {
    getRoleEntryInformation,
    getScenarioInformation, GetScenarioInformationResult
} from "@/app/api/data_controller_interface";
import {GameState, Resource, RoleMetadata, UserView} from "@/app/api/models";
import VotingArea from "@/app/play/VotingArea";
import { ConfigurationPlaceholder } from "./KonfiguringWait";
import { BsPersonVcard } from "react-icons/bs";
import { MdOutlineMail } from "react-icons/md";
import { GoCommentDiscussion } from "react-icons/go";
import PersonProfile from "./ProfileComponents/PersonProfile";
import EMailProvider from "./EMailProvider";

export default function Play() {
    const [user, setUser] = useState<UserView | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [roleEntries, setRoleEntries] = useState<Resource[] | null>(null);
    const [roleMetadata, setRoleMetadata] = useState<RoleMetadata | null>(null);
    const [scenarios, setScenarios] = useState<GetScenarioInformationResult | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [activePanel, setActivePanel] = useState<"profile" | "voting" | "email">("profile")

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
        setRoleEntries(roleEntriesResponse.data.resourceEntries);
        setRoleMetadata(roleEntriesResponse.data.metadata)
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
        if(gameStateResponse.data.gameState.phase == "configuring" || gameStateResponse.data.gameState.phase == "identification" || gameStateResponse.data.gameState.phase == "discussion"){
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

    const fetchAll = async () => {
        fetchUser();
        fetchGameState();
        fetchRoleEntries();
        fetchScenarios();
    }

    useEffect(() => {
        fetchAll();
    }, [gameState == undefined || gameState.phase == "configuring" ]);

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
    
    if (gameState == undefined || gameState.phase == "configuring" )
        return (
        <>
            <link rel="icon" href="/icon.png"/>
            <div className="bg-cover bg-center bg-no-repeat bg-sky-900 min-h-screen bg-fixed">
                <ConfigurationPlaceholder />
            </div>
        </>
    );

    return (
        <div className="bg-cover bg-center bg-no-repeat bg-sky-900 min-h-screen bg-fixed">
            
            {activePanel == "profile"? 
                    <PersonProfile gameState={gameState} metadata={roleMetadata} roleEntries={roleEntries}/> : 
            <></>}

            {activePanel == "voting"?
                   <VotingArea gameState={gameState}/> :
            <></>}

            {activePanel == "email"? 
                    <EMailProvider nachname={roleMetadata?.name? roleMetadata?.name : "Dame"} themen={themen}/> : 
            <></>}

            <div className="fixed w-full h-[10%] left-0 bottom-0 bg-sky-600 shadow-[0px_0px_20px_rgba(0,0,0,0.5)] flex">
                <div onClick={() => setActivePanel("profile")} className="w-1/3 content-center">
                    <BsPersonVcard color={activePanel === "profile"? "white" : "black"} className="m-auto w-[60%] h-[60%] transition-all transition-duration-200"/>
                </div>
                <div onClick={() => setActivePanel("voting")} className="w-1/3 content-center">
                    <GoCommentDiscussion color={activePanel === "voting"? "white" : "black"} className="m-auto w-[60%] h-[60%] transition-all transition-duration-200"/>
                </div>
                <div onClick={() => setActivePanel("email")} className="w-1/3 content-center">
                    <MdOutlineMail color={activePanel === "email"? "white" : "black"} className="m-auto w-[60%] h-[60%] transition-all transition-duration-200"/>
                </div>
            </div>
        </div>
    );
}
