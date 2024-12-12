import {DiscussionPhase, GameState} from "@/app/api/models";
import DiscussionTransitionButton from "@/app/dashboard/DiscussionTransitionButton";

export default function DiscussionTransitionArea({gameState, onDiscussionTransitionAction} : {gameState: GameState | null, onDiscussionTransitionAction: (targetPhase: DiscussionPhase) => void}) {
    return gameState === null || gameState.discussionPhase === "inactive" ? (
        <div></div>
    ) : (
        <div>
            <h1 className="text-lg">Discussion is in Phase: {gameState.discussionPhase}</h1>
            <div className="h-3"></div>
            <div className="mx-auto">
                <DiscussionTransitionButton phase={gameState.discussionPhase}
                                            onDiscussionTransitionAction={onDiscussionTransitionAction}/>
            </div>
        </div>
    );
}

