import {UserView} from "@/app/api/models";
import { FilteredUserList } from "./DashboardHelpers";
import { hasUserPassword } from "../api/game_controller_interface";
import { useEffect, useState } from "react";

export default function MembersArea({members} : {members: UserView[] | null}) {
    if (members === null) return <></>;

    
    

    return (
        <div>
            <FilteredUserList
                userStati={members}
                applyFilter={(n) => !n.administrator && n.status == "online"}
                description="Benutzer online"
                includeBrgrrt={true}
                />
            <FilteredUserList
                userStati={members}
                applyFilter={(n) => !n.administrator && n.status == "offline"}
                description="Benutzer offline"
                includeBrgrrt={true}
                showPwd={true}
                />
        </div>
    )
}

