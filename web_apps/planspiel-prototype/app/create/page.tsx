"use client";

import React, { useState,FormEvent, useEffect } from 'react';
import {
  configureSessionPrototype,
  createSession,
  createUserForSession,
  logIn
} from "@/app/api/game_controller_interface";
import { FaKey, FaLock, FaPoo } from 'react-icons/fa';
import { TextEingabe } from '../components/TextEingabe';
import {useRouter} from "next/navigation";

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[€+&!@#$% _\-\?]).{8,28}$/;

export default function FormComponent() {
  const [productKey, setProductKey] = useState('');
  const [validProductKey, setProductKeyValid] = useState(true)
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordValid, setAdminPasswordValid] = useState(false)
  const [adminPasswordConfirmation, setAdminPasswordConfirmation] = useState('')
  const [adminPasswordConfirmationValid, setAdminPasswordConfirmationValid] = useState(false)
  const [message, setMessage] = useState('');
  
  useEffect(() => { // Test if Password input has the right formatting
    const result = PWD_REGEX.test(adminPassword);
    console.log(result);
    console.log(adminPassword);
    setAdminPasswordValid(result);
  }, [adminPassword]);

  useEffect(() => { // Check if the second Password entry matches the first
      const matches = (adminPassword != "") && (adminPassword === adminPasswordConfirmation);
      setAdminPasswordConfirmationValid(matches)
  }, [adminPassword, adminPasswordConfirmation])

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    if (!adminPasswordValid || !adminPasswordConfirmationValid) return;
    e.preventDefault();
    // Create session
    const createResponse = await createSession(productKey, adminPassword); // TODO: Plain Text password
    if(!createResponse.ok || createResponse.data === null) {
      setProductKeyValid(false)
      setMessage(`Error: ${createResponse.statusText}`);
      return;
    }
    setProductKeyValid(true)

    // Login
    const loginResponse = await logIn(createResponse.data.administratorUsername, adminPassword);
    if(!loginResponse.ok) {
      setMessage(`Error: ${loginResponse.statusText}`);
      return;
    }

    let n_users = 2;
    // Create users
    for (let i = 0; i < n_users; i++) {
      const userResponse = await createUserForSession();
      if(!userResponse.ok) {
        setMessage(`Error: ${userResponse.statusText}`);
        return;
      }
    }

    let configureResponse;
    if (n_users == 10) {
      configureResponse = await configureSessionPrototype("friday_trial_10_users");
    } else if (n_users == 2) {
      configureResponse = await configureSessionPrototype("friday_trial_2_users");
    } else {
      configureResponse = await configureSessionPrototype("friday_trial");
    }

    if(!configureResponse.ok) {
        setMessage(`Error: ${configureResponse.statusText}`);
        return;
    }
    setMessage("Session erfolgereich erstellt!");  
    //setMessage("Session erfolgereich erstellt! Du kannst dich in Zukunft mit folgendem Benutzernamen anmelden: \"" + createResponse.data.administratorUsername + "\" Bitte merk ihn dir.");
  };

  

  return (
    <div className="pt-40 bg-cover bg-center bg-no-repeat bg-[url(/images/EarthTint.png)] min-h-screen bg-fixed">
      <div className="p-10 w-1/3 m-auto backdrop-blur-xl rounded-2xl shadow-[10px_10px_10px_rgba(0,0,0,0.8)]">
      <div className="pb-10 text-center text-3xl font-bold">Neue Session Erstellen</div>
        <form onSubmit={handleSubmit}>

            <TextEingabe 
              type="text"
              describedby="product_key_new"
              value={productKey}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductKey(e.target.value)}
              icon={validProductKey? <FaKey /> : <FaPoo color='#B2846B'/>}
              onKeyDown={(e) => handleSubmit}
              placeholdertext='Produktschlüssel'
              validInput={validProductKey}
              correction='Wir haben diesen Produktschlüssel nicht gefunden. Bitte stelle sicher, dass du ihn richtig abgetippt hast.'
            />
            <div className="mb-[3%]"></div>
            <TextEingabe 
              type="password"
              describedby="administrator_password_new"
              value={adminPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminPassword(e.target.value)}
              icon={!adminPassword? <FaLock /> : (adminPasswordValid)? <FaLock color="#79E580"/> : <FaPoo color='#B2846B'/>}
              onKeyDown={(e) => handleSubmit}
              placeholdertext='Dein Neues Administrator-Passwort'
              validInput={adminPasswordValid}
              correction='Bitte lege ein Passwort fest, welches Kleinbuchstaben, Großbuchstaben, Zahlen und Sonderzeichen enthält und mindestens 8 Zeichen hat.'
            />

          <TextEingabe 
              type="password"
              describedby="administrator_password_confirmation_new"
              value={adminPasswordConfirmation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminPasswordConfirmation(e.target.value)}
              icon={!adminPasswordConfirmation? <FaLock /> : (adminPasswordConfirmationValid || !adminPasswordConfirmation)? <FaLock color="#79E580"/> : <FaPoo color='#B2846B'/>}
              onKeyDown={(e) => handleSubmit}
              placeholdertext='Passwort wiederholen'
              validInput={adminPasswordConfirmationValid}
              correction='Die zwei Eingaben stimmen nicht überein.'
            />
          {message? 
            <p className="bg-[#79E58033] p-3 rounded-xl grid">
              {message}
              <button onClick={() => router.push("/dashboard")} className="m-auto bg-sky-500 hover:bg-sky-400 disabled:bg-slate-500 active:bg-sky-600 transition-all duration-200 rounded-full pt-3 pb-3 pl-6 pr-6">
                Öffne meine Session!</button>
            </p> 
          :
            <div className="flex mt-5 mb-5">
              <button onClick={() => handleSubmit} disabled={!adminPasswordValid || !adminPasswordConfirmationValid} 
                className="m-auto bg-sky-500 hover:bg-sky-400 disabled:bg-slate-500 active:bg-sky-600 transition-all duration-200 rounded-full pt-4 pb-4 pl-8 pr-8">
                Session erstellen!</button>
            </div>    
          }
        </form>  
          <div className="text-center">
            <div className="pt-5" >
              <div><a href="/login" className='pl-2 text-decoration-line: underline'>Zurück zum Login</a></div>
            </div>
          </div>
      </div>
    </div>
  );
}
