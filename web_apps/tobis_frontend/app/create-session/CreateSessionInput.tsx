"use client"

import React, { useEffect, useRef, useState } from 'react'
import { FaCheckCircle } from 'react-icons/fa';
import TextEingabe from '../login/TextEingabe';
import { TryCreateSession } from './page';

const USER_REGEX = /^[a-zA-Z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[€+&!@#$% _\-\?]).{8,28}$/;
const CODE_REGEX = /^[a-z0-9]{4}\-[a-z0-9]{4}\-[a-z0-9]{4}$/;

export default function CreateSessionInput() {
    const codeRef = useRef<HTMLInputElement>(null);
    const errRef = useRef<HTMLInputElement>(null);

    const [sessionKey, setSessionKey] = useState("")

    const [accessCode, setAccessCode] = useState("");
    const [validCode, setValidAccessCode] = useState(false);
    const [codeFocus, setFocusCode] = useState(false);

    const [userName, setUserName] = useState("");
    const [validName, setValidName] = useState(false);
    const [nameFocus, setFocusName] = useState(false);
    const [nameError, setNameError] = useState("");

    const [password, setPassword] = useState("");
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setFocusPwd] = useState(false);

    const [passwordMatch, setPasswordMatch] = useState("");
    const [validPwdMatch, setValidPwdMatch] = useState(false);
    const [pwdMatchFocus, setFocusPwdMatch] = useState(false);



    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (codeRef.current) codeRef.current.focus();
    }, [])

    useEffect(() => {// Test if username input has the right formatting
        let result = USER_REGEX.test(userName);
        console.log(result);
        console.log(userName);
        setNameError("Dein Benutzername sollte zwischen 4 und 24 Zeichen lang sein und nur Buchstaben, Zahlen und _ enthalten.");
        setValidName(result);
    }, [userName]);

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
        setErrMsg('');
    }, [userName, password, passwordMatch]);

    const changeAccessCode = (event: React.ChangeEvent<HTMLInputElement>) => {setAccessCode(event.target.value)}
    const changeUserName = (event: React.ChangeEvent<HTMLInputElement>) => {setUserName(event.target.value)}
    const changePassword = (event: React.ChangeEvent<HTMLInputElement>) => {setPassword(event.target.value)}
    const changePasswordMatch = (event: React.ChangeEvent<HTMLInputElement>) => {setPasswordMatch(event.target.value)}

    const submitForm = async () => {
        if (sessionKey != "") {
            setErrMsg("Deine Session existiert bereits unter dem Session Code: ")
            return;
        }

        const response = await TryCreateSession({prodKey: accessCode})
            .then((result) => { if (result) {
                setErrMsg("Deine Session wurde erfolgreich erstellt! Der Session Code ist");
                setSessionKey(result)
            } else {
                setErrMsg("Es gab ein Problem mit deinem Session key. Geh sicher dass du ihn richtig abgetippt hast und deine Lizenz noch gültig ist.");
                setSessionKey("")
            }})
    }

    const handleKeyDown = async (event: React.KeyboardEvent) => {
        
      if (event.key === 'Enter') {
        if (validPwdMatch && validCode && validName && validPwd) submitForm();
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
                        userFocus={codeFocus}
                        onFocus={() => setFocusCode(true)} 
                        onBlur={() => setFocusCode(false)}  
                        validInput={validCode}
                        onChange={changeAccessCode} 
                        input={accessCode} 
                        type="text" 
                        text="Freischaltcode deiner Schule" 
                        correction='Der Freischaltcode sollte ein Format wie "ab12-cd34-ef56" haben.'
                        icon={validCode? <FaCheckCircle /> : null}/>
                    </div>
                    <TextEingabe 
                        onKeyDown={handleKeyDown}
                        describedby='randomID2'
                        userFocus={nameFocus}
                        onFocus={() => setFocusName(true)}
                        onBlur={() => setFocusName(false)}
                        validInput={validName}
                        onChange={changeUserName} 
                        input={userName} 
                        type="text" 
                        text="Dein Benutzername (Fur zukünftige Anmeldungen)" 
                        correction={nameError}
                        icon={validName? <FaCheckCircle /> : null}/>
                        
                    <TextEingabe 
                        onKeyDown={handleKeyDown}
                        describedby='randomID3'
                        userFocus={pwdFocus}
                        onFocus={() => setFocusPwd(true)}
                        onBlur={() => setFocusPwd(false)}
                        validInput={validPwd}
                        onChange={changePassword} 
                        input={password} 
                        type="password" 
                        text="Dein Passwort" 
                        correction='Bitte wähle ein Passwort mit mindestens 8 Zeichen, Kleinbuchstaben, Großbuchstaben und mindestens einem Sonderzeichen und einer Zahl'
                        icon={validPwd? <FaCheckCircle /> : null}/>
                    <TextEingabe 
                        onKeyDown={handleKeyDown}
                        describedby='randomID4'
                        userFocus={pwdMatchFocus}
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
                        {sessionKey == ""? <button onKeyUp={submitForm} onClick={submitForm} disabled={!(validPwdMatch && validCode && validName && validPwd)} className="disabled:bg-slate-500 hover:bg-sky-400 bg-sky-500 rounded-full border-0 mt-10 pt-5 pb-5 pl-10 pr-10">Session Aktivieren</button> : <div></div>}
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
