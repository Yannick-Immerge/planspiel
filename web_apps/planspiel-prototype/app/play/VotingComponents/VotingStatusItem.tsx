"use client"
import {useEffect, useState} from "react";
import {Parameter} from "@/app/api/models";
import {getParameter} from "@/app/api/data_controller_interface";
import VotingSlider from "@/app/play/VotingComponents/VotingSlider";
import { GetGermanName } from "../../dashboard/BuergerraeteArea";

export default function VotingStatusItem({parameter} : {parameter: string}) {
    const [parameterInfo, setParameterInfo] = useState<Parameter | null>(null);

    const fetchParameterInfo = async () => {
        const parameterResult = await getParameter(parameter);
        if (!parameterResult.ok || parameterResult.data === null) {
            
            return;
        }
        setParameterInfo(parameterResult.data.parameter);
    }

    useEffect(() => {
        fetchParameterInfo();
    }, []);

    return <div className="border-red-50 border-2 rounded-2xl p-3 my-3 text-center">
        <h1 className="text-lg">{GetGermanName(parameter)}</h1>
        {
            parameterInfo === null ? (
                <p>Cannot fetch parameter info for parameter.</p>
            ) : (
                <VotingSlider parameter={parameterInfo}/>
            )
        }
    </div>
}
