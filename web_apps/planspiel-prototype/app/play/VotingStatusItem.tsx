"use client"
import {useEffect, useState} from "react";
import {Parameter} from "@/app/api/models";
import {getParameter} from "@/app/api/data_controller_interface";
import VotingSlider from "@/app/play/VotingSlider";

export default function VotingStatusItem({parameter, hasVoted, voteParameterAction} : {parameter: string, hasVoted: boolean, voteParameterAction: (parameter: string, votedValue: number) => void}) {
    const [parameterInfo, setParameterInfo] = useState<Parameter | null>(null);

    const fetchParameterInfo = async () => {
        const parameterResult = await getParameter(parameter);
        if (!parameterResult.ok || parameterResult.data === null) {
            setParameterInfo(null);
            return;
        }
        setParameterInfo(parameterResult.data.parameter);
    }

    useEffect(() => {
        fetchParameterInfo();
    }, []);

    return <div>
        <h1 className="text-lg">{parameter}</h1>
        {hasVoted ? <p>You have already voted for the parameter.</p> : (
            parameterInfo === null ? (
                <p>Cannot fetch parameter info for parameter.</p>
            ) : (
                <VotingSlider parameter={parameterInfo} voteParameterAction={voteParameterAction}/>
            )
        )}
    </div>
}
