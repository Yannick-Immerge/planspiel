"use client";

import {getLocalUsername} from "@/app/api/utility";
import {useEffect, useState} from "react";
import {UserView} from "@/app/api/models";
import {getSessionMemberViews, viewUser} from "@/app/api/game_controller_interface";


export default function Dashboard() {
    const [user, setUser] = useState<UserView | null>(null);
    const [members, setMembers] = useState<UserView[] | null>(null);
    const [message, setMessage] = useState("");
    useEffect(() => {
        const username = getLocalUsername();
        if(username === null) {
            setUser(null);
            setMessage("You are logged out!")
            return;
        }
        const fetchUserInfo = async () => {
            let response = await viewUser(username);
            if (!response.ok || response.data === null) {
                setUser(null);
                setMessage(`Error: ${response.statusText}`);
                return;
            }
            const user = response.data.userView;
            setUser(user);

            if(!user.administrator) {
                setMessage("Use /play as a normal user!");
                return;
            }

            const membersResponse = await getSessionMemberViews();
            if (!membersResponse.ok || membersResponse.data === null) {
                setMessage(`Error: ${response.statusText}`);
                return;
            }

            setMembers(membersResponse.data.memberViews);
            setMessage("Success!");
        }
        fetchUserInfo();
    }, []);
    return (
        <div>
            <p>Welcome to the dashboard: {user === null ? "Unidentified!" : user.username}</p>
            {members === null ? (
                <div></div>
            ) : (
                <div>
                    <ul>
                        {
                            members.map((view) => (
                                <li>{view.administrator ? `Admin ${view.username}\n` : `User ${view.username} playing as ${view.assignedRoleId} in Bürgerrat ${view.assignedBuergerrat}`}</li>
                            ))
                        }
                    </ul>
                </div>
            )}

            <p>{message}</p>
        </div>
    );
}