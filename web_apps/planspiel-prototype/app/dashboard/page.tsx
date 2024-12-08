"use client";

import {getSessionUsername} from "@/app/api/utility";
import {useEffect, useState} from "react";
import {UserView} from "@/app/api/models";
import {viewUser} from "@/app/api/game_controller_interface";


export default function Dashboard() {
    const [user, setUser] = useState<UserView | undefined>();
    const [message, setMessage] = useState("");
    useEffect(() => {
        const username = getSessionUsername();
        if(username === undefined) {
            setUser(undefined);
            setMessage("You are logged out!")
            return;
        }
        const fetchUserInfo = async () => {
            let response = await viewUser(username);
            if (response.data === undefined) {
                setUser(undefined);
                setMessage(`Error: ${response.statusText}`)
                return;
            }
            const user = response.data.userView;
            setUser(user);
            setMessage(user.administrator ? "Welcome, Admin!" : "Use /play as a normal user!")
        }
        fetchUserInfo();
    }, []);
    return (
        <div>
            <p>Welcome to the dashboard: {user === undefined ? "Unidentified!" : user.username}</p>
            <p>{message}</p>
        </div>
    );
}