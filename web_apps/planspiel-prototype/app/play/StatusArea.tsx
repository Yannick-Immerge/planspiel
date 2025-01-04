import {GameState} from "@/app/api/models";

export default function StatusArea({gameState}: {gameState: GameState | null}) {
    if(gameState === null){
        return <div className="h-10">
            <p>Could not fetch game state.</p>
        </div>
    }
}

