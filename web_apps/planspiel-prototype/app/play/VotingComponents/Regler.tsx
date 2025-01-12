"use client"
import {ChangeEvent, useEffect, useState} from "react";
import {Parameter, UserVotingStatus} from "@/app/api/models";
import {getParameter} from "@/app/api/data_controller_interface";
import { GetEinheit, GetGermanName } from "../../dashboard/BuergerraeteArea";
import { updateVoting } from "@/app/api/game_controller_interface";

export default function Regler({parameterName, userVotings, active} : {parameterName: string, userVotings: UserVotingStatus[], active: boolean}) {
    const [parameterInfo, setParameterInfo] = useState<Parameter | null>(null);
    const [value, setValue] = useState<number | null>(null);
    const [movedSlider, setMovedSlider] = useState<boolean>(false);
    const [einheit, setEinheit] = useState<string>("");
    
    useEffect(() => {
        
        const pushVote = async () => {
            
            const result = await updateVoting(parameterName, value? value : 0);
            console.log(result.ok);
        }
        const interval = setInterval(() => pushVote(), 2401);

        return () => clearInterval(interval);
    }, []);

    const fetchParameterInfo = async () => {
        console.log("Fetching from " + parameterName);
        const parameterResult = await getParameter(parameterName);
        if (!parameterResult.ok || parameterResult.data === null) {
            console.log("  Could not load Parameter info for " + parameterName + ".");
            return;
        }

        setParameterInfo(parameterResult.data.parameter);

        console.log(parameterResult.data.parameter.maxValue);
        if (value === null) {
            setValue((parameterResult.data.parameter.minValue + parameterResult.data.parameter.maxValue) / 2)
            console.log("  Set Value to initial " + ((parameterResult.data.parameter.minValue + parameterResult.data.parameter.maxValue) / 2));
        } else {
            console.log("  Value was not null");
        }
    }

    useEffect(() => {
        fetchParameterInfo();
    }, [parameterName]);

    const clamp = (val: number, min: number, max: number) => {
        if (val < min) return min;
        if (val > max) return max;
        return val;
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (parameterInfo) {
            setValue(clamp(Number(event.target.value), parameterInfo.minValue, parameterInfo.maxValue));
            setMovedSlider(true);
        }
    }

    return <div className="mb-[3%] mx-[5%] p-[3%] border-red-50 border-2 rounded-2xl text-center">
        <div className="text-lg">Thema {1}: {GetGermanName(parameterName)}</div>
        
        {(parameterInfo && value != null)?<>
            
                <div className="flex justify-center" style={{"height": "180px", "lineHeight":"180px"}}>
                    <div className="w-[10%] text-right">
                        {parameterInfo.minValue}
                    </div>
                    <input
                        className="w-[60%] mx-2 my-5"
                        width={200}
                        type="range"
                        min={parameterInfo.minValue}
                        max={parameterInfo.maxValue}
                        value={value}
                        onChange={handleChange}
                    /> 
                    <div className="w-[10%] text-left">
                        {parameterInfo.maxValue}
                    </div>
                </div>
                <div className="w-80">
                    {userVotings.map((item, index) => (<OtherPersonComponent key={index} otherVote={item} percentage={(item.parameterStatuses[index].votedValue - parameterInfo.minValue) / (parameterInfo.maxValue - parameterInfo.minValue)}/>))}
                </div>
                <div>Wenn es nach dir Ginge:</div>
                <div>{GetEinheit(parameterName, value)}</div>
                </>
                : <></>
                }
            
    </div>
}

function OtherPersonComponent({otherVote, percentage} : {otherVote: UserVotingStatus, percentage: number}) {
    const adjustedPercentage = percentage/2 + 25;
    return (
    <>
        <div className={`-translate-x-1/2 -translate-y-20 rounded-full absolute w-20 h-20 bg-cover transition-all duration-1000`} style={{"left": `${adjustedPercentage}%`, "backgroundImage": `url(images/otherguymarker.png)`}}></div>
        <div className={`-translate-x-1/2 -translate-y-16 rounded-full absolute w-12 h-12 bg-cover transition-all duration-1000`} style={{"left": `${adjustedPercentage}%`, "backgroundImage": `url(roles/${otherVote.roleName}/profile_picture.png)`}}></div>
    </>)
}
