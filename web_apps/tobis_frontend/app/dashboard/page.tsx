"use client"

import React, { useEffect, useState } from 'react'
import { MockupGetUserIDs } from "./MockupGetUserIDs"
import { TbZzz } from "react-icons/tb"
import { LuUserCheck, LuUserX } from 'react-icons/lu'
import { FaPoo, FaStopwatch } from 'react-icons/fa'
import TextEingabe from '../login/TextEingabe'
import { viewUser } from '../api/game_controller_interface'
import { getSessionUsername } from '../api/utility'
import { UserView } from '../api/models'
import { CreateUserButton, GetUsersInSession } from './DashboardHelpers'

export interface UserViewIDWrapper {
    userView: UserView
    id: number
}

const TIME_REGEX = /^[0-9]{2}\:[0-9]{2}$/;
const TIME_REGEX_HOURS = /^[0-9]{2}$/;

function GetProperTimeString(props: {time: Date}) {
    return ((props.time.getHours()<10?"0" : "") + props.time.getHours() + ":" + (props.time.getMinutes()<10?"0" : "") + props.time.getMinutes());
}

function GetProperTimeAmountString(props: {time: Date}) {
    return ((props.time.getHours()<10?"0" : "") + props.time.getHours() + ":" + (props.time.getMinutes()<10?"0" : "") + props.time.getMinutes());
}

const page = () => {
    const [user, setUser] = useState<UserView | undefined>();

    const [nachrichtenzeile, setNachrichtenzeile] = useState("")

    useEffect(() => {
        const username = getSessionUsername();
        if(username === undefined) {
            window.location.replace("../login");
            return;
        }
        const fetchUserInfo = async () => {
            let response = await viewUser(username);
            if (!response.data) {
                window.location.replace("../login");
                return;
            }
            const user = response.data.userView;
            setUser(user);
            if (user.administrator) {
                setNachrichtenzeile("Willkommen, Admin!");
            } else {
                window.location.replace("../login");
                return;
            }
        }
        fetchUserInfo();
    }, []);


    const startTime = GetProperTimeString({time: new Date(new Date().getTime() + 45*60000)});
    const [endeBurgerrat, setEndeBurgerrat] = useState(startTime)
    const [restzeit, setRestZeit] = useState("00:45:00")

    const changeEndeBurgerrat = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setEndeBurgerrat(event.target.value)
    }

    const users : UserViewIDWrapper[] = [{userView: {username: "AusgangsUser", status: "disabled", assignedRoleId: undefined, assignedBuergerrat: undefined, administrator: false}, id: 0}];
    const [userStati, setUserStati] = useState(users)

    useEffect(() => {
        const intervalID = setInterval(async () => {
                await GetUsersInSession()
                    .then((result) => setUserStati(result))
                    .catch((error) => setNachrichtenzeile(error))
            }, 5000);
            
        return () => clearInterval(intervalID);
    }, []);
    

    const reformatEndeBurgerrat = async () => {
        if (TIME_REGEX.test(endeBurgerrat)) {
            const parts : string[] = endeBurgerrat.split(":")
            const endzeitMinutes = Number(parts[1])
            const endzeitHours = Number(parts[0])
        } else if (TIME_REGEX_HOURS.test(endeBurgerrat)) {
            setEndeBurgerrat(endeBurgerrat + ":00")
        } else {
            const time = new Date(new Date().getTime() + 60000*45);
            setEndeBurgerrat(time.getHours() + ":" + time.getMinutes());
        }
        neuberechnungRestZeit();
    }

    const neuberechnungRestZeit = async() => {
        const parts : string[] = endeBurgerrat.split(":")
        const endzeitMinutes = Number(parts[1])
        const endzeitHours = Number(parts[0])
        const jetzt : Date = new Date();
        const verbleibendeSekunden = 60 - jetzt.getSeconds();
        
        let verbleibendeMinuten = endzeitMinutes - jetzt.getMinutes() - 1;
        let uberlaufMin = 0
        if (verbleibendeMinuten < 0) {
            uberlaufMin = 1;
            verbleibendeMinuten += 60;
        }

        const verbleibendeStunden = Math.max(0, endzeitHours - jetzt.getHours() - uberlaufMin);

        setRestZeit(
            (verbleibendeStunden<10? "0":"") + verbleibendeStunden + ":" +
            (verbleibendeMinuten<10? "0":"") + verbleibendeMinuten + ":" +
            (verbleibendeSekunden<10? "0":"") + verbleibendeSekunden
        )
    }

    const handleEnter = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') reformatEndeBurgerrat()
    }

  return (
    <div className="bg-cover bg-center bg-no-repeat bg-[url(/images/EarthTint.png)] min-h-screen bg-fixed">
        <div className="pl-5 pt-2 flex text-left">
            <div className='leading-[2rem] pt-2 pb-2 pr-3 text-2xl'>{nachrichtenzeile}</div>
        </div>
        <div className="mt-5 flex w-full">
            <div className="w-full ml-6 mr-3">
                <FilteredUserList userStati={userStati} desiredStatus={"online"} description="benutzer online"/>

                <FilteredUserList userStati={userStati} desiredStatus={"offline"} description="benutzer offline"/>

                <FilteredUserList userStati={userStati} desiredStatus={"disabled"} description="noch nicht vergebene Profile"/>

                <CreateUserButton />
            </div>
            <div className="w-full ml-3 mr-3 bg-[#ffa2] backdrop-blur-2xl rounded-2xl mt-2 mb-2 pb-2 pt-2 shadow-[0px_10px_10px_rgba(0,0,0,0.5)]">
                <div className="text-2xl">
                    🏭 Bürgerrat Energie
                </div>
                <div>
                    Endziel: Stellungnahme zum angehenden Beschluss bezüglich der Besteuerung von Fossilen Brennstoffen und der Subvention von Windkraft.
                </div>
                <div>
                    <div className="bg-[#0002] ml-5 mr-5 rounded-2xl">
                        {userStati.filter((n) => { n.userView.status != "disabled" && n.userView.assignedBuergerrat === 2;}).map((n) => <UserEntry key={n.id} user={n.userView}/>)}
                    </div>
                </div>
                <div>
                    Verbleibende Zeit: {restzeit}
                </div>
            </div>
            <div className="w-full ml-3 mr-6 bg-[#aff2] backdrop-blur-2xl rounded-2xl mt-2 mb-2 pb-2 pt-2 shadow-[0px_10px_10px_rgba(0,0,0,0.5)]">
                <div className="text-2xl">
                    🐄 Bürgerrat Fleisch und Abgase
                </div>
                <div>
                    Endziel: Stellungnahme zur angehenden Erhöhung der Steuer auf Fleischwaren sowie den Mindestpreis für Fleischprodukte
                </div>
                <div>
                    <div className="bg-[#0002] ml-5 mr-5 rounded-2xl">
                        {userStati.filter((n) => { return n.userView.status != "disabled" && n.userView.assignedBuergerrat === 1;}).map((n) => <UserEntry key={n.id} user={n.userView}/>)}
                    </div>
                </div>
                <div>
                    Verbleibende Zeit: {restzeit}
                </div>
            </div>
        </div>
        <div className='w-1/4 m-auto mb-0 flex'>
            <div>
                <div className="w-1/2 m-auto mt-0">
                <TextEingabe
                            onKeyDown={handleEnter}
                            userFocus={false}
                            onBlur={reformatEndeBurgerrat}
                            onFocus={null}
                            correction=""
                            describedby={"randomID100"}
                            validInput={true}
                            onChange={changeEndeBurgerrat} 
                            input={endeBurgerrat} 
                            type="text" 
                            text="Benutzername" 
                            icon={null}/>
                </div>
                Ende der Bürgerräte
            </div>

            <div onClick={() => {}} className="select-none mt-0 shadow-[inset_0px_-10px_10px_rgba(0,0,0,0.5)] text-xl content-center m-auto bg-amber-600 w-[150px] h-[150px] rounded-full hover:bg-amber-500 active:mt-3 transition-all duration-100">
                Bürgerräte Starten
            </div>
        </div>
    </div>
  )
}

function GetIconFromStatus(props: {status: "online" | "offline" | "disabled"}) : React.ReactElement {
    if (props.status === "online") return <LuUserX />
    if (props.status === "offline") return <TbZzz />
    if (props.status === "disabled") return <LuUserCheck />
    else return <FaPoo />
}

function FilteredUserList(props: {userStati: UserViewIDWrapper[], desiredStatus: "online" | "offline" | "disabled", description: string}) {
    const filteredUsers = props.userStati.filter((n) => {return n.userView.status === props.desiredStatus});
    return (
        <div className="bg-[#faf2] backdrop-blur-2xl rounded-2xl mt-2 mb-2 pb-2 pt-2 shadow-[0px_10px_10px_rgba(0,0,0,0.5)]">
                    <div>
                        {filteredUsers.length} {props.description}{filteredUsers.length == 0? "" : ":"}
                    </div>
                    <div className="bg-[#0002] ml-5 mr-5 rounded-2xl">
                        {filteredUsers.map((n) => <UserEntry key={n.id} user={n.userView}/>)}
                    </div>
                </div>
    )
}

function UserEntry(props: {user: UserView}) {
    return (
        <div className="text-left flex">
            <div className="absolute translate-y-[25%] pl-2">
                {GetIconFromStatus({status: props.user.status})}
            </div>
            <div className='pl-10'>
                {props.user.username}
            </div>
        </div>
    )
}

export default page
