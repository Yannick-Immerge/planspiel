"use client"

import {GameState, RoleData, VotingStatus} from "@/app/api/models";
import {useEffect, useState} from "react";
import {getVotingStatus, updateVoting } from "@/app/api/game_controller_interface";
import VotingStatusItem from "@/app/play/VotingComponents/VotingStatusItem";

export default function VotingArea({gameState, roleData}: { gameState: GameState | null, roleData: RoleData | null}) {
    const [votingStatus, setVotingStatus] = useState<VotingStatus | null>(null);
    const [votingParameters, setVotingParameters] = useState<string[]>([]);
    const [endOfTime, setEndOfTime] = useState<Date | null>(null);
    const [timeRemainingString, setTimeRemainingString] = useState<string>("");

    const fetchVotingStatus = async () => {
        const votingStatusResult = await getVotingStatus();
        if(!votingStatusResult.ok || votingStatusResult.data === null) {
            console.log("Voting Status konnte nicht geladen werden");
            setVotingStatus(null);
            return;
        }

        setVotingStatus(votingStatusResult.data.votingStatus);

        if (votingStatus?.votingEnd) {
            setEndOfTime(votingStatus.votingEnd);
            console.log(endOfTime);
        } else {
            console.log("Voting Status enthält kein VotingEnd");
            if (gameState?.votingEnd) {
                console.log("Game State enthält ein VotingEnd: " + gameState.votingEnd);
                setEndOfTime(gameState.votingEnd);
            } else {
                console.log("Game State enthält kein VotingEnd");
                setEndOfTime(null);
            }
        }
    }

    // Der Countdown wird alle 0.2 Sekunden neu berechnet
    useEffect(() => {
        const reformatCountdownString = () => {
            if (!endOfTime) {
                setTimeRemainingString("00:00");
                return;
            }
            const now = new Date();
            
            let differenceHours : number = endOfTime.getHours() - now.getHours();
            let differenceMinutes : number = endOfTime.getMinutes() - now.getMinutes();
            let differenceSeconds : number = endOfTime.getSeconds() - now.getSeconds();
            if (differenceSeconds < 0) {
                differenceSeconds += 60;
                differenceMinutes -= 1;
            }
            if (differenceMinutes < 0) {
                differenceMinutes += 60;
                differenceHours -= 1;
            }
            const remainingSecondsString = differenceSeconds < 10? ("0" + differenceSeconds) : differenceSeconds;
            const remainingMinutesString = differenceMinutes < 10? ("0" + differenceMinutes) : differenceMinutes;
            setTimeRemainingString(remainingMinutesString + ":" + remainingSecondsString)
        }

        const interval = setInterval(() => reformatCountdownString(), 200);

        return () => clearInterval(interval);
    }, []);

    // Der Voting Status wird alle 5 Sekunden erfragt.
    useEffect(() => {
        const interval = setInterval(() => fetchVotingStatus(), 5012);

        return() => clearInterval(interval);
    }, []);

    if (!gameState || !roleData) return (<div>This should not happen. Pleas go back to /login.</div>)

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
            <h1 className="text-lg">Deine Stimme:</h1>
            {votingStatus === null ? <p>Die Abstimmung ist gerade nicht verfügbar.</p> : (
                <div>
                    {votingParameters.map((item, index) => (
                        <VotingStatusItem key={index} parameter={item}/>
                    ))}
                </div>
            )}
            {gameState.phase== "voting"?
            <RatComponent text={`In ${timeRemainingString} minuten wird die Abstimmung automatisch beendet. Versucht euch einig zu werden.`} countdown={timeRemainingString}/>
            : <></>
            }
        </div>
    }
}

function RatComponent({text, hyperlink = "", countdown = ""} : {text: string, hyperlink?: string, countdown?: string}) {
    return (
    <div className="flex border-solid items-center m-auto max-w-[600px] w-full border-stone-800 p-3 bg-stone-200 rounded-2xl shadow-[0px_0px_20px_rgba(0,0,0,0.6)]" style={{"borderLeftWidth":"10px"}}>
        <div className="bg-cover bg-center bg-[url(/images/icon.png)] w-1/4 h-32" style={{"border" : "none !important"}} />
        <div className="w-3/4">
            <div className="text-6xl text-red-800 text-left m-auto">{countdown}</div>
            <div className="text-lg text-left m-auto text-black">{text}</div>
        </div>
    </div>)
}