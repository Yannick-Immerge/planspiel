import {GameState, UserView} from "@/app/api/models";
import DiscussionPhaseArea from "@/app/play/DiscussionPhaseArea";

export default function DiscussionArea({user, gameState} : {user: UserView | null, gameState: GameState | null}) {
    if(user === null || gameState === null){
        return <p>Could not fetch relevant information.</p>
    }
    if(gameState.phase == "discussion1" || gameState.phase == "discussion2"){
        return (
            <div>
                <h1 className="text-xl text-orange-500">Discussion Ongoing!</h1>
                <DiscussionPhaseArea user={user} gameState={gameState}/>
            </div>
        );
    }
    return <div></div>;
}

