"use client";
import {GamePhase} from "@/app/api/models";
import StyledButton from "@/app/components/StyledButton";

export default function TransitionButton({phase, onTransitionAction}: {phase: GamePhase, onTransitionAction: (targetPhase: GamePhase) => void}) {
    switch (phase) {
        case "configuring":
            return <StyledButton onClickAction={() => onTransitionAction("identification1")}>Start</StyledButton>;
        case "identification1":
            return <StyledButton onClickAction={() => onTransitionAction("discussion1")}>Bürgerrat starten</StyledButton>;
        case "discussion1":
            return <StyledButton onClickAction={() => onTransitionAction("identification2")}>Zeitsprung!</StyledButton>;
        case "identification2":
            return <StyledButton onClickAction={() => onTransitionAction("discussion2")}>2. Bürgerrat starten</StyledButton>;
        case "discussion2":
            return <StyledButton onClickAction={() => onTransitionAction("debriefing")}>Fertig</StyledButton>;
        case "debriefing":
            return <StyledButton onClickAction={() => {}}>End Game</StyledButton>;
    }
}

