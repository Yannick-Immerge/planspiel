"use client"
import {Parameter} from "@/app/api/models";
import {ChangeEvent, useEffect, useState} from "react";
import StyledButton from "@/app/components/StyledButton";
import { updateVoting } from "@/app/api/game_controller_interface";

export default function VotingSlider({parameter} : {parameter: Parameter}) {
    const [value, setValue] = useState<number>(parameter.min_value);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(Number(event.target.value));
    }

    // Effect hook for pushing updates to the server if voting is enabled
    useEffect(() => {
        
        const pushVote = async () => {
            await updateVoting(parameter.simpleName, value);
        }
        const interval = setInterval(() => pushVote(), 2401);

        return () => clearInterval(interval);
    }, []);

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
    </div>;
}

