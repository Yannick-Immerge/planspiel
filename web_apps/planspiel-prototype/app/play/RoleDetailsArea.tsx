import {GameState} from "@/app/api/models";
import {GetRoleEntryInformationResult, GetScenarioInformationResult} from "@/app/api/data_controller_interface";
import MetadataComponent from "@/app/components/MetadataComponent";
import ResourceListComponent from "@/app/components/ResourceListComponent";

export default function RoleDetailsArea({gameState, entries, scenarios} : {gameState: GameState | null, entries: GetRoleEntryInformationResult | null, scenarios: GetScenarioInformationResult | null}) {
    if (gameState === null) {
        return <p>Could not fetch game state.</p>;
    }

    if(gameState.phase == "configuring")
        return <div></div>;

    return (
        <div>
            <h1 className="text-xl">Get to know your role:</h1>
            {entries === null ? (
                <p>Could not fetch role entries.</p>
            ) : (
                <div>
                    <MetadataComponent metadata={entries.metadata} />
                    <div className="h-5"></div>
                    {gameState.phase === "identification2" || gameState.phase == "discussion2" ? (
                        scenarios === null ? (
                            <p></p>
                        ) : (
                            <div>
                                <ResourceListComponent resourceEntries={scenarios.resourceEntries} collapsible={true} heading="Check what has happened to your role:"/>
                                <div className="h-5"></div>
                            </div>
                        )
                    ) : <div></div>}
                    <ResourceListComponent resourceEntries={entries.resourceEntries} collapsible={true} heading="Your Role Entries:" />
                </div>
            )}
        </div>
    );
}


