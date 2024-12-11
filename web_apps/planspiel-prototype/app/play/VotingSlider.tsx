"use client"
import {Parameter} from "@/app/api/models";
import {ChangeEvent, useState} from "react";

export default function VotingSlider({parameter, voteParameterAction} : {parameter: Parameter, voteParameterAction: (parameter: string, votedValue: number) => void}) {
    const [value, setValue] = useState<number>(parameter.min_value);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(Number(event.target.value));
    }

    const handleVote = () => {
        console.log("Voting!")
        voteParameterAction(parameter.simpleName, value);
    };

    return <div>
        <input
        type="range"
        min={parameter.min_value}
        max={parameter.max_value}
        value={parameter.min_value}
        onChange={handleChange}
        />
        <button onClick={handleVote}>Lock In!</button>
    </div>;
}

