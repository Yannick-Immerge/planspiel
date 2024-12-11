"use client";
import {GamePhase, GameState} from "@/app/api/models";
import TransitionButton from "@/app/dashboard/TransitionButton";

export default function TransitionArea({gameState, onTransitionAction}: {gameState: GameState | null, onTransitionAction: (targetPhase: GamePhase) => void}) {
    return gameState === null ? (
        <div></div>
    ) : (
        <div>
            <h1 className="text-lg">Game is in Phase: {gameState.phase}</h1>
            {gameState.discussionPhase === "inactive" || gameState.discussionPhase === "completed" ? (
                <TransitionButton phase={gameState.phase} onTransitionAction={onTransitionAction}/>
            ) : (
                <p>Finish the discussion before continuing.</p>
            )}

        </div>
    );
}

