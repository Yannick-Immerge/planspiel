"use client";

import { useEffect, useState } from "react";
import { GamePhase, GameState, UserView } from "@/app/api/models";
import {
    getGameState,
    getSessionMemberViews,
    transitionGameState, viewSelf,
    getVotingOverview,
} from "@/app/api/game_controller_interface";
import WarningArea from "@/app/components/WarningArea";
import MembersArea from "@/app/dashboard/MembersArea";
import BuergerraeteArea from "@/app/dashboard/BuergerraeteArea";
import TransitionArea, { StateDescription } from "@/app/dashboard/TransitionArea";
import EnRoadsProjection from "@/app/dashboard/EnRoadsProjection";
import { GetAllStateDescriptions } from "./StateDescriptions";
import { useRouter } from "next/navigation";


export default function Dashboard() {
    const [user, setUser] = useState<UserView | null>(null);
    const [members, setMembers] = useState<UserView[] | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    const router = useRouter();

    // This is needed to create the en-roads link to the generated dashboard
    const [enRoadsURL, setEnRoadsURL] = useState<string | null>(null);

    const fetchUser = async () => {
        const viewResponse = await viewSelf();
        if (!viewResponse.ok || viewResponse.data === null) {
            setUser(null);
            // Redirect to login page if logged out
            
            console.log("Hallo")
            router.push("../login");
            return;
        }
        setUser(viewResponse.data.userView);
    }

    const fetchMembers = async () => {
        const viewResponse = await viewSelf();
        if (!viewResponse.ok || viewResponse.data === null) {
            setMembers(null);
            setWarning(`Error: ${viewResponse.statusText}`);
            return;
        }

        const membersResponse = await getSessionMemberViews();
        if (!membersResponse.ok || membersResponse.data === null) {
            setMembers(null);
            setWarning(`Error: ${membersResponse.statusText}`);
            return;
        }



        setMembers(membersResponse.data.memberViews);
    }

    const fetchGameState = async () => {
        const gameStateResponse = await getGameState();
        if (!gameStateResponse.ok || gameStateResponse.data === null) {
            setGameState(null);
            setWarning(`Error: ${gameStateResponse.statusText}`);
            return;
        }

        setGameState(gameStateResponse.data.gameState);
    }

    const fetchEnRoadsURL = async () => {
        const votingOverviewResponse = await getVotingOverview();

        if (!votingOverviewResponse.ok || votingOverviewResponse.data === null) {
            setEnRoadsURL("Something went wrong");
            return;
        }

        let votingMean1: any = {
            "fossil_fuel_taxes": "250",
            "reduction_infra": "100",
        }
        let votingMean2: any = {
            "gases_agriculture": "100",
            "reduction_meat": "10",
            "reduction_waste": "10",
        }
        const average = (running_mean: number, new_value: number, userCount: number) => {
            return ((running_mean * userCount) + new_value) / (userCount + 1);            
        }

        let userCount1 = 0;
        for (const userStatus of votingOverviewResponse.data.votingStatus1.userStatuses) {
            for (const parameterStatus of userStatus.parameterStatuses) {
                votingMean1[parameterStatus.parameter] = average(votingMean1[parameterStatus.parameter], parameterStatus.votedValue, userCount1);
            }
            userCount1++;
        }

        let userCount2 = 0;
        for (const userStatus of votingOverviewResponse.data.votingStatus2.userStatuses) {
            for (const parameterStatus of userStatus.parameterStatuses) {
                votingMean2[parameterStatus.parameter] = average(votingMean2[parameterStatus.parameter], parameterStatus.votedValue, userCount2);
            }
            userCount2++;
        }

        const metricNameToParameter2: any = {
            "gases_agriculture": "60",
            "reduction_meat": "287",
            "reduction_waste": "305",
        }
        const metricNameToParameter1: any = {
            //"fossil_fuel_taxes": "39",
            "fossil_fuel_taxes": ["1", "7", "10"],
            "reduction_infra": "211",
        }
        const linear_map = (x: number, x_min: number, x_max: number, y_min: number, y_max: number) => {
            return ((x - x_min) / (x_max - x_min)) * (y_max - y_min) + y_min
        }

        // Now we create the URL
        let url = "https://en-roads.climateinteractive.org/scenario.html?v=25.1.0"
        for (const key in votingMean1) {
            if (key == "fossil_fuel_taxes") {
                // NOTE: This is super hacky, dont judge me.
                const fossil_fuel_min = [-15, -15, -0.7]
                const fossil_fuel_max = [100, 85, 5]
                for (let i = 0; i < 3; i++) {
                    let value_mapped = linear_map(votingMean1[key], -15, 100, fossil_fuel_min[i], fossil_fuel_max[i]);
                    url += `&p${metricNameToParameter1[key][i]}=${value_mapped}`
                }
                continue
            }
            url += `&p${metricNameToParameter1[key]}=${votingMean1[key]}`;
        }
        for (const key in votingMean2) {
            url += `&p${metricNameToParameter2[key]}=${votingMean2[key]}`;
        }

        setEnRoadsURL(url);
    }

    const revalidate = () => {
        fetchUser();
        fetchMembers();
        fetchGameState();
    };

    useEffect(() => {
        const interval = setInterval(() => revalidate(), 20000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        revalidate();
    }, []);

    const onTransitionAction = (targetPhase: GamePhase) => {
        const performTransition = async (targetPhase: GamePhase) => {
            const result = await transitionGameState(targetPhase);
            if (!result.ok || result.data === null) {
                setWarning(result.statusText);
                return;
            }

            const gameStateResult = await getGameState();
            if (!gameStateResult.ok || gameStateResult.data === null) {
                setWarning(result.statusText);
                return;
            }

            setGameState(gameStateResult.data.gameState);
            if (gameStateResult.data.gameState.phase === "debriefing") {
                fetchEnRoadsURL();
            }
        }
        performTransition(targetPhase);
    }

    const [stateDescriptions, setStateDescriptions] = useState<StateDescription[]>([]);
    useEffect(() => { setStateDescriptions(GetAllStateDescriptions()) }, [])

    return (
        <>
            <title>Planet Council Dashboard</title>
            <div className="bg-cover bg-center bg-no-repeat bg-[url(/images/EarthTint.png)] min-h-screen bg-fixed">
            <div className="flex">
            <div className="absolute left-[8.33%] top-5 text-5xl">Admin-Dashboard</div>
            <div className="absolute right-[8.33%] text-center px-3 py-2 text-lg">
                <div>
                    Admin-Benutzername:
                </div>
                <div className="px-3 rounded-full bg-[#6666ff30] backdrop-blur-2xl">
                    {user?.username}
                </div>
            </div>
            </div>
                <div className="pt-20 w-full">
                    <div className="flex h-80 justify-between gap-10 mx-10">
                        <div className="w-1/2">
                            <div className="flex-1 rounded-2xl bg-[#5a53] p-5 shadow-[10px_10px_10px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                                <TransitionArea stateDescriptions={stateDescriptions} gameState={gameState} onTransitionAction={onTransitionAction} />
                                <EnRoadsProjection enRoadsURL={enRoadsURL} />
                            </div>
                            <MembersArea members={members} />
                        </div>
                        <div className="w-1/2">
                            <BuergerraeteArea gameState={gameState} users={members} />
                        </div>
                    </div>

                    <WarningArea warning={warning} />
                </div>
            </div>
        </>
    );
}
