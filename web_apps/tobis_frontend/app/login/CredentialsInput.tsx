'use client'

import React, { useState } from 'react'
import CredentialsChecker from './CredentialsChecker';
import TextEingabe from './TextEingabe';
import { FaLock, FaUser } from 'react-icons/fa';

function TryAuthenticate() {

}

const CredentialsInput = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [ruckmeldung, setRuckmeldung] = useState("");

    const changeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {setUsername(event.target.value)};
    const changePassword = (event: React.ChangeEvent<HTMLInputElement>) => {setPassword(event.target.value)};

    const submitAuthenticationAttempt = async () => {
        setRuckmeldung("")
        await CredentialsChecker({username:username, passwordSha256: password})
            .then((result) => { if (result.allowed) {
                                    window.location.replace("/play")
                                } else {
                                    setRuckmeldung("Benutzername oder Passwort inkorrekt.");
                                }})
    }

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') submitAuthenticationAttempt()
    }
    
  return (
    <>
      <div className="absolute left-1/3 w-1/3 pt-40">
            <div className="blurBox">
                <div className="text-3xl font-bold">Login</div>
                <div>
                    <TextEingabe
                        onKeyDown={handleKeyPress}
                        userFocus={false}
                        onBlur={null}
                        onFocus={null}
                        correction=""
                        describedby={"randomID100"}
                        validInput={true}
                        onChange={changeUsername} 
                        input={username} 
                        type="text" 
                        text="Benutzername" 
                        icon={<FaUser />}/>

                    <TextEingabe
                        onKeyDown={handleKeyPress}
                        userFocus={false}
                        onBlur={null}
                        onFocus={null}
                        correction=""
                        describedby={"randomID102"}
                        validInput={true}
                        onChange={changePassword} 
                        input={password} 
                        type="password" 
                        text="Passwort" 
                        icon={<FaLock />}/>
                    <div className='text-amber-400'>{ruckmeldung}</div>
                    <a href="#" className="text-left pl-1 text-decoration-line: underline">Passwort vergessen?</a>
                    
                    <div className="flex-1">
                        <button onClick={submitAuthenticationAttempt} className="disabled:bg-slate-500 hover:bg-sky-400 bg-sky-500 rounded-full border-0 mt-10 pt-5 pb-5 pl-10 pr-10">Login</button>
                    </div>
                    <div className="text-center">
                        <div className="pt-10" >
                            <div>Noch kein Account?<a href="../create-user" className='pl-2 text-decoration-line: underline'>Erstell dir einen!</a></div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default CredentialsInput