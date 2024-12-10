"use client";

import React, { useState,FormEvent } from 'react';
import {useRouter} from "next/navigation";
import {logIn} from "@/app/api/game_controller_interface";

export default function FormComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(`Text`);
    const response = await logIn(username, password); // TODO: Plain Text password
    if (response.ok && response.data !== null) {
        router.push(response.data.administrator ? "/dashboard" : "/play")
    } else {
        setMessage(`Error: ${response.statusText}`);
    }
    setMessage(`Text`);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username (assigned):</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}