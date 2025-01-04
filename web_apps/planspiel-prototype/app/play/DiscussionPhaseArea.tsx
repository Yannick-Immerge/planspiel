import {GameState, UserView} from "@/app/api/models";

// TODO: translate to german
export default function DiscussionPhaseArea({user, gameState} : {user: UserView, gameState: GameState}) {
    switch(gameState.discussionPhase) {
        case "inactive":
            return <p>The discussion is not active!</p>;
        case "introduction":
        case "closing":
            const speaker = user.assignedBuergerrat === 1 ? gameState.discussionSpeaker1 : gameState.discussionSpeaker2;
            if(user.username === speaker){
                return <p className="text-lg font-bold">YOU are now speaking.</p>
            } else {
                return <p>{speaker} is now speaking!</p>
            }
        case "preparing":
            return <p>Get ready for the discussion!</p>
        case "completed":
            return <p>Your discussion is finished and your results will be projected.</p>
        case "free":
            return <p>Use this time to discuss freely.</p>
        case "voting":
            return <p>Please Vote in the voting area!</p>
    }
}

