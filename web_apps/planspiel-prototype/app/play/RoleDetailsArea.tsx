import {GameState} from "@/app/api/models";
import {GetRoleEntryInformationResult, GetScenarioInformationResult} from "@/app/api/data_controller_interface";
import MetadataComponent from "@/app/components/MetadataComponent";
import ResourceListComponent from "@/app/components/ResourceListComponent";
import dynamic from "next/dynamic";
import PictureComponent from "../components/PictureComponent";

const OsmMapNoSSR = dynamic(() => import("./Map/Map"), {ssr: false});

export default function RoleDetailsArea({gameState, entries, scenarios} : {gameState: GameState | null, entries: GetRoleEntryInformationResult | null, scenarios: GetScenarioInformationResult | null}) {
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
                    <div className="rounded-2xl bg-[#bfb2] w-1/3 p-5 backdrop-blur-xl">
                        <PictureComponent path={"resources/" + profilePic?.identifier} />
                        <MetadataComponent metadata={entries.metadata} />
                    </div>
                    <div className="h-5"></div>
                    {gameState.phase === "identification2" || gameState.phase == "discussion2" ? (
                        scenarios === null ? (
                            <p></p>
                        ) : (
                            <div>
                                <ResourceListComponent avoid={profilePic? profilePic.identifier : ""} resourceEntries={scenarios.resourceEntries} collapsible={true} heading="Check what has happened to your role:"/>
                                <div className="h-5"></div>
                            </div>
                        )
                    ) : <div></div>}
                    <ResourceListComponent avoid={profilePic? profilePic.identifier : ""} resourceEntries={entries.resourceEntries} collapsible={true} heading={"Hier ist etwas was du dir anschauen solltest:"} />
                </div>
            )}
        </div>
    );
}


