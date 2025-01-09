"use client"

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic.js';
import LocalTime from './LocalTime';
import { getSessionUsername } from '../api/utility';
import { viewUser } from '../api/game_controller_interface';
import { Role, RoleEntry, UserView } from '../api/models';
import { ConfigurationPlaceholder } from './PlayViewHelpers';
import { getRole, getRoleEntry } from '../api/data_controller_interface';
import ResourceComponent from '../components/ResourceComponent';

const OsmMapNoSSR = dynamic(() => import("./Map/Map"), {ssr: false});

export interface Coordinates {
    lat: number;
    lng: number;
}

interface UserProfil {
    timeZone: string;
    vorname: string;
    nachname: string;
    geo: Coordinates
    titleCard: string;
    wohnsituation: string,
    alter: number;
    height: number;
    beruf: string;
    hobbies: [string];
}

export interface PointOfInterest {
    id: number;
    pos: Coordinates;
    icon: string;
    description: string;
}

/*
/**
 * Restricted View onto a user that needs no authentication.
export interface UserView {
    username: string,
    status: "online" | "offline" | "disabled",
    assignedRoleId: string | undefined,
    assignedBuergerrat: number | undefined,
    administrator: boolean
}
*/

const ProfileView = () => {
    const [nachrichtenzeile, setNachrichtenzeile] = useState("")
    const dummyUser : UserView = {username: "ERROR", administrator: false, assignedBuergerrat: 1, assignedRoleId: "NONE", status: "disabled"}
    
    const [user, setUser] = useState<UserView>(dummyUser);
    
    const dummyRole : Role = {name: "This is a name.", description: "This is a description.", entries: [], scenarios: []}

    const [character, setCharacter] = useState<Role>(dummyRole)
    const [sessionReady, setSessionReady] = useState(false);

    useEffect(() => { // Setup of the User Page
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
                window.location.replace("../dashboard");
            } else {
                setNachrichtenzeile("Willkommen, " + user.username);
                return;
            }
        }
        fetchUserInfo();

        const fetchRoleInfo = async () => {
            let response = await getRole(user.assignedRoleId? user.assignedRoleId : "8_yi_huang");
            if (!response || !response.ok || !response.data) {
                //setSessionReady(true);
                setSessionReady(false);
            } else {
                setCharacter(response.data.role)
                setSessionReady(true);
            }
        }
        fetchRoleInfo();

    }, []);


    /*const user_DEPRECATED : UserProfil = {
        vorname: "Samantha",
        timeZone: "America/New_York",
        titleCard: "/images/new-york-city-streets.png",
        nachname: "Hurong",
        geo: {lat: 40.64103149551113, lng: -73.94254054527582},
        alter: 37,
        height: 168,
        beruf: "Richterin",
        hobbies: ["Sportschiessen, Joggen, Fahrrad Fahren"],
        wohnsituation: "Samantha lebt hier in Brooklyn zusammen mit ihrem Freud in einem großzügigen Apartment.",
    }*/
/*
    const UserHome: PointOfInterest = {
        id: 0, 
        pos: role.en, 
        description: user.wohnsituation, 
        icon:'🏠'
    }
    const UserFaveCafe: PointOfInterest = {
        id: 1,
        pos: {lat: 40.7, lng: -73.4}, 
        description: "Samantha liebt Matcha-Tee und dieses kleine Café macht den besten Matcha Latte in ganz New York!",
        icon:'☕'
    }
    const UserWorkplace: PointOfInterest = {
        id: 2,
        pos: {lat: 40.826179793171576, lng:-73.92350325810058},
        description: "Hier in der Bronx arbeitet Samantha als Richterin im Zivilgericht.",
        icon:'💼',
    }
*/
    const pointsOfInterest: PointOfInterest[] = [];

    const [roleEntries, setRoleEntries] = useState<RoleEntry[]>([]);
    useEffect(() => {
        const entries : RoleEntry[] = [];
        character.entries.forEach(async (n) => {await getRoleEntry(n).then((result) => {if (result.data != undefined) entries.push(result.data.role_entry)})})
        setRoleEntries(entries);
    }, []);

  return (
    
    <div className="bg-cover bg-center bg-no-repeat bg-[url(/images/EarthTint.png)] min-h-screen bg-fixed">
        <div className="pl-5 pt-2 flex text-left">
            <div className='leading-[2rem] pt-2 pb-2 pr-3 text-2xl'>Angemeldet als:  </div>
            <div className='text-amber-300 pt-2 pb-2 pl-4 pr-4 text-3xl rounded-full shadow-[0px_10px_10px_rgba(0,0,0,0.5)] backdrop-blur-xl'>{user.username}</div>
        </div>
        {sessionReady? 
                <div>
                    <div>Name: {character.name}</div>
                    <div>
                        {roleEntries.map((n) => <ResourceComponent resource={n.resource} />)}
                    </div>
                </div>
            :   <div className="p-5">
                    <ConfigurationPlaceholder />
                </div>}
    </div>
    
    
  )
}

export default ProfileView
function setUser(user: UserView) {
    throw new Error('Function not implemented.');
}

