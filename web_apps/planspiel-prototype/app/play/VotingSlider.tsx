"use client"
import {Parameter} from "@/app/api/models";
import {ChangeEvent, useState} from "react";
import StyledButton from "@/app/components/StyledButton";

export default function VotingSlider({parameter, voteParameterAction} : {parameter: Parameter, voteParameterAction: (parameter: string, votedValue: number) => void}) {
    const [value, setValue] = useState<number>(parameter.min_value);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(Number(event.target.value));
    }

    const handleVote = () => {
        console.log("Voting!")
        voteParameterAction(parameter.simpleName, value);
    };

    return <div className="flex justify-center gap-20 py-3">
        <div className="content-center">
            <input
            type="range"
            min={parameter.min_value}
            max={parameter.max_value}
            value={value}
            onChange={handleChange}
            />
        </div>
        <div>
            <StyledButton onClickAction={handleVote}>Abstimmen</StyledButton>
        </div>
    </div>;
}

