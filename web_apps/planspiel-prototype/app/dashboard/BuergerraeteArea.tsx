import {GameState, UserView} from "@/app/api/models";
import { ToCamelCase } from "./StringHelper";
import { FilteredUserList } from "./DashboardHelpers";

export function GetGermanName(id: string) : string {
    if (id === "fossil_fuel_taxes") return "Besteuerung fossiler Brennstoffe"
    if (id === "reduction_infra") return "Rückbau der Infrastruktur für fossile Energieträger"
    if (id === "gases_agriculture") return "Verringerung agrarer Abgase"
    if (id === "reduction_meat") return "Minderung des allgemeinen Fleischkonsums"
    if (id === "reduction_waste") return "Verringerung agrarer Abfälle"

    else return id
}

export function GetEinheited(id: string, value: number) : string { 
    if (id === "fossil_fuel_taxes") return `$${value.toFixed(1)} pro Tonne Kohle $${((20.0/17.0)*value).toFixed(1)} pro Fass Öl, $${(20.0*value).toFixed(1)} pro Cubic Foot Erdgas`
    if (id === "reduction_infra") return `${value}%`
    if (id === "gases_agriculture") return `${value}%`
    if (id === "reduction_meat") return `${value}%`
    if (id === "reduction_waste") return `${value}%`

    else return " Kg"
}



export default function BuergerraeteArea({gameState, users} : { gameState: GameState | null, users: UserView[] | null }) {
    return gameState === null ? (
        <div></div>
    ) : (
        <div className="justify-between align-stretch h-1/2">
            <div className="bg-[#55a3] backdrop-blur-2xl rounded-2xl my-2 p-5 shadow-[0px_10px_10px_rgba(0,0,0,0.5)]">
                <h1 className="text-2xl font-bold mb-4 text-center">🏭 Bürgerrat 1</h1>
                Hat folgende Themen zu besprechen:
                <div className="ml-5">
                    {gameState.buergerrat1.parameters.map((item, index) => (
                        <li key={index}>{GetGermanName(item)}</li>
                    ))}
                </div>
                {users == null? <></> : 
                <FilteredUserList 
                    userStati={users}
                    applyFilter={(n) => n.assignedBuergerrat != undefined && n.assignedBuergerrat == 1 && n.status != "disabled"}
                    description={"Teilnehmer"}
                />}
            </div>
            <div className="bg-[#a553] backdrop-blur-2xl rounded-2xl my-2 p-5 shadow-[0px_10px_10px_rgba(0,0,0,0.5)]">
                <h1 className="text-2xl font-bold mb-4 text-center">🐄 Bürgerrat 2</h1>
                Hat folgende Themen zu besprechen:
                <div className="ml-5">
                    {gameState.buergerrat2.parameters.map((item, index) => (
                        <li key={index}>{GetGermanName(item)}</li>
                    ))}
                </div>
                {users == null? <></> : 
                <FilteredUserList 
                    userStati={users}
                    applyFilter={(n) => n.assignedBuergerrat != undefined && n.assignedBuergerrat == 2 && n.status != "disabled"}
                    description={"Teilnehmer"}
                />}
            </div>

        </div>
    );
}

function BurgerratArea({gameState, whichOne} : { gameState: GameState | null, whichOne: number }) {

}