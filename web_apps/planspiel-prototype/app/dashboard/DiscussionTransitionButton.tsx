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
            <StyledButton onClickAction={() => handleDiscussionTransitionRequest("introduction")}>Starte die Introduktion!</StyledButton>
        ) : phase === "introduction" ? (
            ready ? (
                <StyledButton onClickAction={() => handleDiscussionTransitionRequest("free")}>Starte die freie Diskussion!</StyledButton>
            ) : (
                <StyledButton onClickAction={() => nextSpeakerAction()}>Nächstes Sprecher!</StyledButton>
            )
        ) : phase === "free" ? (
            <StyledButton onClickAction={() => handleDiscussionTransitionRequest("closing")}>Beenden Sie jetzt die Diskussion.</StyledButton>
        ) : phase === "closing" ? (
            ready ? (
                <StyledButton onClickAction={() => handleDiscussionTransitionRequest("voting")}>Starte die Abstimmung!</StyledButton>
            ) : (
                <StyledButton onClickAction={() => nextSpeakerAction()}>Nächstes Sprecher!</StyledButton>
            )
        ) : phase === "voting" ? (
            ready ? (
                <StyledButton onClickAction={() => handleDiscussionTransitionRequest("completed")}>Die Diskussion ist beendet.</StyledButton>
            ) : (
                <p>Warten Sie, bis alle abstimmen!</p>
            )
        ) : (
            <p>Die Diskussion ist beendet.</p>
        )}
    </div>
}

