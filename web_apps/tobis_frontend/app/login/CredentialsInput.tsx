'use client'

import React, { useState } from 'react'
import CredentialsChecker, { CheckSessionCode } from './CredentialsChecker';
import TextEingabe from './TextEingabe';
import { FaLock, FaUser } from 'react-icons/fa';
import { MdGroups2 } from 'react-icons/md';

async function SHA265(props: {inputString: string}) : Promise<string> {
    // Let's pretend every User has their Suite Name Hashed instead of their Passwords.
    const encoder = new TextEncoder();
    const data = encoder.encode(props.inputString);
    const suiteSha256 = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(suiteSha256));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

const CredentialsInput = () => {
    const [username, setUsername] = useState("");
    const [enteredPassword, setEnteredPassword] = useState("");
    const [ruckmeldung, setRuckmeldung] = useState("");

    const [enteredSessionCode, setEnteredSessionKey] = useState("");

    const [confirmedSessionCode, setConfirmedSessionID] = useState("");

    const changeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {setUsername(event.target.value)};
    const changePassword = (event: React.ChangeEvent<HTMLInputElement>) => {setEnteredPassword(event.target.value)};
    const changeEnteredSessionCode = (event: React.ChangeEvent<HTMLInputElement>) => {setEnteredSessionKey(event.target.value)};

    const submitAuthenticationAttempt = async () => {
        setRuckmeldung("")
        let sha = ""
        await SHA265({inputString: enteredPassword}).then((result) => {sha = result})
        await CredentialsChecker(
            {   sessionCode: confirmedSessionCode, 
                username:username, 
                passwordSha256: sha})
            .then((result) => { if (result.allowed) {
                                    window.location.replace("/play")
                                } else {
                                    setRuckmeldung("Benutzername oder Passwort inkorrekt.");
                                }})
    }

    const submitSessionKeyAttempt = async () => {
        setRuckmeldung("")
        await CheckSessionCode({sessionCode: enteredSessionCode})
            .then((result: boolean) => {
                if (result) {
                    setConfirmedSessionID(enteredSessionCode);
                    setRuckmeldung("")
                } else {
                    setRuckmeldung("Diese Session existiert leider nicht.");
                }

            }
        ) 
    }

    const handleEnterOnAuthentication = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') submitAuthenticationAttempt()
    }

    const handleEnterOnSessionCode = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') submitSessionKeyAttempt()
    }
    
  return (
    <>
      <div className="absolute left-1/3 w-1/3 pt-40">
            <div className="blurBox">
                <div className="text-3xl font-bold">Login</div>
                {confirmedSessionCode != ""?
                <div>
                    <div className="pt-5">Session: {confirmedSessionCode}</div>
                    <TextEingabe
                        onKeyDown={handleEnterOnAuthentication}
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
                        onKeyDown={handleEnterOnAuthentication}
                        userFocus={false}
                        onBlur={null}
                        onFocus={null}
                        correction=""
                        describedby={"randomID102"}
                        validInput={true}
                        onChange={changePassword} 
                        input={enteredPassword} 
                        type="password" 
                        text="Passwort" 
                        icon={<FaLock />}/>
                        <div className='text-amber-400'>{ruckmeldung}</div>
                        <a href="#" className="text-left pl-1 text-decoration-line: underline">Passwort vergessen?</a>
                        <div className="flex-1">
                        <button onClick={submitAuthenticationAttempt} className="transition-all duration-200 hover:bg-sky-400 bg-sky-500 rounded-full border-0 mt-10 pt-5 pb-5 pl-10 pr-10">Login</button>
                    </div>
                    <div className="text-center">
                        <div className="pt-10" >
                            <div>Noch kein Account?<a href="../create-user" className='pl-2 text-decoration-line: underline'>Erstell dir einen!</a></div>
                        </div>
                    </div>
                    </div> : <div>
                    <TextEingabe
                        onKeyDown={handleEnterOnSessionCode}
                        userFocus={false}
                        onBlur={null}
                        onFocus={null}
                        correction=""
                        describedby={"randomID104"}
                        validInput={true}
                        onChange={changeEnteredSessionCode} 
                        input={enteredSessionCode} 
                        type="text" 
                        text="Session Code" 
                        icon={<MdGroups2 />}/>
                        <div className='text-amber-400'>{ruckmeldung}</div>
                        <div className="flex-1">
                        <button onClick={submitSessionKeyAttempt} className="transition-all duration-200 hover:bg-sky-400 bg-sky-500 rounded-full mr-10 border-0 mt-10 pt-5 pb-5 pl-10 pr-10">Weiter</button>
                        <button onClick={() => {window.location.replace("/create-session")}} className="transition-all duration-200 hover:bg-sky-700 bg-sky-800 rounded-full border-0 ml-5 mt-10 pt-4 pb-4 pl-8 pr-8">Neue Session</button>
                    </div>
                    <div className="text-center">
                        <div className="pt-10" >
                            <div>Noch kein Account?<a href="../create-user" className='pl-2 text-decoration-line: underline'>Erstell dir einen!</a></div>
                        </div>
                    </div>
                        </div>
                        
                        }
                    <div>
                    
                    
                </div>
            </div>
        </div>
    </>
  )
}

export default CredentialsInput