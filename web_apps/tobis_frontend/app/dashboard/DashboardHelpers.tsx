import React from 'react'
import { FaUserPlus } from 'react-icons/fa'
import { createUserForSession, getSessionMemberViews } from '../api/game_controller_interface'
import { UserView } from '../api/models'
import { UserViewIDWrapper } from './page'

export const CreateUserButton = (props: {disabled: boolean}) => {
    const createNewUser = async () => {
        if (props.disabled) return
        await createUserForSession()
    }

    return <button disabled={props.disabled} onClick={createNewUser} className="w-[3rem] h-[3rem] rounded-full disabled:bg-[#fff1] backdrop-blur-sm bg-[#8f82] hover:bg-[#dfd3] transition-all duration-150">
        <FaUserPlus className="w-[1.5rem] h-[1.5rem] translate-x-[50%]"/>
    </button>
}

export async function GetUsersInSession() : Promise<UserViewIDWrapper[]>  {
    const dummyReturn : UserViewIDWrapper[] = [{userView: {username: "Dummy", status: "disabled", assignedRoleId: undefined, assignedBuergerrat: undefined, administrator: false}, id: 0}];

    const response = await getSessionMemberViews();

    if (!response.ok || response.data === undefined) {
        console.log("Mistake while getting users in session: " + response?.statusText)
        return dummyReturn;
    } else {
        let idCounter = 0;
        return response.data.memberViews.map((n) => {return {userView: n, id: idCounter++}});
    }
}
