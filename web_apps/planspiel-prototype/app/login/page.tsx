"use client";

import React, { useState,FormEvent } from 'react';
import {useRouter} from "next/navigation";
import {logIn} from "@/app/api/game_controller_interface";
import { TextEingabe } from '../components/TextEingabe';
import { FaLock, FaUser } from 'react-icons/fa';

export default function FormComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    setMessage(`Einloggen...`);
    const response = await logIn(username, password); // TODO: Plain Text password
    if (response.ok && response.data !== null) {
        router.push(response.data.administrator ? "/dashboard" : "/play")
    } else {
        setMessage(`Benutzername oder Passwort inkorrekt.`);
    }
    
  };

  const handleEnterOnAuthentication = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleSubmit()
  }

  return (
    <>
    <title>Planet Council Login</title>
    <div className="pt-40 bg-cover bg-center bg-no-repeat bg-[url(/images/EarthTint.png)] min-h-screen bg-fixed">
      <div className="p-10 w-1/3 max-lg:w-1/2 max-md:w-3/4 m-auto backdrop-blur-xl rounded-2xl shadow-[10px_10px_10px_rgba(0,0,0,0.8)]">
          <div className="pb-10 text-center text-3xl font-bold">Login</div>
          <TextEingabe 
            onKeyDown={handleEnterOnAuthentication}
            type="text"
            describedby="username"
            placeholdertext="Benutzername (Von deiner Lehrkraft zugewiesen)"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            icon={<FaUser />}
            />
          <div className="mb-[5%]"></div>
          <TextEingabe 
            onKeyDown={handleEnterOnAuthentication}
            type="password"
            describedby="password"
            placeholdertext="Passwort"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            icon={<FaLock />}
            />
            <div className="mb-[5%]"></div>
        <div className='ml-16 text-amber-400'>{message}</div>
        <div className="mb-[5%]"></div>
        <div className="flex w-3/4 m-auto mb-5 mt-5">
          <button onClick={handleSubmit} className="bg-sky-500 hover:bg-sky-400 active:bg-sky-600 transition-all duration-200 m-auto rounded-full pt-4 pb-4 pl-8 pr-8 text-center">Login</button>
          <div id="spacer" className="w-5"></div>
          <button onClick={() => {window.location.replace("/create")}} className="transition-all duration-200 m-auto hover:bg-sky-700 bg-sky-800 rounded-full border-0 pt-4 pb-4 pl-8 pr-8">Neue Session</button>
        </div>
      </div>
    </div>
    </>
  );
}
