'use client'
import React, { useState } from 'react'
import TextEingabe from './TextEingabe'
import { FaUser, FaLock } from "react-icons/fa"
import CredentialsChecker from './CredentialsChecker'


const CredentialsInput = async () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [ruckmeldung, setRuckmeldung] = useState("");

    const changeUsername = (event: any) => {setUsername(event.target.value)};
    const changePassword = (event: any) => {setPassword(event.target.value)};

    const click = async () => {
        await CredentialsChecker({username:username, passwordSha256: password})
            .then((result) => setRuckmeldung(result))
    }

    return (
        <div className="absolute left-1/3 w-1/3 pt-40">
            <div className="blurBox">
                <div className="text-3xl font-bold">Login</div>
                <div>
                    <TextEingabe onChange={changeUsername} input={username} type="text" text="Benutzername" icon={<FaUser />}/>
                    <TextEingabe onChange={changePassword} input={password} type="password" text="Passwort" icon={<FaLock />}/>
                    <a href="#" className="text-left pl-1 text-decoration-line: underline">Passwort vergessen?</a>
                    <div>{ruckmeldung}</div>
                    <div className="flex-1">
                        <div onClick={click} className="btn btn-secondary bg-sky-500 rounded-full border-0 mt-10 pl-10 pr-10">Login</div>
                    </div>
                    <div className="text-center">
                        <div className="pt-10" >
                            <div>Noch kein Account?<a href="../create-user" className='pl-2 text-decoration-line: underline'>Erstell dir einen!</a></div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
  )
}

export default CredentialsInput
