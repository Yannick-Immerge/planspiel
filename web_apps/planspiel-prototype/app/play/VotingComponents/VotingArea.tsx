"use client"

import {GameState, Parameter, ParameterVotingStatus, RoleData, UserView, UserVotingStatus, VotingStatus} from "@/app/api/models";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {getVotingStatus, updateVoting } from "@/app/api/game_controller_interface";
import Regler from "@/app/play/VotingComponents/Regler";
import { GetStatusQuo } from "./ReglerHelper";
import { GetGermanName } from "@/app/dashboard/BuergerraeteArea";
import MarkdownComponent from "../ProfileComponents/MarkdownComponent";

export interface Voting {
    wert: number | null,
    setRegler: Dispatch<SetStateAction<number | null>>;
}

export default function VotingArea({gameState, roleData, userData, votings}: { votings:Voting[], userData: UserView, gameState: GameState | null, roleData: RoleData | null}) {
    const [votingStatus, setVotingStatus] = useState<VotingStatus | null>(null);
    const [timeRemainingString, setTimeRemainingString] = useState<string>("");

    const fetchVotingStatus = async () => {
        const votingStatusResult = await getVotingStatus();
        if(!votingStatusResult.ok || votingStatusResult.data === null) {
            console.log("Voting Status konnte nicht geladen werden");
            setVotingStatus(null);
            return;
        }
        
        setVotingStatus(votingStatusResult.data.votingStatus);
    }

    // Der Countdown wird jede Sekunde neu berechnet
    useEffect(() => {
        const reformatCountdownString = () => {
            if (!votingStatus) {
                setTimeRemainingString("no Voting Status!");
                return;                
            }
            if (!votingStatus.votingEnd) {
                setTimeRemainingString("null!");
                return;
            }
            const now = new Date();
            const votingEnd : Date = new Date(votingStatus.votingEnd);
            let differenceHours : number = votingEnd.getHours() - now.getHours();
            let differenceMinutes : number = votingEnd.getMinutes() - now.getMinutes();
            let differenceSeconds : number = votingEnd.getSeconds() - now.getSeconds();
            if (differenceSeconds < 0) {
                differenceSeconds += 60;
                differenceMinutes -= 1;
            }
            if (differenceMinutes < 0) {
                differenceMinutes += 60;
                differenceHours -= 1;
            } if (differenceHours < 0) {
                setTimeRemainingString("00:00")
                return;
            }
            const remainingSecondsString = differenceSeconds < 10? ("0" + differenceSeconds) : differenceSeconds;
            const remainingMinutesString = differenceMinutes < 10? ("0" + differenceMinutes) : differenceMinutes;
            setTimeRemainingString(remainingMinutesString + ":" + remainingSecondsString)
        }

        const interval = setInterval(() => reformatCountdownString(), 1000);

        return () => clearInterval(interval);
    }, [votingStatus]);

    // Der Voting Status wird alle 5 Sekunden erfragt.
    useEffect(() => {
        const interval = setInterval(() => fetchVotingStatus(), 1000);

        return() => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchVotingStatus();
    }, [])

    if (!gameState || !roleData) return (<div>This should not happen. Please go back to /login.</div>)

    if(gameState.phase == "identification") {
        return (
        <div className="m-auto p-5 text-center text-xl">
            <div className="py-10">
                <div>Hallo, {roleData?.metadata.name}!</div>
                <div className="bg-cover bg-center w-40 h-40 m-auto rounded-full" style={{"borderWidth": "3px", "backgroundImage": "url(" + roleData.profilePictureIdentifier +")"}}></div>
                <div>Und willkommen bei Rat.net!</div>
            </div>
            <RatComponent text={"Sobald der Bürgerrat startet, werden hier die Details der Abstimmung angezeigt. Schau dir bis dahin dein Profil (links unten) und deine Rat.net-messages (rechts unten) an."}/>
        </div>);
    } else {
        return <div>
            {gameState.phase== "voting"?
            <RatComponent text={timeRemainingString === "00:00"? `Die Abstimmung ist beendet. Findet euch jetzt wieder mit dem anderen Bürgerrat zusammen.` : `Die Abstimmung wird demnächst automatisch beendet. Versucht euch einig zu werden.`} countdown={timeRemainingString}/>
            : <></>
            }
            
            <div className="bg-stone-200 rounded-2xl p-[3%] my-4 mx-[3%] text-black">
                <div className="pb-4">
                    <div className="font-bold">Bürgerrat #0209 Ergebnis-Protokoll</div>
                    {timeRemainingString == "00:00"? 
                        <div className="text-black">{""}Finale Version{""}</div>
                    :
                        <div className="text-[#660000] italic">{"<"}Vorläufige Version{">"}</div>
                    }
                </div>
                
                <div>Sehr geehrte Damen und Herren,</div>
                <div className="pb-4">Sehr geehrte Mitglieder der Vereinten Nationen,</div>
                <div className="pb-4">im Namen des Internationalen Bürgerrates für Klimaschutz möchten wir Ihnen die Ergebnisse unserer jüngsten Beratungen mitteilen. Dieser Rat setzt sich aus Bürgerinnen und Bürgern verschiedener Nationen und Lebensbereiche zusammen, die gemeinsam mögliche Antworten auf die komplexen Herausforderungen des Klimawandels erarbeitet haben.</div>
                <div className="pb-4">
                    <div>Der Bürgerrat hat sich mit den folgenden Themen auseinandergesetzt:</div>
                    {(userData.assignedBuergerrat == 1? gameState.buergerrat1.parameters : gameState.buergerrat2.parameters).map((item, index) => (<li key={index}>{GetGermanName(item)}</li>))}
                </div>
                <div>Unsere Diskussionen basierten auf wissenschaftlichen Erkenntnissen und vor allem einem breiten Meinungsaustausch. Unser Ziel war es, eine möglichst ausgewogene Perspektive zu schaffen, die sowohl die Dringlichkeit der Klimakrise als auch die sozialen, wirtschaftlichen und technologischen Auswirkungen berücksichtigt.</div>
                <div>
                    {(userData.assignedBuergerrat == 1? gameState.buergerrat1.parameters : gameState.buergerrat2.parameters).map((item, index) => (
                        <Regler 
                            voting={votings[index]}
                            index={index}
                            ownRoleName={userData.assignedRoleId? userData.assignedRoleId : ""}
                            active={timeRemainingString != "00:00"}
                            key={index} 
                            parameterName={item}
                            userVotings={votingStatus?.userStatuses? votingStatus.userStatuses : []}/>
                    ))}
                </div>
            
                
                <div className="pt-4">Alle Entscheidungen wurden unter Berücksichtigung verschiedener Perspektiven im Wert gemittelt.</div>
                <div className="pt-4">Wir hoffen, dass unsere Empfehlungen in den internationalen Dialog einfließen und als Grundlage für entschlossenes Handeln dienen.</div>

                </div>
                <div className="h-40 w-full bg-sky-900">
                
            </div>
        </div>
    }
}

function AppendDummyVoting(userStatuses: UserVotingStatus[]) : UserVotingStatus[] {

    const parameterStatus1 : ParameterVotingStatus = {
        parameter: "gases_agriculture",
        votedValue: GetStatusQuo("gases_agriculture")
    }

    const parameterStatus2 : ParameterVotingStatus = {
        parameter: "reduction_meat",
        votedValue: GetStatusQuo("reduction_meat")
    }

    const parameterStatus3 : ParameterVotingStatus = {
        parameter: "reduction_waste",
        votedValue: GetStatusQuo("reduction_waste")
    }

    const parameterStatus4 : ParameterVotingStatus = {
        parameter: "fossil_fuel_taxes",
        votedValue: GetStatusQuo("fossil_fuel_taxes")
    }

    const parameterStatus5 : ParameterVotingStatus = {
        parameter: "reduction_infra",
        votedValue: GetStatusQuo("reduction_infra")
    }

    const dummy1 : UserVotingStatus = {parameterStatuses: [parameterStatus1, parameterStatus2, parameterStatus3], roleName: "11_anais_fournier"}

    const dummy2 : UserVotingStatus = {parameterStatuses: [parameterStatus4, parameterStatus5], roleName: "1_ethan_miller"}

    let ret : UserVotingStatus[] = userStatuses.slice();

    ret.push(dummy1);
    //ret.push(dummy2);

    return ret;
}

export function RatComponent({text, hyperlink = "", countdown = ""} : {text: string, hyperlink?: string, countdown?: string}) {
    return (
    <div className="flex border-solid items-center m-auto max-w-[600px] w-full border-stone-800 p-3 bg-stone-200 rounded-2xl shadow-[0px_0px_20px_rgba(0,0,0,0.6)]" style={{"borderLeftWidth":"10px"}}>
        <div className="bg-cover bg-center bg-[url(/images/icon.png)] w-1/4 h-32" style={{"border" : "none !important"}} />
        <div className="w-3/4">
            <div className="text-6xl text-red-800 text-left m-auto">{countdown}</div>
            <div className="text-lg text-left m-auto text-black">{text}</div>
        </div>
    </div>)
}

export function RatFactComponent({textIdentifier, hyperlink = ""} : {textIdentifier: string, hyperlink?: string}) {
    return (
    <div className="flex border-solid items-center m-auto max-w-[600px] w-full border-stone-800 p-3 bg-stone-200 rounded-2xl shadow-[0px_0px_20px_rgba(0,0,0,0.6)]" style={{"borderLeftWidth":"10px"}}>
        <div className="bg-contain bg-no-repeat bg-center bg-[url(/images/icon_i.png)] w-1/4 h-[128px]" style={{"border" : "none !important"}} />
        <div className="w-3/4">
            <div className="text-lg text-left m-auto text-black">
                <MarkdownComponent path={textIdentifier}/>
                <div className="pt-2 flex text-sm">
                    <div className="pr-2">Quelle:</div>
                    <a className="underline" target="_blank" href={hyperlink}>{hyperlink.split("/").slice(0, 3).join("/")}</a>
                </div>
            </div>
        </div>
    </div>)
}

function DraftComponent() {
    return (
    <div className="font-bold"> Entwurf: Empfehlung an die Vereinten Nationen</div>

    
)
}