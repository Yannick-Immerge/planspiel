import {GameState} from "@/app/api/models";

export default function BuergerraeteArea({gameState} : { gameState: GameState | null }) {
    return gameState === null ? (
        <div></div>
    ) : (
        <div className="flex justify-between align-stretch gap-14 h-1/2">
            <div className="flex-1">
                <h1 className="text-lg">Bürgerrat 1</h1>
                <ul>
                    {gameState.buergerrat1.parameters.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>
            <div className="flex-1">
                <h1 className="text-lg">Bürgerrat 2</h1>
                <ul>
                    {gameState.buergerrat2.parameters.map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </div>

        </div>
    );
}

