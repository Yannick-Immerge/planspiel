import React, { useEffect, useState } from 'react'
import { GameState, Resource, RoleMetadata } from '../../api/models'
import { FaMap } from 'react-icons/fa';
import { metadata } from '@/app/layout';
import { GrMapLocation } from 'react-icons/gr';
import { LiaBirthdayCakeSolid } from 'react-icons/lia';
import ResourceComponent from './ResourceComponent';
import ArticleComponent from './ArticleComponent';

export default function PersonProfile ({gameState, metadata, roleEntries}: {gameState: GameState, metadata: RoleMetadata | null, roleEntries: Resource[] | null}) {

    console.log(roleEntries?.length)

  return (
    <div className="w-full h-full">
        <Titlecard url={(roleEntries? ("resources/" + roleEntries.find(n => n.contentType === "titlecard")?.identifier) : "images/EarthTint.png")} />
        <ProfilePicture url={"resources/" + (roleEntries? roleEntries.find(n => n.contentType === "profile_picture")?.identifier : "0_unknown_profile_picture.png")}/>
        <MetadataArea roleMetadata={metadata}/>
        {roleEntries?.filter(n => n.contentType === "info").map((n, index) => <ResourceComponent key={index} resource={n}/>)}
        <PostsArea roleEntries={roleEntries} />
    </div>
  )
}

function GetStatus(name:string) : string {
    if (name === "Ethan Miller") return "Saturdays are for the boys"
    if (name === "Anais Fournier") return "Let's talk about Waste!"
    if (name === "Mikkel Pedersen") return "~ v i b i n g ~"
    return "Here comes " + name.split(" ")[0] + "!"
}

function PostsArea({roleEntries} : {roleEntries: Resource[] | null}) {
    if (!roleEntries) return (<></>);

    return (<>
        <div className='text-2xl p-5 text-[#ffffff90]'>
            Für dich interessant:
        </div>
        {roleEntries
            .filter((n) => {return n.contentType != "profile_picture" && n.contentType != "titlecard" && n.contentType != "info"})
            .map((n, index) => 
            <div key={index} className="py-2">
                <ResourceComponent resource={n}/>
            </div>)
            }
            <div className="h-40 w-full bg-sky-900">
                
            </div>
    </>)
}

function MetadataArea({roleMetadata} : {roleMetadata: RoleMetadata | null}) {
    return (
        <div className="w-full border-solid border-white pt-7 pb-4 px-5 bg-sky-800 shadow-[0px_-10px_20px_rgba(0,0,0,0.8)]" style={{borderTopWidth: "2px"}}>
            <div className="w-full text-3xl">
                {roleMetadata?.name}
            </div>
            <div className="w-full flextext-xl text-[#ffffff90]">
                {GetStatus(roleMetadata?.name? roleMetadata.name : "")}
            </div>
            <div className="flex pt-3">
                <GrMapLocation className="" color="white"/>
                <div className="pl-2 text-sm">{roleMetadata?.address}</div>
            </div>
            <div className="flex py-2">
                <LiaBirthdayCakeSolid className="" color="white"/>
                <div className="pl-2 text-sm">3. Januar {2025-(roleMetadata?.age? roleMetadata?.age : 50)} ({roleMetadata?.age})</div>
            </div>
        </div>)
}

function ProfilePicture ({url} : {url:string}) {
    return (
    <div className="shadow-[0px_0px_20px_rgba(0,0,0,0.6)] absolute left-[20px] top-[20px] h-[150px] w-[150px] rounded-full border-white border-solid" 
    style={{backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: "center", borderWidth: "2px"}}>

    </div>)
}

function Titlecard ({url} : {url:string}) {
    return (
    <div className="w-full h-[150px]" 
    style={{backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: "center"}}>

    </div>)
}
