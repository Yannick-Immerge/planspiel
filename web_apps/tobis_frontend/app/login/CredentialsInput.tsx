'use client'

import React, { useEffect, useState } from 'react'
import TextEingabe from './TextEingabe';
import { FaLock, FaUser } from 'react-icons/fa';
import { hasUserPassword, logIn } from '../api/game_controller_interface';
import { Encode } from '../components/AuthenticationHelper';

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[€+&!@#$% _\-\?]).{8,28}$/;

const CredentialsInput = () => {
    const [headerText, setHeaderText] = useState("Login")
    const [enteredUsername, setEnteredUsername] = useState("");

    const [enteredPassword, setEnteredPassword] = useState("");
    const [passwordValid, setPasswordValid] = useState(false);

    const [enteredPasswordConfirmation, setEnteredPasswordConfirmation] = useState("");
    const [validPwdMatch, setValidPwdMatch] = useState(false);

    const [needsPassword, setNeedsPassword] = useState(false);
    
    useEffect (() => {
        const format = PWD_REGEX.test(enteredPassword)
        setPasswordValid(format);
    }, [needsPassword && enteredPassword])

    useEffect (() => {
        const matching = enteredPassword === enteredPasswordConfirmation;
        setValidPwdMatch(matching);
    }, [needsPassword && enteredPasswordConfirmation])

    const [ruckmeldung, setRuckmeldung] = useState("");    

    const changeEnteredUsername = (event: React.ChangeEvent<HTMLInputElement>) => {setEnteredUsername(event.target.value);};
    const changePassword = (event: React.ChangeEvent<HTMLInputElement>) => {setEnteredPassword(event.target.value)};
    const changePasswordConfirmation = (event: React.ChangeEvent<HTMLInputElement>) => {setEnteredPasswordConfirmation(event.target.value)};

    const submitAuthenticationAttempt = async () => {
        setRuckmeldung(`Submitting Authentication attempt...`)
        if (!(enteredUsername != "" && (!needsPassword || (passwordValid && validPwdMatch)))) return;
        await hasUserPassword(enteredUsername).then(async (response) => {
            if (!response.ok) {
                setRuckmeldung(`Benutzername oder Passwort falsch (0).`)
            } else if (needsPassword) {
                if (validPwdMatch && passwordValid) {
                    await logIn(enteredUsername, Encode(enteredPassword)).then((response) => {
                        if (!response.ok) {
                            setRuckmeldung(`Benutzername oder Passwort falsch.`)
                        } else if (response.data?.administrator) {
                            window.location.replace("../dashboard")
                        } else {
                            window.location.replace("../play")
                        }
                    })
                }
            } else if (response.data?.hasPassword) {
                setNeedsPassword(false);
                setRuckmeldung("")
                await logIn(enteredUsername, Encode(enteredPassword)).then((response) => {
                    if (!response.ok) {
                        setRuckmeldung(`Benutzername oder Passwort falsch.`)
                    } else if (response.data?.administrator) {
                        window.location.replace("../dashboard")
                    } else {
                        window.location.replace("../play")
                    }
                })
            } else {
                setNeedsPassword(true);
                setEnteredPassword("")
                setHeaderText("Willkommen,")
                setRuckmeldung("Bitte Lege ein sicheres Passwort für deinen Benutzer fest (und merke es dir gut 😉)")                
            }
        })
    }

    useEffect(() => { // Test if Password input has the right formatting
        const result = PWD_REGEX.test(enteredPassword);
        setPasswordValid(result);
    }, [enteredPassword && needsPassword]);

    useEffect(() => { // Check if the second Password entry matches the first
        const matches = (enteredPassword != "") && (enteredPassword === enteredPasswordConfirmation);
        setValidPwdMatch(matches)
    }, [enteredPassword, enteredPasswordConfirmation, needsPassword])

    const handleEnterOnAuthentication = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') submitAuthenticationAttempt()
    }
    
  return (
    <>
      <div className="absolute left-1/3 w-1/3 pt-40">
            <div className="blurBox">
                <div className="text-3xl font-bold">{headerText}</div>
                
                <div>
                    {!needsPassword? <TextEingabe
                        onKeyDown={handleEnterOnAuthentication}
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
                        icon={<FaUser />}/> : <div className="pt-2 pb-2 bg-[#fff1] rounded-full">{enteredUsername}</div>}

                    <TextEingabe
                        onKeyDown={handleEnterOnAuthentication}
                        userFocus={false}
                        onBlur={null}
                        onFocus={null}
                        correction="Dein Passwort sollte mindestens 8 Zeichen enthalten, darunter Klein- und Großbuchstaben, Zahlen und Sonderzeichen."
                        describedby={"randomID102"}
                        validInput={!needsPassword || passwordValid}
                        onChange={changePassword} 
                        input={enteredPassword} 
                        type="password" 
                        text={needsPassword? "Dein neues Passwort" : "Passwort"}
                        icon={<FaLock />}/>

                    {needsPassword? <TextEingabe
                        onKeyDown={handleEnterOnAuthentication}
                        userFocus={false}
                        onBlur={null}
                        onFocus={null}
                        correction="Passwörter stimmen nicht überein."
                        describedby={"randomID102"}
                        validInput={validPwdMatch}
                        onChange={changePasswordConfirmation} 
                        input={enteredPasswordConfirmation} 
                        type="password" 
                        text="Passwort wiederholen" 
                        icon={<FaLock />}/> : <div></div>}

                    <div className='text-amber-400'>{ruckmeldung}</div>
                    
                    <div className="flex-1">
                        <button onClick={submitAuthenticationAttempt} className="transition-all duration-200 hover:bg-sky-400 bg-sky-500 rounded-full border-0 mt-10 pt-5 pb-5 pl-10 pr-10">Login</button>
                        <button onClick={() => {window.location.replace("/create-session")}} className="transition-all duration-200 hover:bg-sky-700 bg-sky-800 rounded-full border-0 ml-5 mt-10 pt-4 pb-4 pl-8 pr-8">Neue Session</button>
                    </div>                    
                </div>                     
            </div>
        </div>
    </>
  )
}

export default CredentialsInput