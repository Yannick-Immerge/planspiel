"use client"
import ResourceComponent from "@/app/components/ResourceComponent";
import {useEffect, useState} from "react";
import {viewUser} from "@/app/api/game_controller_interface";
import {getLocalUsername} from "@/app/api/utility";
import {getRole} from "@/app/api/data_controller_interface";

export default function Play() {
    const [message, setMessage] = useState("");
    useEffect(() => {
        const queryUserData = async () => {
            let localUsername = getLocalUsername();
            if (localUsername === null) {
                setMessage("Not logged in.");
                return;
            }

            const viewResponse = await viewUser(localUsername);
            if(!viewResponse.ok || viewResponse.data === null) {
                setMessage(viewResponse.statusText);
                return;
            }

            if(viewResponse.data.userView.assignedRoleId === null) {
                setMessage("Not yet assigned a role.");
                return;
            }

            const roleResponse = await getRole(viewResponse.data.userView.assignedRoleId);
            if(!roleResponse.ok || roleResponse.data === null) {
                setMessage(viewResponse.statusText);
                return;
            }

            setMessage(`Assigned role: ${roleResponse.data.role.name} - ${roleResponse.data.role.description}`);
        }
        queryUserData();
    }, []);

    return (
        <div>
            <p>{message}</p>
        </div>
    );
}