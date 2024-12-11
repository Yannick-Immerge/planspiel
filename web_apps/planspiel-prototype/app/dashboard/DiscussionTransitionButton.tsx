import {DiscussionPhase, getNextDiscussionPhase} from "@/app/api/models";
import {useEffect, useState} from "react";
import {nextSpeaker, readyToTransitionDiscussion} from "@/app/api/game_controller_interface";

export default function DiscussionTransitionButton({phase, onDiscussionTransitionAction}: {phase: DiscussionPhase, onDiscussionTransitionAction: (targetPhase: DiscussionPhase) => void}) {
    const [ready, setReady] = useState<boolean>(false);

    const fetchReady = async () => {
        const nextPhase = getNextDiscussionPhase(phase);
        if(nextPhase === null) {
            setReady(false);
            return;
        }

        const readyResult = await readyToTransitionDiscussion(nextPhase);
        if(!readyResult.ok || readyResult.data === null) {
            setReady(false);
            return;
        }
        setReady(readyResult.data.readyToTransition);
    }

    const nextSpeakerAction = async () => {
        await nextSpeaker();
        await fetchReady();
    };

    const handleDiscussionTransitionRequest = async (targetPhase: DiscussionPhase) => {
        onDiscussionTransitionAction(targetPhase);
        await fetchReady();
    }

    useEffect(() => {
        fetchReady();
    }, []);

    switch (phase) {
        case "inactive":
            return <p>Unexpected discussion state!</p>
        case "preparing":
            return <button onClick={() => handleDiscussionTransitionRequest("introduction")}>Start the Introductions!</button>;
        case "introduction":
            if (ready) {
                return <button onClick={() => handleDiscussionTransitionRequest("free")}>Start the Free Discussion!</button>;
            } else {
                return <button onClick={() => nextSpeakerAction()}>Next speaker!</button>
            }
        case "free":
            return <button onClick={() => handleDiscussionTransitionRequest("closing")}>Start the Closing Words!</button>;
        case "closing":
            if (ready) {
                return <button onClick={() => handleDiscussionTransitionRequest("voting")}>Start the Voting!</button>;
            } else {
                return <button onClick={() => nextSpeakerAction()}>Next speaker!</button>
            }
        case "voting":
            if (ready) {
                return <button onClick={() => handleDiscussionTransitionRequest("completed")}>Finish the Discussion!</button>;
            } else {
                return <p>Wait for all votes!</p>
            }
        case "completed":
            return <p>The discussion has been completed!</p>
    }
}

