'use client'

import React, { useState } from 'react'
import TextEingabe from '../login/TextEingabe'
import { FaLock, FaUser } from 'react-icons/fa'
import BackgroundWrapper from '../components/BackgroundWrapper'
import { access } from 'fs'

const CreateUser = () => {
    const [accessCode, setAccessCode] = useState("")
    const [userName, setUserName] = useState("")
    const [password1, setPassword1] = useState("")
    const [password2, setPassword2] = useState("")

    const changeAccessCode = (n:string) => {
        setAccessCode(n)
    }
    const changeUserName = (n:string) => {
        setUserName(n)
    }
    const changePassword1 = (n:string) => {
        setPassword1(n)
    }
    const changePassword2 = (n:string) => {
        setPassword2(n)
    }

  return (
    <>
    <BackgroundWrapper />
    <div className="absolute left-1/4 w-1/2 pt-40">
            <div className="blurBox">
                <div className="text-3xl font-bold">Neuen Benutzer erstellen</div>
                <div>
                    <div className="m-auto w-1/3">
                        <TextEingabe onChange={changeAccessCode} input={accessCode} type="text" text="Freischaltcode deiner Schule" icon={null}/>
                    </div>
                    <TextEingabe onChange={changeUserName} input={userName} type="text" text="Dein Benutzername (Nur für dich sichtbar)" icon={null}/>
                    <TextEingabe onChange={changePassword1} input={password1} type="password" text="Passwort" icon={<FaLock />}/>
                    <TextEingabe onChange={changePassword2} input={password2} type="password" text="Passwort Wiederholen" icon={<FaLock />}/>
                    
                    <div className="flex-1">
                        <div className="btn btn-secondary bg-sky-500 rounded-full border-0 mt-10 pl-10 pr-10">Account Erstellen</div>
                    </div>
                    <div className="text-center">
                        <div className="pt-10" >
                            <div><a href="../login" className='pl-2 text-decoration-line: underline'>Zurück zum Login</a></div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
  )
}

export default CreateUser
