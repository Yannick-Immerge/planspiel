import {get_scenario_with_id} from "@/app/data/queries";
import ScenarioView from "@/app/components/data/scenario-view";
import ErrorView from "@/app/components/general/error-view";

export default async function ScenarioPage({ params }: { params: Promise<{id: string}>}) {
    const { id } = await params;
    const scenario = await get_scenario_with_id(parseInt(id));
    return typeof(scenario) === "undefined" ? (
        <ErrorView errname="Unknown Scenario ID" errdesc={`There is no scenario with id #${id}.`} />
    ) : (
        <ScenarioView scenario={scenario}/>
    );
}