import {DiscussionPhase, getNextDiscussionPhase} from "@/app/api/models";
import {useEffect, useState} from "react";
import {nextSpeaker, readyToTransitionDiscussion} from "@/app/api/game_controller_interface";
import StyledButton from "@/app/components/StyledButton";

export default function DiscussionTransitionButton({phase, onDiscussionTransitionAction}: {phase: DiscussionPhase, onDiscussionTransitionAction: (targetPhase: DiscussionPhase) => void}) {
    const [ready, setReady] = useState<boolean | null>(null);

    const fetchReady = async () => {
        const nextPhase = getNextDiscussionPhase(phase);
        if(nextPhase === null) {
            setReady(null);
            return;
        }

        const readyResult = await readyToTransitionDiscussion(nextPhase);
        if(!readyResult.ok || readyResult.data === null) {
            setReady(null);
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

    const revalidate = () => {
        fetchReady();
    }

    useEffect(() => {
        const interval = setInterval(() => {
            revalidate();
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return <div>
        {ready ===  null ? (
            <p>Cannot determine whether transition is possible.</p>
        ) : phase === "inactive" ? (
            <p>Unexpected discussion state!</p>
        ) : phase === "preparing" ? (
            <StyledButton onClickAction={() => handleDiscussionTransitionRequest("introduction")}>Start the Introductions!</StyledButton>
        ) : phase === "introduction" ? (
            ready ? (
                <StyledButton onClickAction={() => handleDiscussionTransitionRequest("free")}>Start the Free Discussion!</StyledButton>
            ) : (
                <StyledButton onClickAction={() => nextSpeakerAction()}>Next speaker!</StyledButton>
            )
        ) : phase === "free" ? (
            <StyledButton onClickAction={() => handleDiscussionTransitionRequest("closing")}>Start the Closing Words!</StyledButton>
        ) : phase === "closing" ? (
            ready ? (
                <StyledButton onClickAction={() => handleDiscussionTransitionRequest("voting")}>Start the Voting!</StyledButton>
            ) : (
                <StyledButton onClickAction={() => nextSpeakerAction()}>Next speaker!</StyledButton>
            )
        ) : phase === "voting" ? (
            ready ? (
                <StyledButton onClickAction={() => handleDiscussionTransitionRequest("completed")}>Finish the Discussion!</StyledButton>
            ) : (
                <p>Wait for all votes!</p>
            )
        ) : (
            <p>The discussion has been completed!</p>
        )}
    </div>
}

