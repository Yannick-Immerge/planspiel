"use client";
import {GamePhase} from "@/app/api/models";
import StyledButton from "@/app/components/StyledButton";

export default function TransitionButton({phase, onTransitionAction}: {phase: GamePhase, onTransitionAction: (targetPhase: GamePhase) => void}) {
    switch (phase) {
        case "configuring":
            return <StyledButton onClickAction={() => onTransitionAction("identification1")}>Start Identification</StyledButton>;
        case "identification1":
            return <StyledButton onClickAction={() => onTransitionAction("discussion1")}>Start Discussion</StyledButton>;
        case "discussion1":
            return <StyledButton onClickAction={() => onTransitionAction("identification2")}>Lock In & Start 2. Identification</StyledButton>;
        case "identification2":
            return <StyledButton onClickAction={() => onTransitionAction("discussion2")}>Start 2. Discussion</StyledButton>;
        case "discussion2":
            return <StyledButton onClickAction={() => onTransitionAction("debriefing")}>Lock In & Start Debriefing</StyledButton>;
        case "debriefing":
            return <StyledButton onClickAction={() => {}}>End Game</StyledButton>;
    }
}

