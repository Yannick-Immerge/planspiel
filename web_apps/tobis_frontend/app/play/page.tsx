import React from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic.js';
import LocalTime from './LocalTime';

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
    key: string;
    pos: Coordinates;
    icon: string;
    description: string;
}

const ProfileView = () => {

    const user: UserProfil = {
        vorname: "Victoria",
        timeZone: "America/New_York",
        titleCard: "/images/new-york-city-streets.png",
        nachname: "Hurong",
        geo: {lat: 40.64103149551113, lng: -73.94254054527582},
        alter: 37,
        height: 168,
        beruf: "Richterin",
        hobbies: ["Sportschiessen, Joggen, Fahrrad Fahren"],
        wohnsituation: "Victoria lebt hier in Brooklyn zusammen mit ihrem Freud in einem großzügigen Apartment.",
    }

    const UserHome: PointOfInterest = {
        key: "0", 
        pos: user.geo, 
        description: user.wohnsituation, 
        icon:'🏠'
    }
    const UserFaveCafe: PointOfInterest = {
        key: "1",
        pos: {lat: 40.7, lng: -73.4}, 
        description: "Victoria liebt Matcha-Tee und dieses kleine Café macht den besten Matcha Latte in ganz New York!",
        icon:'☕'
    }
    const UserWorkplace: PointOfInterest = {
        key: "2",
        pos: {lat: 40.826179793171576, lng:-73.92350325810058},
        description: "Hier in der Bronx arbeitet Victoria als Richterin im Zivilgericht.",
        icon:'💼',
    }

    const pointsOfInterest: PointOfInterest[] = [UserWorkplace, UserFaveCafe];



  return (
    <>
    <div className="bg-[url(/images/new-york-city-streets.png)] absolute w-full h-screen object-cover">
        <div className="w-1/2 h-screen flex drop-shadow-[0_35px_35px_rgba(0,0,0,0.85)]">
            <div className="left-0 w-2/3 bg-transparent ml-10 mr-5 mt-10 mb-10">
                <div className="w-full h-full rounded-3xl">
                    <OsmMapNoSSR center={user.geo} living={UserHome} poi={pointsOfInterest}/>
                </div>
            </div>
            <div className="left-2/3 w-1/3 bg-transparent mr-10 ml-5 mt-10 mb-10">
                <div className="pt-0 pb-10 pr-5 pl-5">
                    <Image className="w-full rounded-full" priority={true} width={200} height={200} src="/images/ProfilePicMockup.png" alt="Profile Picture" />
                </div>
                
                <div className="bg-[#D7DAB0] text-black p-5 rounded-3xl">
                    <div className="m-auto text-xl text-center">Victoria Hurong</div>
                    <table className="text-left text-s border-seperate">
                        <tbody>
                            <tr key={0}><td>Alter:</td><td className="pl-3 pt-2 pb-2">{user.alter}</td></tr>
                            <tr key={1}><td>Größe:</td><td className="pl-3 pt-2 pb-2">{user.height}cm</td></tr>
                            <tr key={2}><td>Beruf:</td><td className="pl-3 pt-2 pb-2">{user.beruf}</td></tr>
                            <tr key={3}><td>Familie:</td><td className="pl-3 pt-2 pb-2">ledig</td></tr>
                            <tr key={4}><td>Hobbies:</td><td className="pl-3 pt-2 pb-2">{user.hobbies.concat(", ", )}</td></tr>
                            <tr key={5}><td>Hobbies:</td><td className="pl-3 pt-2 pb-2">{user.hobbies.concat(", ", )}</td></tr>
                        </tbody>
                    </table>
                </div>
                <div className="m-10">
                    <LocalTime timeZone={user.timeZone}/>
                </div>
            </div>
        </div>
    </div>
    </>
  )
}

export default ProfileView
