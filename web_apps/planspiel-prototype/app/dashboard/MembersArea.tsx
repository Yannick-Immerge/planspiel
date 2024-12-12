import {UserView} from "@/app/api/models";

export default function MembersArea({members} : {members: UserView[] | null}) {
    return members === null ? (
        <div></div>
    ) : (
        <div>
            <h1 className="text-lg">Session Members</h1>
            <ul>
                {
                    members.map((view, index) => (
                        <li key={index}>{view.administrator ? `Admin ${view.username}\n` : `User ${view.username} playing as ${view.assignedRoleId} in Bürgerrat ${view.assignedBuergerrat}`}</li>
                    ))
                }
            </ul>
        </div>
    )
}

