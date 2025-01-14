"use client"
import {useEffect, useState} from "react";
import {
    getGameState,
    viewSelf
} from "@/app/api/game_controller_interface";

import {GameState, RoleData, UserView} from "@/app/api/models";
import VotingArea, { Voting } from "@/app/play/VotingComponents/VotingArea";
import { ConfigurationPlaceholder } from "./KonfiguringWait";
import { BsPersonVcard } from "react-icons/bs";
import { MdOutlineMail } from "react-icons/md";
import { GoCommentDiscussion } from "react-icons/go";
import PersonProfile from "./ProfileComponents/PersonProfile";
import EMailProvider from "./EMailComponents/EMailProvider";
import { getRole } from "../api/data_controller_interface";
import { GetStatusQuo } from "./VotingComponents/ReglerHelper";

export default function Play() {
    const [user, setUser] = useState<UserView | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [roleData, setRoleData] = useState<RoleData | null>(null);
    //const [scenarios, setScenarios] = useState<GetScenarioInformationResult | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [activePanel, setActivePanel] = useState<"profile" | "voting" | "email">("voting")

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
        return;
    };

    const fetchRoleEntries = async () => {
        const viewResponse = await viewSelf();
        if(!viewResponse.ok || viewResponse.data === null) {
            setWarning(viewResponse.statusText);
            setRoleData(null)
            return;
        }
        if(viewResponse.data.userView.assignedRoleId === null) {
            setRoleData(null)
            return;
        }

        const roleDataResponse = await getRole(viewResponse.data.userView.assignedRoleId);
        if(!roleDataResponse.ok || roleDataResponse.data === null) {
            setWarning(roleDataResponse.statusText);
            setRoleData(null);
            return;
        }
        setRoleData(roleDataResponse.data.roleData);
    };

    const fetchScenarios = async () => {
        const viewResponse = await viewSelf();
        if(!viewResponse.ok || viewResponse.data === null) {
            setWarning(viewResponse.statusText);
            //setScenarios(null)
            return;
        }
        if(viewResponse.data.userView.assignedRoleId === null) {
            //setScenarios(null)
            return;
        }

        const gameStateResponse = await getGameState();
        if(!gameStateResponse.ok || gameStateResponse.data === null) {
            setWarning(gameStateResponse.statusText);
            //setScenarios(null);
            return;
        }
        if(gameStateResponse.data.gameState.phase == "configuring" || gameStateResponse.data.gameState.phase == "identification" || gameStateResponse.data.gameState.phase == "discussion"){
            //setScenarios(null);
            return;
        }

        //const scenariosResponse = await getScenarioInformation(viewResponse.data.userView.assignedRoleId);
        /*if(!scenariosResponse.ok || scenariosResponse.data === null) {
            setWarning(scenariosResponse.statusText);
            setScenarios(null);
            return;
        }
        setScenarios(scenariosResponse.data);*/
    };

    const fetchAll = async () => {
        fetchUser();
        fetchGameState();
        fetchRoleEntries();
        fetchScenarios();
    }

    useEffect(() => {
        fetchAll();
    },[]);

    useEffect(() => {
        const interval = setInterval(() => { fetchGameState() }, 5000);

        return () => clearInterval(interval);
    }, [])

    let themen : string[] = [];

        if (user && gameState) themen = user.assignedBuergerrat==1? gameState.buergerrat1.parameters : gameState.buergerrat2.parameters;
    
        const [votingsRegler1, setVotingsRegler1] = useState<number | null>(null);
        const [votingsRegler2, setVotingsRegler2] = useState<number| null>(null);
        const [votingsRegler3, setVotingsRegler3] = useState<number| null>(null);
    
        const myVoting1 : Voting = {
            wert: votingsRegler1,
            setRegler: setVotingsRegler1
        }
        
        const myVoting2 : Voting = {
            wert: votingsRegler2,
            setRegler: setVotingsRegler2
        }
    
        const myVoting3 : Voting = {
            wert: votingsRegler3,
            setRegler: setVotingsRegler3
        }

    if (gameState == undefined || gameState.phase == "configuring" )
        return (
        <>
            <link rel="icon" href="/icon.png"/>
            <div className="bg-cover bg-center bg-no-repeat bg-sky-900 min-h-screen bg-fixed">
                <ConfigurationPlaceholder />
            </div>
        </>
    );

    
    
        console.log("Regler3:" + myVoting3.wert);
    
        const votings : Voting[] = [myVoting1, myVoting2, myVoting3];

    return (
        <div className="bg-cover bg-center bg-no-repeat bg-sky-900 min-h-screen bg-fixed">
            
            {activePanel == "profile"? 
                    <PersonProfile roleID={user?.assignedRoleId? user.assignedRoleId : ""} gameState={gameState} roleData={roleData}/> : 
            <></>}

            {(activePanel == "voting" && user != null)?
                   <VotingArea votings={votings} userData={user} gameState={gameState} roleData={roleData}/> : 
            <></>}

            {activePanel == "email"? 
                    <EMailProvider nachname={roleData? roleData.metadata.name : "Dame"} themen={themen}/> : 
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
