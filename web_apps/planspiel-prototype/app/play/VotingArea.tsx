"use client"
import {GameState, VotingStatus} from "@/app/api/models";
import {useEffect, useState} from "react";
import {getVotingStatus, vote} from "@/app/api/game_controller_interface";
import VotingStatusItem from "@/app/play/VotingStatusItem";

export default function VotingArea({gameState}: { gameState: GameState | null}) {
    const [votingStatus, setVotingStatus] = useState<VotingStatus | null>(null);

    const fetchVotingStatus = async () => {
        const votingStatusResult = await getVotingStatus();
        if(!votingStatusResult.ok || votingStatusResult.data === null) {
            setVotingStatus(null);
            return;
        }

        setVotingStatus(votingStatusResult.data.votingStatus);
    };

    const revalidate = () => {
        fetchVotingStatus();
    }

    useEffect(() => {
        const interval = setInterval(() => {
            revalidate();
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const voteParameterAction = (parameter: string, votedValue: number) => {
        const pushVoteParameter = async (parameter: string, votedValue: number) => {
            await vote(parameter, votedValue);
            await fetchVotingStatus();
        }
        pushVoteParameter(parameter, votedValue);
    }


    if(gameState === null) {
        return <p>Could not fetch relevant information.</p>;
    }

    if((gameState.phase == "discussion1" || gameState.phase == "discussion2") && gameState.discussionPhase === "voting") {
        return <div>
            <h1 className="text-lg">Deine Stimme:</h1>
            {votingStatus === null ? <p>Could not fetch voting state.</p> : (
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