"use client"

import { Fact, GameState, Post, RoleData, RoleMetadata } from '../../api/models'
import { GrMapLocation } from 'react-icons/gr';
import { LiaBirthdayCakeSolid } from 'react-icons/lia';
import PostComponent from './PostComponent';
import MarkdownComponent from './MarkdownComponent';
import { GiRollingSuitcase } from 'react-icons/gi';
import { FaSuitcase } from 'react-icons/fa';
import { RatComponent, RatFactComponent } from '../VotingComponents/VotingArea';
import { useState } from 'react';

export default function PersonProfile ({gameState, roleData, roleID}: {roleID: string, gameState: GameState, roleData: RoleData | null}) {

    if (!roleData) return (<div>Profil konnte nicht geladen werden. Versuch, die Seite neu zu laden, ansonsten wende dich an unser support team.</div>)

    // TODO Die Projektsionsphase fehlt wo das Profilbild ausgetauscht wird und die Szenarios stimmen
    

    return (
    <div className="w-full h-full">
        <Titlecard url={roleData.titlecardIdentifier} />
        <ProfilePicture old={gameState.phase == 'debriefing'} url={roleData.profilePictureIdentifier}/>
        <MetadataArea old={gameState.phase == 'debriefing'} roleMetadata={roleData.metadata}/>
        <BiographyComponent url={roleData.infoIdentifier} roleName={roleData.metadata.name}/>
        <PostsArea roleID={roleID} facts={roleData.facts} posts={roleData.posts} roleMetadata={roleData.metadata} />
    </div>
  )
}

function PostsArea({posts, roleMetadata, facts, roleID} : {roleID: string, facts: Fact[], posts: Post[] | null, roleMetadata: RoleMetadata}) {
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
        {facts
            .map((n, index) => 
            <div key={index} className="py-2">
                <RatFactComponent textIdentifier={`roles/${roleID}/facts/${
                    // Check if at the beginning of the string we have the name of the role, 
                    // if yes, remove it otherwise let it bee
                    n.name.startsWith(roleID) ? n.name.substring(roleID.length + "_".length) : n.name
                }/text.md`} hyperlink={n.hyperlink}/>
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
    const monate = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
    // Deutsches Formatting DD.MM.YYYY
    return `${birthday.getDate()}. ${monate[birthday.getMonth()]}  ${birthday.getFullYear()}`;
}

function MetadataArea({roleMetadata, old} : {old: boolean, roleMetadata: RoleMetadata | null}) {

    if (!roleMetadata) return (<div>Deine Metadaten konnten nicht geladen werden. Versuche es später erneut.</div>)

    const birthday : Date = new Date(roleMetadata.birthday);
    
    const age : number = GetAge(birthday) + (old? 20 : 0);

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
            <div className="flex pt-3">
                <FaSuitcase className="" color="white"/>
                <div className="pl-2 text-sm">{roleMetadata.job}</div>
            </div>
            <div className="flex py-2">
                <LiaBirthdayCakeSolid className="" color="white"/>
                <div className="pl-2 text-sm">{birthdayString}</div>
            </div>
        </div>)
}

function BiographyComponent ({url, roleName} : {roleName: string, url:string}) {
    const [show, setShow] = useState<boolean>(false)

    return (
    <div className="m-5 p-3 bg-stone-300 hover:bg-stone-400 rounded-2xl transition-colors">
        
        {show? <div className="p-3"><MarkdownComponent path={url} /></div> : <></>}
        
        <div onClick={() => setShow(!show)} className=" text-black rounded-full cursor-pointer">{show? "▲ Einklappen" : `▼ Wer ist ${roleName}?`}</div>
    </div>)
}

function ProfilePicture ({url, old} : {url:string, old:boolean}) {
    return (
    <div className="shadow-[0px_0px_20px_rgba(0,0,0,0.6)] absolute left-[20px] top-[20px] h-[150px] w-[150px] rounded-full border-white border-solid" 
    style={{backgroundImage: `url(${old? (url.split(".")[0] + "_old.png") : url})`, backgroundSize: 'cover', backgroundPosition: "center", borderWidth: "2px"}}>

    </div>)
}

function Titlecard ({url} : {url:string}) {
    return (
    <div className="w-full h-[150px]" 
    style={{backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: "center"}}>

    </div>)
}
