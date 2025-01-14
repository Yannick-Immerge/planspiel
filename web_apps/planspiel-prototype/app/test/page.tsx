"use client"
import React, { useState } from 'react'
import VotingArea from '../play/VotingComponents/VotingArea'
import { Buergerrat, Fact, GameState, Post, RoleData, RoleMetadata } from '../api/models'
import EMailProvider from '../play/EMailComponents/EMailProvider'
import PersonProfile from '../play/ProfileComponents/PersonProfile'
import { MdOutlineMail } from 'react-icons/md'
import { GoCommentDiscussion } from 'react-icons/go'
import { BsPersonVcard } from 'react-icons/bs'

const page = () => {

    const [activePanel, setActivePanel] = useState<"profile" | "voting" | "email">("voting");

    const buergerratOne : Buergerrat = {
        parameters: ["Parameter of Wisdom", "Parameter of Courage"],
        configuration: null
    }

    const buergerratTwo : Buergerrat = {
        parameters: ["Parameter of Doom", "Parameter of Power"],
        configuration: null
    }

    const gameState : GameState = {
        phase: "voting",
        votingEnd: new Date("01-12-2025 14:08"),
        buergerrat1: buergerratOne,
        buergerrat2: buergerratTwo,
        id: 0,
        projection: null
    }

    const anais_metadata: RoleMetadata = {
        name: "Anais Fournier",
        gender: "w",
        birthday: "01/03/1988",
        living: "Rue Voltaire 44, Lyon, Frankreich",
        status: "Let's talk about waste!",
        language: "Französisch",
        job: "Metzgerin und Leiterin bei der Tafel \" Aliments pour Lyon\""
    }

    const anais_fact: Fact = {
        name: "Law!",
        isScenario: false,
        textIdentifier: "text.md",
        hyperlink: "https://zerowasteeurope.eu/wp-content/uploads/2020/11/zwe_11_2020_factsheet_france_en.pdf"
    }

    const anais_post: Post = {
        name: "article_post",
        author: "Ben Affleck",
        type: "by_me",
        textDeIdentifier: "roles/11_anais_fournier/posts/article_post/text_de.md",
        textOrigIdentifier: "roles/11_anais_fournier/posts/article_post/text_orig.md",
        imageIdentifiers: [ "roles/11_anais_fournier/posts/article_post/anais_tafel.png", "roles/11_anais_fournier/posts/article_post/wasted_food.png" ],
        isScenario: false
    }

    const anais_role : RoleData = {    
        metadata: anais_metadata,
        profilePictureIdentifier: "roles/11_anais_fournier/profile_picture.png",
        profilePictureOldIdentifier: "roles/11_anais_fournier/profile_picture_old.png",
        titlecardIdentifier: "roles/11_anais_fournier/titlecard.png",
        infoIdentifier: "roles/11_anais_fournier/info.md",
        facts: [ anais_fact ],
        posts: [ anais_post ]
    }

    

  return (
    <div className="bg-cover bg-center bg-no-repeat bg-sky-900 min-h-screen bg-fixed">
            
            {activePanel == "profile"? 
                    <PersonProfile gameState={gameState} roleData={anais_role}/> : 
            <></>}

            {activePanel == "voting"?
                   <VotingArea gameState={gameState} roleData={anais_role}/> :
            <></>}

            {activePanel == "email"? 
                    <EMailProvider nachname={anais_role? anais_role.metadata.name : "Dame"} themen={["Hallo", "Mallo"]}/> : 
            <></>}

            <div className="fixed w-full h-[10%] left-0 bottom-0 bg-sky-600 shadow-[0px_0px_20px_rgba(0,0,0,0.5)] flex">
                <div onClick={() => setActivePanel("profile")} className="w-1/3 content-center">
                    <BsPersonVcard color={activePanel === "profile"? "white" : "black"} className="m-auto w-[60%] h-[60%] transition-all transition-duration-200"/>
                </div>
                <div onClick={() => setActivePanel("voting")} className="w-1/3 content-center">
                    <GoCommentDiscussion color={activePanel === "voting"? "white" : "black"} className="m-auto w-[60%] h-[60%] transition-all transition-duration-200"/>
                </div>
                <div onClick={() => setActivePanel("email")} className="w-1/3 content-center">
                    <MdOutlineMail color={activePanel === "email"? "white" : "black"} className="m-auto w-[60%] h-[60%] transition-all transition-duration-200"/>
                </div>
            </div>
        </div>
  )
}

export default page
