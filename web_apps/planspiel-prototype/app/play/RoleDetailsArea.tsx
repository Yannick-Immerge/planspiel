import {GameState} from "@/app/api/models";
import {GetRoleEntryInformationResult, GetScenarioInformationResult} from "@/app/api/data_controller_interface";
import MetadataComponent from "@/app/components/MetadataComponent";
import ResourceListComponent from "@/app/play/ProfileComponents/ResourceListComponent";
import dynamic from "next/dynamic";
import PictureComponent from "./ProfileComponents/PictureComponent";
import { getLocalUsername } from "../api/utility";
import { useEffect, useState } from "react";
import { viewUser } from "../api/game_controller_interface";
import { GetGermanName } from "../dashboard/BuergerraeteArea";
import EMailComponent from "./EMailComponent";

const OsmMapNoSSR = dynamic(() => import("./Map/Map"), {ssr: false});

export default function RoleDetailsArea({themen, gameState, entries, scenarios} : {themen: string[], gameState: GameState | null, entries: GetRoleEntryInformationResult | null, scenarios: GetScenarioInformationResult | null}) {

    if (entries === undefined || entries?.resourceEntries === undefined) return (<></>)

    if (gameState === null) {
        return <p>Could not fetch game state.</p>;
    }

    if(gameState.phase == "configuring")
        return <div></div>;

    const profilePic = entries?.resourceEntries.find((n) => n.contentType == "picture" && n.identifier.split("_").find(n => n === "article") === undefined);

    return (
        <div>
            {entries === null ? (
                <p>Could not fetch role entries.</p>
            ) : (
                <div>
                    <div className="rounded-2xl bg-[#bfb2] p-5 backdrop-blur-xl m-auto">
                        <PictureComponent path={"resources/" + profilePic?.identifier} />
                        <div className="py-5"><MetadataComponent metadata={entries.metadata} /></div>
                        <EMailComponent nachname={entries.metadata.name.split(" ")[1]} themen={themen}/>
                    </div>
                    <div className="h-5"></div>
                    {gameState.phase === "identification2" || gameState.phase == "discussion2" ? (
                        scenarios === null ? (
                            <p></p>
                        ) : (
                            <div>
                                <ResourceListComponent avoid={profilePic? profilePic.identifier : ""} resourceEntries={scenarios.resourceEntries} collapsible={true} heading="Das hat sich bei dir in den letzten Jahren getan:"/>
                                <div className="h-5"></div>
                            </div>
                        )
                    ) : <div></div>}
                    <ResourceListComponent avoid={profilePic? profilePic.identifier : ""} resourceEntries={entries.resourceEntries} collapsible={true} heading={"Hier sind ein paar Sachen die zu deiner Rolle interessant sind:"} />
                </div>
            )}
        </div>
    );
}


