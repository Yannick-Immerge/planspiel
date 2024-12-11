"use client";
import {GamePhase} from "@/app/api/models";

export default function TransitionButton({phase, onTransitionAction}: {phase: GamePhase, onTransitionAction: (targetPhase: GamePhase) => void}) {
    switch (phase) {
        case "configuring":
            return <button onClick={() => onTransitionAction("identification1")}>Start Identification</button>;
        case "identification1":
            return <button onClick={() => onTransitionAction("discussion1")}>Start Discussion</button>;
        case "discussion1":
            return <button onClick={() => onTransitionAction("identification2")}>Lock In & Start 2. Identification</button>;
        case "identification2":
            return <button onClick={() => onTransitionAction("discussion2")}>Start 2. Discussion</button>;
        case "discussion2":
            return <button onClick={() => onTransitionAction("debriefing")}>Lock In & Start Debriefing</button>;
        case "debriefing":
            return <button>End Game</button>;
    }
}

