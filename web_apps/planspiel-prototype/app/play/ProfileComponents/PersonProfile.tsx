import React, { useEffect, useState } from 'react'
import { GameState, Post, RoleData, RoleMetadata } from '../../api/models'
import { FaMap } from 'react-icons/fa';
import { metadata } from '@/app/layout';
import { GrMapLocation } from 'react-icons/gr';
import { LiaBirthdayCakeSolid } from 'react-icons/lia';
import PostComponent from './PostComponent';
import ArticleComponent from './ArticleComponent';
import MarkdownComponent from './MarkdownComponent';

export default function PersonProfile ({gameState, roleData}: {gameState: GameState, roleData: RoleData | null}) {

    if (!roleData) return (<div>Profil konnte nicht geladen werden. Versuch, die Seite neu zu laden, ansonsten wende dich an unser support team.</div>)

    // TODO Die Projektsionsphase fehlt wo das Profilbild ausgetauscht wird und die Szenarios stimmen

    return (
    <div className="w-full h-full">
        <Titlecard url={"resources/" + roleData.titlecardIdentifier} />
        <ProfilePicture url={"resources/" + (roleData.profilePictureIdentifier)}/>
        <MetadataArea roleMetadata={roleData.metadata}/>
        <MarkdownComponent path={roleData.infoIdentifier}/>
        <PostsArea posts={roleData.posts} roleMetadata={roleData.metadata} />
    </div>
  )
}

function GetStatus(name:string) : string {
    if (name === "Ethan Miller") return "Saturdays are for the boys"
    if (name === "Anais Fournier") return "Let's talk about Waste!"
    if (name === "Mikkel Pedersen") return "~ v i b i n g ~"
    return "Here comes " + name.split(" ")[0] + "!"
}

function PostsArea({posts, roleMetadata} : {posts: Post[] | null, roleMetadata: RoleMetadata}) {
    if (!posts) return (<div>Dein Feed konnte nicht geladen werden. Versuche es später erneut.</div>);

    return (<>
        <div className='text-2xl p-5 text-[#ffffff90]'>
            Für dich interessant:
        </div>
        {posts
            .map((n, index) => 
            <div key={index} className="py-2">
                <PostComponent post={n} roleMetadata={roleMetadata}/>
            </div>)
            }
            <div className="h-40 w-full bg-sky-900">
                
            </div>
    </>)
}

function GetAge(birthday: Date) : number {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    if (today.getMonth() < birthday.getMonth()) age--;
    else if (today.getMonth() == birthday.getMonth() && today.getDate() < birthday.getDate()) {
        age--;
    }
    return age;
}

function GetPrettyDateString(birthday: Date) : string {
    // Deutsches Formatting DD.MM.YYYY
    return `${birthday.getDate()}.${birthday.getMonth()}. ${birthday.getFullYear()}`;
}

function MetadataArea({roleMetadata} : {roleMetadata: RoleMetadata | null}) {

    if (!roleMetadata) return (<div>Deine Metadaten konnten nicht geladen werden. Versuche es später erneut.</div>)

    const birthday : Date = new Date(roleMetadata.birthday);
    
    const age : number = GetAge(birthday);

    const dateString : string = GetPrettyDateString(birthday);

    const birthdayString : string = `${dateString} (${age})`;

    return (
        <div className="w-full border-solid border-white pt-7 pb-4 px-5 bg-sky-800 shadow-[0px_-10px_20px_rgba(0,0,0,0.8)]" style={{borderTopWidth: "2px"}}>
            <div className="w-full text-3xl">
                {roleMetadata.name}
            </div>
            <div className="w-full flextext-xl text-[#ffffff90]">
                {roleMetadata.status}
            </div>
            <div className="flex pt-3">
                <GrMapLocation className="" color="white"/>
                <div className="pl-2 text-sm">{roleMetadata.living}</div>
            </div>
            <div className="flex py-2">
                <LiaBirthdayCakeSolid className="" color="white"/>
                <div className="pl-2 text-sm">{birthdayString}</div>
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
