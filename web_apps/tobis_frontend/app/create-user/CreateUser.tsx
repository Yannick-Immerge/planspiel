"use client"

import React, { useEffect, useRef, useState } from 'react'
import { FaCheckCircle } from 'react-icons/fa';
import TextEingabe from '../login/TextEingabe';
import { createUserForSession, existsSession, existsUser } from '../api/game_controller_interface';

const USER_REGEX = /^[a-zA-Z]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[€+&!@#$% _\-\?]).{8,28}$/;
const CODE_REGEX = /^[A-Z0-9]{3}\-[A-Z0-9]{3}$/;

export default function CreateUser() {
    const codeRef = useRef<HTMLInputElement>(null);
    const errRef = useRef<HTMLInputElement>(null);

    const [sessionCode, setSessionCode] = useState("");
    const [validSessionCode, setValidSessionCode] = useState(false);
    const [sessionCodeFocus, setFocusSessionCode] = useState(false);

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
        setNameError("Dein Benutzername sollte zwischen 3 und 24 Zeichen lang sein und nur Buchstaben enthalten.");
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
        // const result = CODE_REGEX.test(sessionCode); TODO: Disable for Testing
        const result = true;
        console.log(result);
        console.log(sessionCode);
        setValidSessionCode(result);
    }) 

    useEffect(() => {
        setErrMsg('');
    }, [userName, password, passwordMatch]);

    const changeAccessCode = (event: React.ChangeEvent<HTMLInputElement>) => {setSessionCode(event.target.value)}
    const changeUserName = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(event.target.value)
    }
    const changePassword = (event: React.ChangeEvent<HTMLInputElement>) => {setPassword(event.target.value)}
    const changePasswordMatch = (event: React.ChangeEvent<HTMLInputElement>) => {setPasswordMatch(event.target.value)}

    const submitForm = async () => {
        await existsUser(userName)
            .then((answer) => {
                if (answer.ok && answer.authenticationOk) {
                    if (answer.data?.userExists) {
                        setErrMsg("Unter diesem Namen gibt es schon eine Anmeldung. Bitte wende dich an deine Lehrkraft.")
                        return;
                    }
                } else {
                    setErrMsg("Es gab ein Problem mit der Kommunikation zum Server. Bitte versuche es späte erneut.")
                    return;
                }})
            .catch(console.error.bind(console))
        await existsSession(sessionCode)
            .then((answer) => {
                if (answer.ok && answer.authenticationOk) {
                    if (answer.data?.sessionExists) {
                        // TODO Hier sollte ein User erstellt werden
                        window.location.replace("/create-user/success")
                        return;
                    } else {
                        setErrMsg("Diese Session existiert nicht. Geh sicher dass du den Session Code richtig abgetippt hast.")
                    }
                } else {
                    setErrMsg("Es gab ein Problem mit der Kommunikation zum Server. Bitte versuche es späte erneut.")
                    return;
                }});
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        if (validPwdMatch && validSessionCode && validName && validPwd) submitForm();
      }
    }

  return (
    <div className="blurBox">
        <div className="text-3xl font-bold">Neuen Benutzer erstellen</div>
          <div>
              <div ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive"></div>
                <div className="m-auto w-1/3">
                    <TextEingabe
                        onKeyDown={handleKeyDown}
                        describedby='randomId1'
                        userFocus={sessionCodeFocus}
                        onFocus={() => setFocusSessionCode(true)} 
                        onBlur={() => setFocusSessionCode(false)}  
                        validInput={validSessionCode}
                        onChange={changeAccessCode} 
                        input={sessionCode} 
                        type="text" 
                        text="Session Code deiner Schule" 
                        correction="Das hat nicht hingehauen."
                        icon={validSessionCode? <FaCheckCircle /> : null}/>
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
                        text="Dein Benutzername (Von deiner Lehrkraft bereitgestellt)" 
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
                        <button onKeyUp={submitForm} onClick={submitForm} disabled={!(validPwdMatch && validSessionCode && validName && validPwd)} className="disabled:bg-slate-500 hover:bg-sky-400 bg-sky-500 rounded-full border-0 mt-10 pt-5 pb-5 pl-10 pr-10">Account Erstellen</button>
                    </div>
                    <div className="text-center">
                        <div className="pt-10" >
                            <div><a href="/login" className='pl-2 text-decoration-line: underline'>Zurück zum Login</a></div>
                            
                        </div>
                    </div>
                </ div>
            </div>
  )
}