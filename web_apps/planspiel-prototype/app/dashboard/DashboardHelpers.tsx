import { LuUserCheck, LuUserX } from "react-icons/lu";
import { UserView } from "../api/models";
import { TbZzz } from "react-icons/tb";
import { FaPoo } from "react-icons/fa";
import { ToCamelCase } from "./StringHelper";

export function FilteredUserList({userStati, applyFilter, description, includeBrgrrt, annotation, showPwd=false} : {
    userStati: UserView[], 
    applyFilter: (value: UserView,index: number , array: UserView[]) => unknown, 
    description: string,
    includeBrgrrt?: boolean
    annotation?: string
    showPwd?: boolean
}) {

    const filteredUsers = userStati.filter(applyFilter);
    return (
        <>
        <div className="bg-[#faf2] backdrop-blur-2xl rounded-2xl mt-2 mb-2 pb-2 pt-2 shadow-[0px_10px_10px_rgba(0,0,0,0.5)]">
        
                    {description? 
                    <div className="ml-5">
                        {filteredUsers.length} {description}
                    </div> : <></>}
                    {showPwd && filteredUsers.length != 0?
                    <div className="ml-5 flex">
                        <div className="ml-2 px-3 py-1 text-amber-300  rounded-full bg-[#44447788]">Achtung: Die Passwörter werden mit dem ersten Anmeldesversuch der Teilnehmer festgelegt.</div>
                    </div> : <></>
                    }  
                    {filteredUsers.length != 0 && <div className="text-xs text-slate-400 flex">
                        <div className="ml-[3.75rem]">Benutzername</div>
                        <div className="absolute left-[35%]">Name</div>
                        {includeBrgrrt? <div className="absolute left-[55%]">Bürgerrat</div> : <></>}
                    </div>}
                    <div className="bg-[#0002] ml-5 mr-5 rounded-2xl">
                        {filteredUsers.map((n, index) => <UserEntry key={index} user={n} includeBrgrrt={includeBrgrrt}/>)}
                    </div>
                    <div className="ml-5 text-sm text-lime-400">
                        {filteredUsers.length != 0? annotation : ""}
                    </div>
                     
        </div>
        
                </> 
                
    )
}

export function UserEntry(props: {user: UserView, includeBrgrrt?: boolean}) {
    let rollenName = ""
    if (props.user.assignedRoleId != null) {
        const parts = props.user.assignedRoleId.split("_")
        parts.forEach((n) => {n = n.substring(2, n.length)})

        parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].substring(1, parts[1].length)
        parts[2] = parts[2].charAt(0).toUpperCase() + parts[2].substring(1, parts[2].length)

        rollenName = ToCamelCase(props.user.assignedRoleId, true);
    }


    const rollenDiv = rollenName?   <div className="absolute left-[35%]">
                                        {rollenName}
                                    </div> 
                                    : 
                                    <div className="absolute left-[30%] text-slate-500">
                                        Noch keine Rolle    
                                    </div>
    return (
        <div className="text-left flex">
            <div className="absolute translate-y-[25%] pl-2">
                {GetIconFromStatus({status: props.user.status})}
            </div>
            {GetFormatTextFromStatus({status: props.user.status, text: props.user.username})}
            
            {rollenDiv}
            {props.includeBrgrrt?
            <div className="absolute left-[55%] text-xs leading-[1.5rem]">
                {props.user.assignedBuergerrat == 1? ("🏭 Besteuerung fossiler Brennstoffe etc.") : ("🐄 Verringerung agrarer Abgase etc.")}
            </div> :<></>}
        </div>
    )
}

function GetIconFromStatus(props: {status: "online" | "offline" | "disabled"}) : React.ReactElement {
    if (props.status === "disabled") return <LuUserX color="#aaaa"/>
    if (props.status === "offline") return <TbZzz color="#aaaa"/>
    if (props.status === "online") return <LuUserCheck color="#a3e635"/>
    else return <FaPoo />
}

function GetFormatTextFromStatus(props: {status: "online" | "offline" | "disabled", text: string}) : React.ReactElement {
    if (props.status === "disabled") return <div className='pl-10 text-[#aaaa]'>{props.text}</div>
    if (props.status === "offline") return <div className='pl-10 text-[#aaaa]'>{props.text}</div>
    if (props.status === "online") return <div className='pl-10 text-lime-400'>{props.text}</div>
    else return <div className='pl-10 text-amber-400'>{"Disallowed Status!"}</div>
}