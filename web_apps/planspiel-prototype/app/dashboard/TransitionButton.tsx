"use client";
import {GamePhase} from "@/app/api/models";
import StyledButton from "@/app/components/StyledButton";

export default function TransitionButton({phase, onTransitionAction}: {phase: GamePhase, onTransitionAction: (targetPhase: GamePhase) => void}) {
    if(phase == "configuring") {
            return <StyledButton onClickAction={() => onTransitionAction("identification")}>Start</StyledButton>;

    } else if (phase == "identification") {
            return <StyledButton onClickAction={() => onTransitionAction("discussion")}>Bürgerrat starten</StyledButton>;

    } else if (phase == "discussion") {
            return <StyledButton onClickAction={() => onTransitionAction("voting")}>Abstimmung starten</StyledButton>;

    } else if (phase == "voting") {
            return <StyledButton onClickAction={() => onTransitionAction("debriefing")}>Projektion & Debriefing starten</StyledButton>;

    } else if (phase == "debriefing") {
            return <StyledButton onClickAction={() => {}}>End Game</StyledButton>;
    }
    return <></>
}

