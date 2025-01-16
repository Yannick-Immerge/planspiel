"use client"
import {ChangeEvent, useEffect, useState} from "react";
import {Parameter, UserVotingStatus} from "@/app/api/models";
import {getParameter} from "@/app/api/data_controller_interface";
import { updateVoting } from "@/app/api/game_controller_interface";
import { ComputeAbsoluteAverage, GetEinheitenAverageMarker, GetSollte, GetStatusQuo } from "./ReglerHelper";
import { GetGermanName } from "@/app/dashboard/BuergerraeteArea";
import { Voting } from "./VotingArea";

function clamp(val: number, min?: number, max?: number) : number 
{
    if (val < (min? min : -4000)) return (min? min : -4000);
    if (val > (max? max : 4000)) return (max? max : 4000);
    return val;
}

export default function Regler({ownRoleName, parameterName, userVotings, active, index, voting} : {voting: Voting, index:number, ownRoleName: string, parameterName: string, userVotings: UserVotingStatus[], active: boolean}) {
    const [parameterInfo, setParameterInfo] = useState<Parameter | null>(null);
    const [movedSlider, setMovedSlider] = useState<boolean>(true);
    
    const statusQuo : number = GetStatusQuo(parameterName); 
    
    // Die Schieberegler werden geupdated
    useEffect(() => {
        
        const pushVote = async () => {
            if (!movedSlider) {
                console.log("Didn't move slider, nothing to push.")
                return;
            }
            setMovedSlider(false);
            
            await updateVoting(parameterName, voting.wert? voting.wert : GetStatusQuo(parameterName));
        }
        const interval = setInterval(() => pushVote(), 5000);

        return () => clearInterval(interval);
    });

    const fetchParameterInfo = async () => {
        console.log("Fetching from " + parameterName);
        const parameterResult = await getParameter(parameterName);
        if (!parameterResult.ok || parameterResult.data === null) {
            console.log("  Could not load Parameter info for " + parameterName + ".");
            return;
        }

        setParameterInfo(parameterResult.data.parameter);
    }

    useEffect(() => {
        fetchParameterInfo();
    }, [parameterName]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (parameterInfo) {
            voting.setRegler(clamp(Number(event.target.value), parameterInfo.minValue, parameterInfo.maxValue));
            setMovedSlider(true); 
        }
    }

    const averageValue = ComputeAbsoluteAverage(userVotings, parameterName);

    return <div className="rounded-2xl text-center">
        
        {(parameterInfo)?<>
            <div className="font-bold pt-4">Punkt {index+1}: {GetGermanName(parameterName)}:</div>
            <div className="bg-stone-300 rounded-2xl mx-[5%] my-4">
                <div className="w-[70%]">
                    <StatusQuoMarker parameterName={parameterName} minValue={parameterInfo.minValue} maxValue={parameterInfo.maxValue}/>
                    <AverageComponent absoluteEinheitedString={GetEinheitenAverageMarker(parameterInfo.simpleName, averageValue)} absoluteAverage={averageValue} minValue={parameterInfo.minValue} maxValue={parameterInfo.maxValue}/>
                </div>
                <div className="flex justify-center" style={{"height": "180px", "lineHeight":"180px"}}>
                    <div className="w-[5%] text-right z-20">{parameterInfo.minValue}%</div>
                    <input
                        disabled={!active}
                        className="w-[70%] mx-[2%] my-[5%]"
                        width={200}
                        type="range"
                        min={parameterInfo.minValue}
                        max={parameterInfo.maxValue}
                        value={voting.wert? voting.wert : GetStatusQuo(parameterName)}
                        onChange={handleChange}
                    /> 
                    <div className="w-[5%] text-left">
                        {parameterInfo.maxValue}%
                    </div>
                </div> 
                <div className="w-[70%]">
                    {userVotings.map((item, index) => (<OtherPersonComponent ownVote={voting.wert? voting.wert : GetStatusQuo(parameterName)} ownRoleName={ownRoleName} minValue={parameterInfo.minValue} maxValue={parameterInfo.maxValue} parameterName={parameterName} key={index} otherVote={item}/>))}
                </div>
                </div>
                <div className="text-left">{GetSollte(parameterName, averageValue, statusQuo)}</div>
                </>
                : <></>
                }  
    </div>
}

function OtherPersonComponent({ownRoleName, otherVote, ownVote, parameterName, minValue, maxValue} : {ownVote: number, ownRoleName: string, otherVote: UserVotingStatus, parameterName: string, minValue:number, maxValue:number}) {
    let absolute : number | undefined = otherVote.parameterStatuses.find(n => n.parameter == parameterName)?.votedValue;

    let url : string = ""
    if (otherVote.roleName == ownRoleName) {
        url = "images/yourselfmarker.png";
        absolute = ownVote;
    } else {
        url = "images/otherguymarker.png";
    }

    if (absolute === undefined) return (<>Error when parsing user percentage</>)

    const percentage = clamp(100 * (absolute - minValue) / (maxValue - minValue), 0, 100)

    const adjustedPercentage = percentage*0.54 + 23;

    

    return (
    <div>
        <div className={`-translate-x-1/2 -translate-y-20 rounded-full absolute w-20 h-20 bg-cover transition-all duration-1000`} style={{"left": `${adjustedPercentage}%`, "backgroundImage": `url(${url})`}}></div>
        <div className={`-translate-x-1/2 -translate-y-16 rounded-full absolute w-12 h-12 bg-cover transition-all duration-1000`} style={{"left": `${adjustedPercentage}%`, "backgroundImage": `url(roles/${otherVote.roleName}/profile_picture.png)`}}></div>
    </div>)
}


function StatusQuoMarker({parameterName, minValue, maxValue} : {parameterName: string, minValue:number, maxValue:number}) {
    const absolute : number = GetStatusQuo(parameterName)

    const percentage = 100 * (absolute - minValue) / (maxValue - minValue)

    const adjustedPercentage = percentage*0.54 + 23;

    return (
    <div>
        <div className={`-translate-x-1/2 translate-y-[70px] rounded-full absolute w-[10px] h-[10px] bg-cover transition-all duration-1000`} style={{"left": `${adjustedPercentage}%`, "backgroundImage": `url(images/statusquomarker.png)`}}></div>
    </div>)
}


function AverageComponent({absoluteAverage, minValue, maxValue, absoluteEinheitedString} : {absoluteAverage: number, minValue:number, maxValue:number, absoluteEinheitedString: string}) {

    const percentage = 100 * (absoluteAverage - minValue) / (maxValue - minValue)

    const adjustedPercentage = percentage*0.54 + 23;
    return (
    <div>
        <div className={`-translate-x-1/2 translate-y-4 rounded-full absolute w-2 h-16 bg-cover transition-all duration-1000`} style={{"left": `${adjustedPercentage}%`, "backgroundImage": `url(images/averagemarker3.png)`}}></div>
        <div className="absolute translate-y-1 px-2 bg-[#457D80] min-w-[30%] text-bold max-h-12 text-amber-200 rounded-lg -translate-x-1/2 transition-all duration-1000 text-center" style={{"left": `${adjustedPercentage}%`}}>Durchschnitt: {absoluteEinheitedString}</div>
    </div>)
}
