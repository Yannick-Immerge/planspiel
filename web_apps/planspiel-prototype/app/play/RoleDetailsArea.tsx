import {GameState} from "@/app/api/models";
import {GetRoleEntryInformationResult, GetScenarioInformationResult} from "@/app/api/data_controller_interface";
import MetadataComponent from "@/app/components/MetadataComponent";
import ResourceListComponent from "@/app/components/ResourceListComponent";

export default function RoleDetailsArea({gameState, entries, scenarios} : {gameState: GameState | null, entries: GetRoleEntryInformationResult | null, scenarios: GetScenarioInformationResult | null}) {
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

