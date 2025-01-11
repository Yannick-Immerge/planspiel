"use client"

import {GameState, RoleData, VotingStatus} from "@/app/api/models";
import {useEffect, useState} from "react";
import {getVotingStatus, vote} from "@/app/api/game_controller_interface";
import VotingStatusItem from "@/app/play/VotingComponents/VotingStatusItem";

export default function VotingArea({gameState, roleData}: { gameState: GameState | null, roleData: RoleData | null}) {
    const [votingStatus, setVotingStatus] = useState<VotingStatus | null>(null);

    if (!gameState || !roleData) return (<div>This should not happen. Pleas go back to /login.</div>)

    useEffect(() => {
        const fetchVotingStatus = async () => {
            const votingStatusResult = await getVotingStatus();
            if(!votingStatusResult.ok || votingStatusResult.data === null) {
                setVotingStatus(null);
                return;
            }

            setVotingStatus(votingStatusResult.data.votingStatus);
        };
        const interval = setInterval(() => fetchVotingStatus(), 5000);

        return() => clearInterval(interval);
    }, []);

    const voteParameterAction = (parameter: string, votedValue: number) => {
        const pushVoteParameter = async (parameter: string, votedValue: number) => {
            await vote(parameter, votedValue);
        }
        pushVoteParameter(parameter, votedValue);
    }



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
    } else if (gameState.phase == "discussion") {
        return <div>
            <h1 className="text-lg">Deine Stimme:</h1>
            {votingStatus === null ? <p>Die Abstimmung ist gerade nicht verfügbar.</p> : (
                <div>
                    {votingStatus.map((item, index) => (
                        <VotingStatusItem key={index} parameter={item.parameter} hasVoted={item.hasVoted} voteParameterAction={voteParameterAction}/>
                    ))}
                </div>
            )}
        </div>
    }

    if(gameState.phase == "voting") {
        return <div>
            <h1 className="text-lg">Deine Stimme:</h1>
            {votingStatus === null ? <p>Die Abstimmung ist gerade nicht verfügbar.</p> : (
                <div>
                    {votingStatus.map((item, index) => (
                        <VotingStatusItem key={index} parameter={item.parameter} hasVoted={item.hasVoted} voteParameterAction={voteParameterAction}/>
                    ))}
                </div>
            )}
        </div>
    }
    return <div></div>
}

function RatComponent({text} : {text: string}) {
    return (
    <div className="flex border-solid items-center m-auto max-w-[600px] w-full border-stone-800 p-3 bg-stone-200 rounded-2xl shadow-[0px_0px_20px_rgba(0,0,0,0.6)]" style={{"borderLeftWidth":"10px"}}>
        <div className="bg-cover bg-center bg-[url(/images/icon.png)] w-1/4 h-32" style={{"border" : "none !important"}} />
        <div className="text-lg text-left m-auto text-black w-3/4">{text}</div>
    </div>)
}