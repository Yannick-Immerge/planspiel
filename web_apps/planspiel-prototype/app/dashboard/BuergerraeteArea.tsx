import {GameState} from "@/app/api/models";

export default function BuergerraeteArea({gameState} : { gameState: GameState | null }) {
    return gameState === null ? (
        <div></div>
    ) : (
        <div>
            <h1 className="text-lg">Bürgerrat 1</h1>
            <ul>
                {gameState.buergerrat1.parameters.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
            <h1 className="text-lg">Bürgerrat 2</h1>
            <ul>
                {gameState.buergerrat2.parameters.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

