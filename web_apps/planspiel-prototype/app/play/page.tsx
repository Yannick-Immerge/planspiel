"use client"
import {useEffect, useState} from "react";
import {viewUser} from "@/app/api/game_controller_interface";
import {getLocalUsername} from "@/app/api/utility";
import {getRole, getRoleEntryInformation, GetRoleEntryInformationResult} from "@/app/api/data_controller_interface";
import ResourceListComponent from "@/app/components/ResourceListComponent";
import MetadataComponent from "@/app/components/MetadataComponent";

export default function Play() {
    const [roleInfo, setRoleInfo] = useState<GetRoleEntryInformationResult | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    useEffect(() => {
        const queryUserData = async () => {
            let localUsername = getLocalUsername();
            if (localUsername === null) {
                setWarning("Not logged in.");
                return;
            }

            const viewResponse = await viewUser(localUsername);
            if(!viewResponse.ok || viewResponse.data === null) {
                setWarning(viewResponse.statusText);
                return;
            }

            if(viewResponse.data.userView.assignedRoleId === null) {
                setWarning("Not yet assigned a role.");
                return;
            }

            const roleResponse = await getRole(viewResponse.data.userView.assignedRoleId);
            if(!roleResponse.ok || roleResponse.data === null) {
                setWarning(viewResponse.statusText);
                return;
            }

            const roleInfoResponse = await getRoleEntryInformation(viewResponse.data.userView.assignedRoleId)
            if(!roleInfoResponse.ok || roleInfoResponse.data === null) {
                setWarning(roleInfoResponse.statusText);
                return;
            }
            setRoleInfo(roleInfoResponse.data)
        }
        queryUserData();
    }, []);

    return (
        <div>
            <h1 className="text-xl">Hello!</h1>
            {roleInfo === null ? (
                <p>You have not been assigned a role yet!</p>
            ) : (
                <div>
                    <h1 className="text-lg">Get to know your Role:</h1>
                    <MetadataComponent metadata={roleInfo.metadata} />
                    <ResourceListComponent resourceEntries={roleInfo.resourceEntries} />
                </div>
            )}
            {warning === null ? (
                <div></div>
            ) : (
                <div>
                    <h1 className="text-lg">Warning:</h1>
                    <p>{warning}</p>
                </div>
            )}
        </div>
    );
}