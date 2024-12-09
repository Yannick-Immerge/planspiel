"use client"

import React, { useEffect, useRef, useState } from 'react'
import { FaCheckCircle } from 'react-icons/fa';
import TextEingabe from '../login/TextEingabe';
import { TryCreateSession } from './page';
import { createSession } from '../api/game_controller_interface';

const USER_REGEX = /^[a-zA-Z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[€+&!@#$% _\-\?]).{8,28}$/;
const CODE_REGEX = /^[a-z0-9]{4}\-[a-z0-9]{4}\-[a-z0-9]{4}$/;

export default function CreateSessionInput() {
    const codeRef = useRef<HTMLInputElement>(null);
    const errRef = useRef<HTMLInputElement>(null);

    const [sessionKey, setShownUsername] = useState("")

    const [accessCode, setAccessCode] = useState("");
    const [validAccessCode, setValidAccessCode] = useState(false);
    const [focusOnAccessCode, setFocusAccessCode] = useState(false);

    const [password, setPassword] = useState("");
    const [validPwd, setValidPwd] = useState(false);
    const [focusOnPassword, setFocusPwd] = useState(false);

    const [passwordMatch, setPasswordMatch] = useState("");
    const [validPwdMatch, setValidPwdMatch] = useState(false);
    const [focusOnPasswordMatch, setFocusPwdMatch] = useState(false);



    const [errMsg, setYellowMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (codeRef.current) codeRef.current.focus();
    }, [])

    useEffect(() => { // Test if Password input has the right formatting
        const result = PWD_REGEX.test(password);
        console.log(result);
        console.log(password);
        setValidPwd(result);
    }, [password]);

    useEffect(() => { // Check if the second Password entry matches the first
        const matches = (password != "") && (password === passwordMatch);
        setValidPwdMatch(matches)
    }, [password, passwordMatch])

    useEffect(() => { // Test if Access Code input has the right formatting
        // const result = CODE_REGEX.test(accessCode); TODO: Disabled for testing purposes
        const result = true;
        console.log(result);
        console.log(accessCode);
        setValidAccessCode(result);
    }) 

    useEffect(() => {
        setYellowMsg('');
    }, [password, passwordMatch]);

    const changeAccessCode = (event: React.ChangeEvent<HTMLInputElement>) => {setAccessCode(event.target.value)}
    const changePassword = (event: React.ChangeEvent<HTMLInputElement>) => {setPassword(event.target.value)}
    const changePasswordMatch = (event: React.ChangeEvent<HTMLInputElement>) => {setPasswordMatch(event.target.value)}

    const tryCreateSession = async () => {
        setYellowMsg("Versuche anzumelden...");
        await createSession(accessCode, "Verschlüsselt(" + passwordMatch + ")")
            .then((result) => { if (result.ok) {
                                    setYellowMsg("Deine Session wurde erfolgreich erstellt! Du kannst dich jetzt mit deinem neuen Passwort unter dem folgenden Benutzernamen anmelden:")
                                    setShownUsername(result.data?.administratorUsername? result.data?.administratorUsername : "ERROR");
                                } else {
                                    setYellowMsg("Das hat leider nicht geklappt. Stell sicher dass du den Produktschlüssel richtig abgetippt hast.");
                                }
                                
                            })
            .catch((error) => { setYellowMsg(`Es gab ein Problem mit dem Server: ${error}. Bitte versuche es später erneut.`) })
    }

    const handleKeyDown = async (event: React.KeyboardEvent) => {
        
      if (event.key === 'Enter') {
        if (validPwdMatch && validAccessCode && validPwd) tryCreateSession();
      }
    }

  return (
    <div className="blurBox">
        <div className="text-3xl font-bold">Neuen Session starten</div>
          <div>
              <div ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive"></div>
                <div className="m-auto w-1/3">
                    <TextEingabe
                        onKeyDown={handleKeyDown}
                        describedby='randomId1'
                        userFocus={focusOnAccessCode}
                        onFocus={() => setFocusAccessCode(true)} 
                        onBlur={() => setFocusAccessCode(false)}  
                        validInput={validAccessCode}
                        onChange={changeAccessCode} 
                        input={accessCode} 
                        type="text" 
                        text="Freischaltcode deiner Schule" 
                        correction='Der Freischaltcode sollte ein Format wie "ab12-cd34-ef56" haben.'
                        icon={null}/>
                    </div>
                        
                    <TextEingabe 
                        onKeyDown={handleKeyDown}
                        describedby='randomID3'
                        userFocus={focusOnPassword}
                        onFocus={() => setFocusPwd(true)}
                        onBlur={() => setFocusPwd(false)}
                        validInput={validPwd}
                        onChange={changePassword} 
                        input={password} 
                        type="password" 
                        text="Dein Admin-Passwort" 
                        correction='Bitte wähle ein Passwort mit mindestens 8 Zeichen, Kleinbuchstaben, Großbuchstaben und mindestens einem Sonderzeichen und einer Zahl'
                        icon={validPwd? <FaCheckCircle /> : null}/>
                    <TextEingabe 
                        onKeyDown={handleKeyDown}
                        describedby='randomID4'
                        userFocus={focusOnPasswordMatch}
                        onFocus={() => setFocusPwdMatch(true)}
                        onBlur={() => setFocusPwdMatch(false)}
                        validInput={validPwdMatch}
                        onChange={changePasswordMatch} 
                        input={passwordMatch} 
                        type="password" 
                        text="Passwort Wiederholen" 
                        correction="Die Passwörter stimmen nicht überein."
                        icon={validPwdMatch? <FaCheckCircle /> : null}/>
                    
                    <div className="flex-1">
                        {sessionKey == ""? <button onClick={tryCreateSession} disabled={!(validPwdMatch && validAccessCode && validPwd)} className="disabled:bg-slate-500 hover:bg-sky-400 bg-sky-500 rounded-full border-0 mt-10 pt-5 pb-5 pl-10 pr-10 transition-all active:bg-sky-600 duration-100">Session Aktivieren</button> : <div></div>}
                    </div>
                    <div className="text-amber-400">
                        {errMsg}
                    </div>
                    {sessionKey == ""? <div></div> : <div className="bg-sky-900 text-3xl rounded-full pt-5 pb-5 ml-20 mr-20">
                        {sessionKey}
                    </div>}
                    <div className="text-center">
                        <div className="pt-10" >
                            <div><a href="/login" className='pl-2 text-decoration-line: underline'>Zurück zum Login</a></div>
                            
                        </div>
                    </div>
                </ div>
            </div>
  )
}
