import {GameState, UserView} from "@/app/api/models";

export default function DiscussionPhaseArea({user, gameState} : {user: UserView, gameState: GameState}) {
    switch(gameState.discussionPhase) {
        case "inactive":
            return <p>Die Diskussion ist gerade nicht aktiv.</p>;
        case "introduction":
        case "closing":
            const speaker = user.assignedBuergerrat === 1 ? gameState.discussionSpeaker1 : gameState.discussionSpeaker2;
            if(user.username === speaker){
                return <p className="text-lg font-bold">Du bist jetzt am Sprechen!</p>
            } else {
                return <p>{speaker} ist jetzt am Sprechen!</p>
            }
        case "preparing":
            return <p>Bereite dich für die Diskussion vor.</p>
        case "completed":
            return <p>Die Diskussion ist beendet. Die Projektionen werden erstellt.</p>
        case "free":
            return <p>Freie Diskussion: nutzen Sie die Zeit zum Diskutieren.</p>
        case "voting":
            return <p>Bitte jetzt abstimmen!</p>
    }
}

