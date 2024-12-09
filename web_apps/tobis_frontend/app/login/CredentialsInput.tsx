'use client'

import React, { FormEvent, useEffect, useState } from 'react'
import CredentialsChecker, { CheckSessionCode } from './CredentialsChecker';
import TextEingabe from './TextEingabe';
import { FaLock, FaUser } from 'react-icons/fa';
import { MdGroups2 } from 'react-icons/md';
import { createSession, existsUser, logIn } from '../api/game_controller_interface';
import { Encode } from '../components/AuthenticationHelper';
import { PassThrough } from 'stream';

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[€+&!@#$% _\-\?]).{8,28}$/;

const CredentialsInput = () => {

    const [enteredUsername, setEnteredUsername] = useState("");
    const [confirmedUsername, setConfirmedUsername] = useState("");

    const [enteredPassword, setEnteredPassword] = useState("");
    const [needsPassword, setNeedsPassword] = useState(false);
    const [validPwd, setValidPwd] = useState(false);
    const [validPwdMatch, setValidPwdMatch] = useState(false);

    const [enteredPasswordConfirmation, setEnteredPasswordConfirmation] = useState("");
    
    const [ruckmeldung, setRuckmeldung] = useState("");    

    const changeEnteredUsername = (event: React.ChangeEvent<HTMLInputElement>) => {setEnteredUsername(event.target.value); setConfirmedUsername("")};
    const changePassword = (event: React.ChangeEvent<HTMLInputElement>) => {setEnteredPassword(event.target.value)};

    const submitAuthenticationAttempt = async () => {
        setRuckmeldung("Versuche anzumelden...")
        await logIn(confirmedUsername, Encode(enteredPassword)).then((response) => {
            if (!response.ok) {
                setRuckmeldung(`Benutzername oder Passwort falsch.`)
            } else if (response.data?.administrator) {
                window.location.replace("../dashboard")
            } else {
                window.location.replace("../play")
            }
        })
    }

    useEffect(() => { // Test if Password input has the right formatting
        const result = PWD_REGEX.test(enteredPassword);
        setValidPwd(result);
    }, [enteredPassword && needsPassword]);

    useEffect(() => { // Check if the second Password entry matches the first
        const matches = (enteredPassword != "") && (enteredPassword === enteredPasswordConfirmation);
        setValidPwdMatch(matches)
    }, [enteredPassword, enteredPasswordConfirmation, needsPassword])

    // TODO Es ist mir wirklich ein Dorn im Auge dass wir vor der versuchen Passworteingabe schon 
    //      exposen ob der Benutzer existiert. Das würde ich in der Zukunft gerne ändern.
    const submitUsernameAttempt = async () => {
            setRuckmeldung(`Suche nach \"${enteredUsername}\"...`)
            await existsUser(enteredUsername).then((response) => {
                if (!response.ok) {
                    setRuckmeldung(`Da ist etwas mit dem Server schief gelaufen: ${response.statusText} bitte versuche es später erneut.`)
                } else if (response.data?.userExists) {
                    setConfirmedUsername(enteredUsername)
                    await hasPassword(confirmedUsername).then((response) => {
                        if (!response.ok) {
                            setRuckmeldung(`Da ist etwas mit dem Server schief gelaufen: ${response.statusText} bitte versuche es später erneut.`)
                        } else if (response.data?.hasPassword) {
                            setNeedsPassword(false);
                        } else {
                            setNeedsPassword(true);
                        }
                    })
                    setRuckmeldung("");
                } else {
                    setRuckmeldung("Benutzer existiert nicht.");
                }
            });
    }

    const handleEnterOnAuthentication = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') submitAuthenticationAttempt()
    }

    const handleEnterOnUsername = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') submitUsernameAttempt()
    }
    
  return (
    <>
      <div className="absolute left-1/3 w-1/3 pt-40">
            <div className="blurBox">
                <div className="text-3xl font-bold">Login</div>
                
                <div>
                    <TextEingabe
                        onKeyDown={(confirmedUsername != "")? handleEnterOnAuthentication : handleEnterOnUsername}
                        userFocus={false}
                        onBlur={null}
                        onFocus={null}
                        correction=""
                        describedby={"randomID100"}
                        validInput={true}
                        onChange={changeEnteredUsername} 
                        input={enteredUsername} 
                        type="text" 
                        text="Benutzername" 
                        icon={<FaUser />}/>

                    {(confirmedUsername != "")? <><TextEingabe
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
                        
                        </> : <div></div>}

                    <div className='text-amber-400'>{ruckmeldung}</div>
                    
                    <div className="flex-1">
                        <button onClick={(confirmedUsername != "")? submitAuthenticationAttempt : submitUsernameAttempt} className="transition-all duration-200 hover:bg-sky-400 bg-sky-500 rounded-full border-0 mt-10 pt-5 pb-5 pl-10 pr-10">{(confirmedUsername != "")? "Login" : "Weiter"}</button>
                        <button onClick={() => {window.location.replace("/create-session")}} className="transition-all duration-200 hover:bg-sky-700 bg-sky-800 rounded-full border-0 ml-5 mt-10 pt-4 pb-4 pl-8 pr-8">Neue Session</button>
                    </div>
                    <div className="text-center">
                        <div className="pt-10" >
                            <div>Noch kein Account?<a href="../create-user" className='pl-2 text-decoration-line: underline'>Erstell dir einen!</a></div>
                        </div>
                    </div>
                    </div> 
                    <div>
                </div>
            </div>
        </div>
    </>
  )
}

export default CredentialsInput