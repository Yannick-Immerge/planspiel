"use client";

import React, { useState,FormEvent } from 'react';
import {
  configureSessionPrototype,
  createSession,
  createUserForSession,
  logIn
} from "@/app/api/game_controller_interface";


export default function FormComponent() {
  const [productKey, setProductKey] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Create session
    const createResponse = await createSession(productKey, adminPassword); // TODO: Plain Text password
    if(!createResponse.ok || createResponse.data === null) {
      setMessage(`Error: ${createResponse.statusText}`);
      return;
    }

    // Login
    const loginResponse = await logIn(createResponse.data.administratorUsername, adminPassword);
    if(!loginResponse.ok) {
      setMessage(`Error: ${loginResponse.statusText}`);
      return;
    }

    // Create users
    for (let i = 0; i < 10; i++) {
      const userResponse = await createUserForSession();
      if(!userResponse.ok) {
        setMessage(`Error: ${userResponse.statusText}`);
        return;
      }
    }
    const configureResponse = await configureSessionPrototype();
    if(!configureResponse.ok) {
        setMessage(`Error: ${configureResponse.statusText}`);
        return;
    }
    setMessage("Success!");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="product_key">Product Key:</label>
          <input
            type="text"
            id="product_key"
            value={productKey}
            onChange={(e) => setProductKey(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="administrator_password">Set your password:</label>
          <input
            type="password"
            id="administrator_password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}